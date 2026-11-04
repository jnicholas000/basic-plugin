// Offline contract tests only: no Docker, compiler, child process, or network calls.
// First execution belongs to the producer after the independently frozen authorship.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContainerArgs, verifyContainerPolicy, verifyContainedObservation } from '../docs/spikes/fixtures/run-inert-confinement-control.mjs';

const options = {
  imageId: `sha256:${'a'.repeat(64)}`,
  name: 'basic-inert-0123456789abcdef',
  uid: 1001,
  gid: 1002,
  input: '/owned/inert/input',
  output: '/owned/inert/output',
  hostCanary: '/owned/inert/host-only-canary',
  nonce: '0123456789abcdef',
};
const command = ['contained', '/input/readable', '/output/result.txt', '/root-write-control', options.hostCanary];
const envKeys = ['FIXTURE_VISIBLE', 'HOME', 'HOSTNAME', 'PATH'];
const clone = value => structuredClone(value);
const policy = () => ({
  imageId: options.imageId,
  label: options.nonce,
  user: `${options.uid}:${options.gid}`,
  entrypoint: ['/probe'],
  cmd: [...command],
  workingDir: '/',
  networkMode: 'none',
  readOnly: true,
  privileged: false,
  capAdd: [],
  capDrop: ['ALL'],
  securityOpt: ['no-new-privileges'],
  pidMode: '',
  ipcMode: 'private',
  cgroupnsMode: 'private',
  pidsLimit: 32,
  memory: 134217728,
  nanoCpus: 1000000000,
  devices: [],
  deviceRequests: [],
  envKeys: [...envKeys],
  mounts: [
    { type: 'bind', source: options.input, destination: '/input', rw: false, propagation: 'rprivate' },
    { type: 'bind', source: options.output, destination: '/output', rw: true, propagation: 'rprivate' },
  ],
});
const observation = () => ({
  mode: 'contained', uid: options.uid, gid: options.gid, pid: 1,
  allowedRead: true, allowedWrite: true, hostRead: false,
  inputWriteErrno: 30, rootWriteErrno: 30, hostReadErrno: 2, hostWriteErrno: 2,
  interfaces: 1, nonLoopback: 0,
  effectiveCaps: 0, permittedCaps: 0, inheritableCaps: 0,
  noNewPrivs: 1, seccomp: 2, fakeEnv: false, envKeys: [...envKeys],
});

function createFlags(args, imageIndex) {
  const flags = new Map();
  const allowed = new Set(['name', 'label', 'user', 'read-only', 'network', 'cap-drop', 'security-opt', 'ipc', 'cgroupns', 'pids-limit', 'memory', 'cpus', 'pull', 'workdir', 'hostname', 'log-driver', 'env', 'mount']);
  for (let i = 1; i < imageIndex; ++i) {
    assert.match(args[i], /^--/, 'every pre-image argument is an explicit fixed option');
    const separator = args[i].indexOf('=');
    const key = args[i].slice(2, separator < 0 ? undefined : separator);
    assert.ok(allowed.has(key), `unexpected create option: ${key}`);
    let value;
    if (key === 'read-only' && separator < 0) value = 'true';
    else if (separator >= 0) value = args[i].slice(separator + 1);
    else {
      assert.ok(i + 1 < imageIndex, `${key} needs a value`);
      value = args[++i];
    }
    assert.equal(typeof value, 'string');
    if (!flags.has(key)) flags.set(key, []);
    flags.get(key).push(value);
  }
  return flags;
}

function bindSpec(value) {
  const fields = new Map();
  for (const item of value.split(',')) {
    const equals = item.indexOf('=');
    let key = equals < 0 ? item : item.slice(0, equals);
    const content = equals < 0 ? 'true' : item.slice(equals + 1);
    if (key === 'src') key = 'source';
    if (key === 'dst' || key === 'target') key = 'destination';
    if (key === 'ro') key = 'readonly';
    assert.ok(['type', 'source', 'destination', 'readonly', 'bind-propagation'].includes(key));
    assert.ok(!fields.has(key), 'mount aliases must not supply duplicate settings');
    fields.set(key, content);
  }
  assert.ok(['true', 'false'].includes(fields.get('readonly') ?? 'false'));
  return {
    type: fields.get('type'), source: fields.get('source'), destination: fields.get('destination'),
    rw: (fields.get('readonly') ?? 'false') === 'false', propagation: fields.get('bind-propagation'),
  };
}

