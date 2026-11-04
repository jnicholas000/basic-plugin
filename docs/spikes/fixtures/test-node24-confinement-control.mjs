// Independent offline contract controls: no subprocess, Docker, readelf or Node probe execution.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReadelfReport, buildNodeContainerArgs, verifyNodePolicy } from './run-node24-confinement-control.mjs';

const loader = '/lib64/ld-linux-x86-64.so.2';
const prefix = 'Elf file type is EXEC (Executable file)\nProgram Headers:\n';
const dynamic = `${prefix}  INTERP 0x000238 0x0000000000400238\n      [Requesting program interpreter: ${loader}]\nDynamic section at offset 0x10 contains 2 entries:\n  0x0000000000000001 (NEEDED) Shared library: [libstdc++.so.6]\n  0x0000000000000001 (NEEDED) Shared library: [libc.so.6]\n`;
const options = {
  imageId: `sha256:${'a'.repeat(64)}`, name: 'basic-node-0123456789abcdef',
  uid: 1001, gid: 1002, input: '/owned/node/input', output: '/owned/node/output',
  hostCanary: '/owned/node/unmounted-canary', nonce: '0123456789abcdef',
};
const command = ['contained', '/input/readable', '/output/result.txt', '/root-write-control', options.hostCanary];
const entrypoint = ['/runtime/node', '--max-old-space-size=32', '/probe.mjs'];
const policy = () => ({
  imageId: options.imageId, label: options.nonce, user: '1001:1002', entrypoint: [...entrypoint], cmd: [...command],
  workingDir: '/', networkMode: 'none', readOnly: true, privileged: false,
  capAdd: [], capDrop: ['ALL'], securityOpt: ['no-new-privileges'], pidMode: '', ipcMode: 'private', cgroupnsMode: 'private',
  pidsLimit: 32, memory: 134217728, nanoCpus: 1000000000, devices: [], deviceRequests: [],
  envKeys: ['FIXTURE_VISIBLE', 'HOME', 'HOSTNAME', 'PATH'],
  mounts: [
    { type: 'bind', source: options.input, destination: '/input', rw: false, propagation: 'rprivate' },
    { type: 'bind', source: options.output, destination: '/output', rw: true, propagation: 'rprivate' },
  ],
});

test('readelf reports retain the exact approved loader and dependency encounter order', () => {
  assert.deepEqual(parseReadelfReport(dynamic), { interpreter: loader, needed: ['libstdc++.so.6', 'libc.so.6'] });
  assert.deepEqual(parseReadelfReport(`${prefix}There is no dynamic section in this file.\n`), { interpreter: null, needed: [] });
  assert.deepEqual(parseReadelfReport(`${dynamic}  0x000000000000001d (RUNPATH) Library runpath: []\n`), { interpreter: loader, needed: ['libstdc++.so.6', 'libc.so.6'] });
});

test('readelf parser rejects nonempty search paths, unsafe or duplicate dependencies and foreign loaders', () => {
  assert.deepEqual(parseReadelfReport(dynamic).needed, ['libstdc++.so.6', 'libc.so.6']);
  for (const [name, report] of [
    ['RPATH', `${dynamic}  0x000000000000000f (RPATH) Library rpath: [/owned/unapproved]\n`],
    ['RUNPATH', `${dynamic}  0x000000000000001d (RUNPATH) Library runpath: [$ORIGIN/lib]\n`],
    ['absolute needed path', dynamic.replace('[libstdc++.so.6]', '[/owned/libstdc++.so.6]')],
    ['traversal needed path', dynamic.replace('[libstdc++.so.6]', '[../libstdc++.so.6]')],
    ['whitespace needed name', dynamic.replace('[libstdc++.so.6]', '[lib unsafe.so]')],
    ['duplicate needed name', dynamic.replace('[libc.so.6]', '[libstdc++.so.6]')],
    ['foreign loader', dynamic.replace(loader, '/owned/ld-linux.so')],
    ['relative loader', dynamic.replace(loader, 'ld-linux-x86-64.so.2')],
    ['multiple interpreter declarations', `${dynamic}      [Requesting program interpreter: ${loader}]\n`],
  ]) assert.throws(() => parseReadelfReport(report), Error, name);
});

test('Node container argument builder preserves inherited isolation and exposes only the fixed probe command', () => {
  const before = structuredClone(options);
  const args = buildNodeContainerArgs(options);
  assert.ok(Array.isArray(args) && args.every(item => typeof item === 'string'));
  assert.equal(args[0], 'create');
  const image = args.indexOf(options.imageId);
  assert.ok(image > 0);
  assert.equal(args.lastIndexOf(options.imageId), image);
  assert.deepEqual(args.slice(image + 1), command, 'image entrypoint supplies the bounded Node invocation once');
  const has = (flag, value) => args.includes(`${flag}=${value}`) || args.some((item, index) => item === flag && args[index + 1] === value);
  for (const [flag, value] of [
    ['--name', options.name], ['--label', `personal.basic.confinement=${options.nonce}`], ['--user', '1001:1002'],
    ['--network', 'none'], ['--cap-drop', 'ALL'], ['--security-opt', 'no-new-privileges'], ['--ipc', 'private'],
    ['--cgroupns', 'private'], ['--pids-limit', '32'], ['--cpus', '1'], ['--pull', 'never'],
    ['--workdir', '/'], ['--hostname', 'fixture'], ['--log-driver', 'none'],
    ['--env', 'HOME=/nonexistent'], ['--env', 'PATH=/usr/bin:/bin'], ['--env', 'FIXTURE_VISIBLE=synthetic'],
  ]) assert.ok(has(flag, value), `${flag}=${value}`);
  assert.ok(args.includes('--read-only') || has('--read-only', 'true'));
  assert.ok(has('--memory', '128m') || has('--memory', '134217728'));
  assert.equal(args.filter(item => item === '--env' || item.startsWith('--env=')).length, 3);
  assert.equal(args.filter(item => item === '--mount' || item.startsWith('--mount=')).length, 2);
  assert.ok(!args.some(item => item === '--pid' || item.startsWith('--pid=') || item.startsWith('--privileged')));
  assert.ok(!args.some(item => item.includes('seccomp=unconfined')));
  assert.deepEqual(options, before);
  assert.deepEqual(buildNodeContainerArgs(options), args);
  for (const changed of [
    { uid: 0 }, { gid: 0 }, { imageId: 'node:24' }, { nonce: 'unsafe' },
    { input: 'relative/input' }, { output: '/owned/output,readonly' },
    { hostCanary: `${options.input}/canary` }, { command: ['/bin/sh'] }, { extra: true },
  ]) assert.throws(() => buildNodeContainerArgs({ ...options, ...changed }), Error);
});

test('Node policy accepts only the fixed Node entrypoint with the inherited bounded policy', () => {
  const good = policy();
  assert.equal(verifyNodePolicy(good, options), true);
  assert.equal(verifyNodePolicy({ ...policy(), capAdd: null, devices: null, deviceRequests: null,
    envKeys: [...policy().envKeys].reverse(), mounts: [...policy().mounts].reverse() }, options), true);
  assert.deepEqual(good, policy());
});

test('Node policy rejects runtime substitutions and concrete containment weakening', () => {
  assert.equal(verifyNodePolicy(policy(), options), true);
  for (const [name, change] of [
    ['other runtime', p => { p.entrypoint[0] = '/usr/bin/node'; }],
    ['unbounded heap', p => { p.entrypoint = ['/runtime/node', '/probe.mjs']; }],
    ['foreign probe', p => { p.entrypoint[2] = '/owned/other.mjs'; }],
    ['shell command', p => { p.cmd = ['/bin/sh']; }],
    ['foreign image', p => { p.imageId = `sha256:${'b'.repeat(64)}`; }],
    ['foreign ownership label', p => { p.label = 'fedcba9876543210'; }],
    ['root identity', p => { p.user = '0:0'; }], ['host network', p => { p.networkMode = 'host'; }],
    ['writable root', p => { p.readOnly = false; }], ['privileged', p => { p.privileged = true; }],
    ['added capability', p => { p.capAdd = ['SYS_ADMIN']; }], ['missing cap drop', p => { p.capDrop = []; }],
    ['unconfined seccomp', p => { p.securityOpt.push('seccomp=unconfined'); }],
    ['missing no-new-privileges', p => { p.securityOpt = []; }], ['shared PID namespace', p => { p.pidMode = 'host'; }],
    ['shared IPC namespace', p => { p.ipcMode = 'host'; }], ['shared cgroup namespace', p => { p.cgroupnsMode = 'host'; }],
    ['unbounded pids', p => { p.pidsLimit = 0; }], ['larger memory', p => { p.memory *= 2; }],
    ['larger CPU', p => { p.nanoCpus *= 2; }], ['inherited token key', p => { p.envKeys.push('FIXTURE_FAKE_TOKEN'); }],
    ['writable input', p => { p.mounts[0].rw = true; }], ['foreign bind', p => { p.mounts[0].source = '/owned/other'; }],
    ['socket mount', p => { p.mounts.push({ type: 'bind', source: '/owned/synthetic.sock', destination: '/socket', rw: true, propagation: 'rprivate' }); }],
  ]) {
    const changed = policy();
    change(changed);
    assert.throws(() => verifyNodePolicy(changed, options), Error, name);
  }
});