test('create arguments encode only the owned image, fixed inert command and exact confinement policy', () => {
  const before = clone(options);
  const args = buildContainerArgs(options);
  assert.deepEqual(options, before);
  assert.ok(Array.isArray(args) && args.every(value => typeof value === 'string'));
  assert.equal(args[0], 'create');
  const imageIndex = args.indexOf(options.imageId);
  assert.ok(imageIndex > 0);
  assert.equal(args.lastIndexOf(options.imageId), imageIndex);
  assert.deepEqual(args.slice(imageIndex + 1), command, 'image ENTRYPOINT supplies /probe exactly once');
  const flags = createFlags(args, imageIndex);
  const exact = {
    name: options.name, label: `personal.basic.confinement=${options.nonce}`,
    user: `${options.uid}:${options.gid}`, 'read-only': 'true', network: 'none',
    'cap-drop': 'ALL', 'security-opt': 'no-new-privileges', ipc: 'private', cgroupns: 'private',
    'pids-limit': '32', cpus: '1', pull: 'never', workdir: '/', hostname: 'fixture', 'log-driver': 'none',
  };
  for (const [key, value] of Object.entries(exact)) assert.deepEqual(flags.get(key), [value], key);
  assert.equal(flags.get('memory')?.length, 1);
  assert.ok(['128m', '134217728'].includes(flags.get('memory')[0]));
  assert.deepEqual([...(flags.get('env') ?? [])].sort(), ['FIXTURE_VISIBLE=synthetic', 'HOME=/nonexistent', 'PATH=/usr/bin:/bin']);
  const mounts = (flags.get('mount') ?? []).map(bindSpec).sort((a, b) => a.destination < b.destination ? -1 : 1);
  assert.deepEqual(mounts, policy().mounts);
  assert.equal(flags.size, Object.keys(exact).length + 3, 'only memory, env and mounts supplement fixed flags');
  assert.deepEqual(buildContainerArgs(options), args, 'pure deterministic argument builder');
});

test('create builder rejects invalid identity, owned paths and unrecognized options', () => {
  assert.ok(Array.isArray(buildContainerArgs(options)), 'real builder positive control');
  for (const [name, change] of [
    ['root uid', { uid: 0 }], ['root gid', { gid: 0 }], ['fractional uid', { uid: 1.5 }],
    ['negative gid', { gid: -1 }], ['uid outside bound', { uid: 2147483648 }],
    ['string identity', { gid: '1002' }], ['unbound image tag', { imageId: 'fixture:latest' }],
    ['malformed image hash', { imageId: `sha256:${'g'.repeat(64)}` }],
    ['unsafe name', { name: 'fixture --privileged' }], ['unsafe nonce', { nonce: 'invalid' }],
    ['relative input', { input: 'owned/input' }], ['comma output', { output: '/owned/output,readonly' }],
    ['newline input', { input: '/owned/input\nextra' }], ['NUL canary', { hostCanary: '/owned/canary\0extra' }],
    ['traversal path', { input: '/owned/../input' }], ['same bind roots', { output: options.input }],
    ['canary within input', { hostCanary: `${options.input}/canary` }],
    ['canary within output', { hostCanary: `${options.output}/canary` }],
    ['unknown command interface', { command: ['/bin/sh'] }], ['unknown option', { extra: true }],
  ]) assert.throws(() => buildContainerArgs({ ...options, ...change }), Error, name);
});

test('effective policy validator accepts the owned policy and rejects concrete containment tampering', () => {
  const good = policy();
  assert.equal(verifyContainerPolicy(good, options), true);
  const absence = { ...policy(), capAdd: null, devices: null, deviceRequests: null, envKeys: [...envKeys].reverse(), mounts: [...policy().mounts].reverse() };
  assert.equal(verifyContainerPolicy(absence, options), true, 'Docker null absence fields and set ordering are equivalent');
  const cases = [
    ['foreign image', p => { p.imageId = `sha256:${'b'.repeat(64)}`; }],
    ['foreign ownership label', p => { p.label = 'fedcba9876543210'; }],
    ['root user', p => { p.user = '0:0'; }], ['wrong user', p => { p.user = '1003:1002'; }],
    ['shell entrypoint', p => { p.entrypoint = ['/bin/sh']; }],
    ['host-positive command', p => { p.cmd[0] = 'host-positive'; }],
    ['duplicate probe argument', p => { p.cmd.unshift('/probe'); }],
    ['foreign canary command', p => { p.cmd[p.cmd.length - 1] = '/other/canary'; }],
    ['wrong working directory', p => { p.workingDir = '/input'; }],
    ['host network', p => { p.networkMode = 'host'; }], ['writable root', p => { p.readOnly = false; }],
    ['privileged container', p => { p.privileged = true; }], ['added capability', p => { p.capAdd = ['SYS_ADMIN']; }],
    ['missing dropped capabilities', p => { p.capDrop = []; }], ['null mandatory caps', p => { p.capDrop = null; }],
    ['missing no-new-privileges', p => { p.securityOpt = []; }],
    ['unconfined seccomp', p => { p.securityOpt.push('seccomp=unconfined'); }],
    ['host PID', p => { p.pidMode = 'host'; }], ['host IPC', p => { p.ipcMode = 'host'; }],
    ['host cgroup namespace', p => { p.cgroupnsMode = 'host'; }],
    ['unbounded pids', p => { p.pidsLimit = 0; }], ['larger memory', p => { p.memory *= 2; }],
    ['larger cpu', p => { p.nanoCpus *= 2; }],
    ['device access', p => { p.devices = [{ PathOnHost: '/synthetic-device' }]; }],
    ['device request', p => { p.deviceRequests = [{ Count: -1 }]; }],
    ['extra environment key', p => { p.envKeys.push('FIXTURE_FAKE_TOKEN'); }],
    ['missing environment key', p => { p.envKeys = p.envKeys.filter(key => key !== 'HOME'); }],
    ['extra socket mount', p => { p.mounts.push({ type: 'bind', source: '/owned/synthetic-docker.sock', destination: '/socket', rw: true, propagation: 'rprivate' }); }],
    ['writable input', p => { p.mounts[0].rw = true; }], ['readonly output', p => { p.mounts[1].rw = false; }],
    ['foreign bind source', p => { p.mounts[0].source = '/owned/other-input'; }],
    ['shared propagation', p => { p.mounts[0].propagation = 'shared'; }],
    ['missing mount', p => { p.mounts.pop(); }],
  ];
  for (const [name, tamper] of cases) {
    const changed = policy();
    tamper(changed);
    assert.throws(() => verifyContainerPolicy(changed, options), Error, name);
  }
  assert.deepEqual(good, policy(), 'validation does not mutate selected inspection metadata');
});

test('contained observation requires successful allowed controls and precise isolation evidence', () => {
  const expected = { uid: options.uid, gid: options.gid };
  const good = observation();
  assert.equal(verifyContainedObservation(good, expected), true);
  assert.equal(verifyContainedObservation({ ...observation(), envKeys: [...envKeys].reverse() }, expected), true);
  for (const [name, change] of [
    ['wrong mode', { mode: 'host-positive' }], ['wrong PID', { pid: 2 }], ['root uid', { uid: 0 }],
    ['wrong gid', { gid: options.gid + 1 }], ['failed allowed read', { allowedRead: false }],
    ['failed allowed write', { allowedWrite: false }], ['vacuous denied controls', { allowedRead: false, allowedWrite: false }],
    ['host canary readable', { hostRead: true, hostReadErrno: 0 }],
    ['input permission denial instead of readonly', { inputWriteErrno: 13 }],
    ['missing root control instead of readonly', { rootWriteErrno: 2 }],
    ['root permission denial instead of readonly', { rootWriteErrno: 13 }],
    ['host read denied instead of absent', { hostReadErrno: 13 }],
    ['host write succeeded', { hostWriteErrno: 0 }],
    ['host write denied instead of absent', { hostWriteErrno: 13 }],
    ['no interface observation', { interfaces: 0 }], ['non-loopback interface', { nonLoopback: 1 }],
    ['effective capability', { effectiveCaps: 1 }], ['permitted capability', { permittedCaps: 1 }],
    ['inheritable capability', { inheritableCaps: 1 }], ['privilege escalation allowed', { noNewPrivs: 0 }],
    ['seccomp absent', { seccomp: 0 }], ['fake inherited token', { fakeEnv: true }],
    ['unexpected environment key', { envKeys: [...envKeys, 'FIXTURE_FAKE_TOKEN'] }],
    ['missing environment metadata', { envKeys: [] }], ['truthy nonboolean control', { allowedRead: 'true' }],
  ]) assert.throws(() => verifyContainedObservation({ ...observation(), ...change }, expected), Error, name);
  assert.throws(() => verifyContainedObservation({}, expected), Error, 'missing observation cannot satisfy a negative');
  assert.deepEqual(good, observation(), 'observation validation is pure');
});
