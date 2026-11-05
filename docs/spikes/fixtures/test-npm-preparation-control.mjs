// Independent Odo contract frozen BEFORE producer. Pure records/source reads only.
// Never executes a probe, npm, container, controller, upstream module or subprocess.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import {
  validateRuntimeInventory, validateNpmInventory, buildNpmContainerArgs,
  verifyNpmPolicy, buildNpmInvocation, verifyNpmObservation,
} from './run-npm-preparation-control.mjs';

const clone = structuredClone;
const sha = s => createHash('sha256').update(s).digest('hex');
const manifestDigest = 'f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6';
const runtime = [
  ['/runtime/node', 126879696, 'e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb'],
  ['/lib64/ld-linux-x86-64.so.2', 236616, 'c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da'],
  ['/lib/x86_64-linux-gnu/libdl.so.2', 14408, 'c2994527172cc23b7fb0f7d611b71e00a37da27af12c2e5e9e0dc1a742886c96'],
  ['/lib/x86_64-linux-gnu/libstdc++.so.6', 2592224, '1fd75fe70354a416d75aef22bcae68c47bd25d20e2d0568c30b1a9838cf62f11'],
  ['/lib/x86_64-linux-gnu/libm.so.6', 952616, 'fce00b6f25f459cf4ae0b7fae4257909a1a8a86f9149e7c029a5d617baf1ccd0'],
  ['/lib/x86_64-linux-gnu/libgcc_s.so.1', 183024, 'd93224d2b0dab4247598be683adca02f5cf00586f99c187579cd7e92058fb7cb'],
  ['/lib/x86_64-linux-gnu/libpthread.so.0', 14408, '90491a21ce44efcf3bd4b65ec82501c091d7ebe7f8d9b341dd01d721001d9ecd'],
  ['/lib/x86_64-linux-gnu/libc.so.6', 2129424, '3a15d66867d83762c7f2f1e37359cb8f6c5743edb369c65285cb0b1c4f7498bf'],
  ['/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2', 236616, 'c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da'],
].map(([destination, bytes, sha256]) => ({ destination, bytes, sha256,
  source: destination === '/runtime/node' ? '/opt/hostedtoolcache/node/24.22.1/x64/bin/node'
    : `/usr/lib/x86_64-linux-gnu/${destination.endsWith('/libstdc++.so.6') ? 'libstdc++.so.6.0.33' : destination.split('/').at(-1)}` }));
const file = (relativePath, changes = {}) => ({ relativePath, bytes: 16, sha256: sha(relativePath),
  kind: 'file', nlink: 1, magicHex: '2f2f2078', ...changes });
const sorted = entries => entries.sort((a, b) => a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0);
const npmFiles = () => sorted([file('package.json', { sha256: manifestDigest }), file('bin/npm-cli.js'), file('lib/cli.js'), file('node_modules/owned/index.js')]);
const metadata = () => ({ version: '11.19.1', nodeEngine: '^20.17.0 || >=22.9.0', manifestSha256: manifestDigest,
  builtinConfig: { state: 'absent' }, directoryCount: 4 });
const options = { imageId: `sha256:${'a'.repeat(64)}`, name: 'basic-npm-0123456789abcdef', uid: 1001, gid: 1002,
  input: '/owned/npm/input', output: '/owned/npm/output', nonce: '0123456789abcdef' };
const flags = [
  '--offline', '--ignore-scripts', '--audit=false', '--fund=false', '--update-notifier=false',
  '--userconfig=/config/user.npmrc', '--globalconfig=/config/global.npmrc', '--cache=/output/cache',
  '--prefix=/output/project', '--global=false', '--workspaces=false', '--include-workspace-root=false',
  '--logs-max=0', '--loglevel=error', '--progress=false', '--color=false', '--fetch-retries=0',
  '--bin-links=false', '--script-shell=/lifecycle-observer.mjs',
];
const env = { HOME: '/nonexistent', PATH: '/usr/bin:/bin', FIXTURE_VISIBLE: 'synthetic', HOSTNAME: 'fixture' };
const policy = () => ({ imageId: options.imageId, label: options.nonce, user: '1001:1002',
  entrypoint: ['/runtime/node', '--max-old-space-size=32', '/npm-probe.mjs'], cmd: [], workingDir: '/',
  networkMode: 'none', readOnly: true, privileged: false, capAdd: [], capDrop: ['ALL'], securityOpt: ['no-new-privileges'],
  pidMode: '', ipcMode: 'private', cgroupnsMode: 'private', pidsLimit: 32, memory: 134217728, nanoCpus: 1000000000,
  devices: [], deviceRequests: [], envKeys: ['FIXTURE_VISIBLE', 'HOME', 'HOSTNAME', 'PATH'],
  mounts: [ { type: 'bind', source: options.input, destination: '/input', rw: false, propagation: 'rprivate' },
    { type: 'bind', source: options.output, destination: '/output', rw: true, propagation: 'rprivate' } ] });
const observation = () => ({ node: 'v24.22.1', npmVersion: '11.19.1', observerPositiveExit: 73,
  observerPositiveMarker: true, observerReset: true, versionExit: 0, versionSignal: null, versionTimedOut: false,
  versionStdoutBytes: 8, ciExit: 0, ciSignal: null, ciTimedOut: false, ciStdoutBytes: 64,
  ciSummary: { added: 0, removed: 1, changed: 0, audited: 0, funding: 0 }, observerAfterCi: false,
  staleAfterCi: false, manifestUnchanged: true, lockUnchanged: true, installedPackageCount: 0,
  outputAccepted: true, cleanupComplete: true, mutationOutcomeUncertain: false, sourcePreserved: true });

test('R1 exact prior runtime nine-file identity, total and immutable optional needed data', () => {
  const before = clone(runtime);
  assert.equal(runtime.reduce((sum, entry) => sum + entry.bytes, 0), 133239032);
  assert.equal(validateRuntimeInventory(runtime), true);
  assert.equal(validateRuntimeInventory([...runtime].reverse()), true);
  assert.equal(validateRuntimeInventory(runtime.map(e => ({ ...e, needed: [] }))), true);
  assert.deepEqual(runtime, before);
  for (const [name, mutate] of [
    ['foreign canonical source', e => { e[0].source = '/other/node'; }],
    ['source alias', e => { e[3].source = '/usr/lib/x86_64-linux-gnu/libstdc++.so.6'; }],
    ['foreign destination', e => { e[1].destination = '/runtime/loader'; }],
    ['foreign digest', e => { e[2].sha256 = 'b'.repeat(64); }],
    ['uppercase digest', e => { e[2].sha256 = e[2].sha256.toUpperCase(); }],
    ['one-byte drift', e => { e[4].bytes++; }],
    ['same total wrong lengths', e => { e[4].bytes++; e[5].bytes--; }],
    ['missing', e => { e.pop(); }], ['duplicate', e => { e[8] = clone(e[1]); }],
    ['extra', e => { e.push(clone(e[1])); }],
  ]) { const changed = clone(runtime); mutate(changed); assert.throws(() => validateRuntimeInventory(changed), Error, name); }
});

test('R2 bounded sorted npm inventory accepts data-only records and comments-only builtin config', () => {
  const entries = npmFiles(), meta = metadata(), before = clone([entries, meta]);
  assert.equal(validateNpmInventory(entries, meta), true);
  const config = file('npmrc');
  assert.equal(validateNpmInventory(sorted([...entries, config]), { ...meta,
    builtinConfig: { state: 'comments-only', sha256: config.sha256 } }), true);
  assert.equal(validateNpmInventory(sorted([...entries, file('LICENSE', { bytes: 0, magicHex: '' })]), meta), true);
  assert.deepEqual([entries, meta], before);
});

test('R2 npm tree rejects boundary, configuration, native and metadata drift', () => {
  for (const relativePath of ['../escape', '/lib/absolute', 'lib/../escape', 'lib//x', 'lib/./x', 'lib/x\\y', 'lib/x\n',
    'lib/.npmrc', '.npmrc', 'lib/native.node', 'node_modules/.bin/x', 'lib/.bin/x', 'bin/npx-cli.js', 'docs/x',
    `lib/${Array(32).fill('d').join('/')}/x`]) {
    assert.throws(() => validateNpmInventory(sorted([...npmFiles(), file(relativePath)]), metadata()), Error, relativePath);
  }
  for (const changes of [{ kind: 'symlink' }, { kind: 'directory' }, { kind: 'fifo' }, { nlink: 2 }, { nlink: 0 },
    { bytes: -1 }, { bytes: 0.5 }, { bytes: 8388609 }, { sha256: 'x' }, { sha256: 'A'.repeat(64) },
    { magicHex: '7f454c46' }, { magicHex: '4d5a0000' }, { magicHex: '4D5A0000' }, { magicHex: '2f' }]) {
    assert.throws(() => validateNpmInventory(sorted([...npmFiles(), file('lib/other.js', changes)]), metadata()), Error, JSON.stringify(changes));
  }
  for (const change of [{ version: '11.19.2' }, { nodeEngine: '>=20' }, { manifestSha256: 'b'.repeat(64) },
    { builtinConfig: { state: 'unknown' } }, { builtinConfig: { state: 'comments-only', sha256: sha('missing') } },
    { directoryCount: 8193 }, { directoryCount: -1 }, { directoryCount: 1.1 }, { directoryCount: undefined }]) {
    assert.throws(() => validateNpmInventory(npmFiles(), { ...metadata(), ...change }), Error, JSON.stringify(change));
  }
  assert.throws(() => validateNpmInventory([...npmFiles()].reverse(), metadata()), Error, 'not sorted');
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), npmFiles()[0]]), metadata()), Error, 'duplicate');
  for (const name of ['package.json', 'bin/npm-cli.js', 'lib/cli.js', 'node_modules/owned/index.js']) {
    assert.throws(() => validateNpmInventory(npmFiles().filter(e => e.relativePath !== name), metadata()), Error, `missing ${name}`);
  }
  const wrong = npmFiles(); wrong.find(e => e.relativePath === 'package.json').sha256 = 'b'.repeat(64);
  assert.throws(() => validateNpmInventory(wrong, metadata()), Error, 'manifest record hash');
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), file('npmrc')]), metadata()), Error, 'unbound builtin config');
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), file('npmrc')]), { ...metadata(), builtinConfig: { state: 'comments-only', sha256: 'b'.repeat(64) } }), Error, 'config hash mismatch');
});

test('R2 npm inventory quantitative caps are independent', () => {
  const large = Array.from({ length: 9 }, (_, i) => file(`lib/large-${i}`, { bytes: 8388608 }));
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), ...large]), metadata()), Error, 'aggregate >64MiB');
  const many = Array.from({ length: 8189 }, (_, i) => file(`lib/f-${String(i).padStart(5, '0')}`));
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), ...many]), metadata()), Error, '8193 files');
  assert.throws(() => validateNpmInventory(sorted([...npmFiles(), file(`lib/${'x'.repeat(4194304)}`)]), metadata()), Error, '>4MiB inventory JSON');
});

test('R3 exact deterministic container arguments retain fixed policy and no command tail', () => {
  const before = clone(options);
  const expected = ['create', '--name', options.name, '--label', `personal.basic.confinement=${options.nonce}`,
    '--pull', 'never', '--user', '1001:1002', '--read-only', '--network', 'none', '--cap-drop', 'ALL',
    '--security-opt', 'no-new-privileges', '--ipc', 'private', '--cgroupns', 'private', '--pids-limit', '32',
    '--memory', '134217728', '--cpus', '1', '--workdir', '/', '--hostname', 'fixture', '--log-driver', 'none',
    '--env', 'HOME=/nonexistent', '--env', 'PATH=/usr/bin:/bin', '--env', 'FIXTURE_VISIBLE=synthetic',
    '--mount', `type=bind,src=${options.input},dst=/input,readonly,bind-propagation=rprivate`,
    '--mount', `type=bind,src=${options.output},dst=/output,bind-propagation=rprivate`, options.imageId];
  assert.deepEqual(buildNpmContainerArgs(options), expected);
  assert.deepEqual(buildNpmContainerArgs(options), expected); assert.deepEqual(options, before);
  for (const change of [{ uid: 0 }, { gid: 0 }, { uid: 1.2 }, { gid: 2147483648 }, { imageId: 'node:24' },
    { name: 'bad name' }, { nonce: 'unsafe' }, { input: 'relative' }, { input: '/owned/../input' },
    { output: '/owned/out,readonly' }, { output: options.input }, { output: `${options.input}/child` },
    { input: `${options.output}/child` }, { command: ['/other'] }, { hostCanary: '/owned/unused' }, { extra: true }]) {
    assert.throws(() => buildNpmContainerArgs({ ...options, ...change }), Error, JSON.stringify(change));
  }
});

test('R3 inspected policy accepts null empty Docker fields and rejects selected-policy drift', () => {
  const before = policy(); assert.equal(verifyNpmPolicy(before, options), true); assert.deepEqual(before, policy());
  assert.equal(verifyNpmPolicy({ ...policy(), cmd: null, capAdd: null, devices: null, deviceRequests: null,
    envKeys: policy().envKeys.reverse(), mounts: policy().mounts.reverse() }, options), true);
  for (const [name, change] of [
    ['runtime', p => { p.entrypoint[0] = '/other/node'; }], ['heap', p => { p.entrypoint[1] = '--max-old-space-size=64'; }],
    ['probe', p => { p.entrypoint[2] = '/other.mjs'; }], ['command', p => { p.cmd = ['ci']; }],
    ['image', p => { p.imageId = `sha256:${'b'.repeat(64)}`; }], ['label', p => { p.label = 'b'.repeat(16); }],
    ['user', p => { p.user = '0:0'; }], ['workdir', p => { p.workingDir = '/output'; }],
    ['network', p => { p.networkMode = 'host'; }], ['root', p => { p.readOnly = false; }],
    ['privileged', p => { p.privileged = true; }], ['cap-add', p => { p.capAdd = ['SYS_ADMIN']; }],
    ['cap-drop', p => { p.capDrop = []; }], ['seccomp', p => { p.securityOpt.push('seccomp=unconfined'); }],
    ['privilege flag', p => { p.securityOpt = []; }], ['PID', p => { p.pidMode = 'host'; }],
    ['IPC', p => { p.ipcMode = 'host'; }], ['cgroup', p => { p.cgroupnsMode = 'host'; }],
    ['PIDs', p => { p.pidsLimit = 33; }], ['memory', p => { p.memory++; }], ['CPU', p => { p.nanoCpus++; }],
    ['device', p => { p.devices = [{}]; }], ['device request', p => { p.deviceRequests = [{}]; }],
    ['env extra', p => { p.envKeys.push('OWNED_EXTRA'); }], ['env duplicate', p => { p.envKeys.push('HOME'); }],
    ['env missing', p => { p.envKeys.pop(); }], ['input write', p => { p.mounts[0].rw = true; }],
    ['mount source', p => { p.mounts[0].source = '/owned/other'; }], ['propagation', p => { p.mounts[1].propagation = 'shared'; }],
    ['extra mount', p => { p.mounts.push({ ...p.mounts[0], destination: '/extra' }); }],
  ]) { const changed = policy(); change(changed); assert.throws(() => verifyNpmPolicy(changed, options), Error, name); }
});

test('R4 only fixed version and ci invocations; exact flags, four env values and bounds', () => {
  for (const [mode, suffix] of [['version', ['--version']], ['ci', ['ci', '--json']]]) {
    const expected = { file: '/runtime/node', args: ['--max-old-space-size=32', '/npm/bin/npm-cli.js', ...flags, ...suffix],
      cwd: '/output/project', env, timeoutMs: 10000, maxBuffer: 65536 };
    assert.deepEqual(buildNpmInvocation(mode), expected);
    const changed = buildNpmInvocation(mode); changed.args.push('bad'); changed.env.HOME = '/other';
    assert.deepEqual(buildNpmInvocation(mode), expected, 'no shared mutable state');
  }
  for (const mode of ['install', 'run', 'start', 'rebuild', 'npx', '', null, {}, ['ci']]) assert.throws(() => buildNpmInvocation(mode), Error);
  assert.throws(() => buildNpmInvocation('ci', { args: ['--ignore-scripts=false'] }), Error, 'extra invocation options');
});

test('R5 owned fixture literal identity, seven observer phases and functional source order', () => {
  const probe = fs.readFileSync(new URL('./npm-preparation-probe.mjs', import.meta.url), 'utf8');
  const observer = fs.readFileSync(new URL('./npm-lifecycle-observer.mjs', import.meta.url), 'utf8');
  const manifestText = probe.match(/export const manifestText = `([^`]+)`;/)?.[1];
  const lockText = probe.match(/export const lockText = `([^`]+)`;/)?.[1];
  assert.ok(manifestText && lockText && Buffer.byteLength(manifestText) <= 16384 && Buffer.byteLength(lockText) <= 16384);
  const manifest = JSON.parse(manifestText), lock = JSON.parse(lockText);
  assert.deepEqual(Object.keys(manifest).sort(), ['name', 'private', 'scripts', 'version']);
  assert.equal(manifest.name, 'owned-npm-preparation-control'); assert.equal(manifest.version, '1.0.0'); assert.equal(manifest.private, true);
  assert.deepEqual(Object.keys(manifest.scripts), ['preinstall', 'install', 'postinstall', 'prepublish', 'preprepare', 'prepare', 'postprepare']);
  assert.deepEqual(Object.values(manifest.scripts), Array(7).fill('/lifecycle-observer.mjs'));
  assert.deepEqual(lock, { name: manifest.name, version: manifest.version, lockfileVersion: 3, requires: true,
    packages: { '': { name: manifest.name, version: manifest.version, hasInstallScript: true } } });
  // Literal expected digests are inserted at authorship freeze; no probe import/execution.
  assert.equal(sha(manifestText), '2f7fd9cadad92c0af5e113c0ad0140023608312db9ea83050e8bef56ced745eb'); assert.equal(sha(lockText), '465eac71e5d2ba4a43c47a546ee9280d7d518c320abae0d0d6a7c03e175e7dbe');
  assert.ok(observer.startsWith('#!/runtime/node --max-old-space-size=32\n'));
  assert.ok(observer.includes("fs.writeFileSync('/output/lifecycle-observed.txt', 'owned-lifecycle-observer\\n'"));
  assert.ok(observer.includes('process.exit(73)'));
  assert.ok(probe.includes("run(['--max-old-space-size=32', '/lifecycle-observer.mjs', '-c', '/lifecycle-observer.mjs'], 5000)"));
  assert.ok(probe.indexOf("stage = 'observer-positive'") < probe.indexOf('fs.unlinkSync(marker)'));
  assert.ok(probe.indexOf('fs.unlinkSync(marker)') < probe.indexOf("stage = 'npm-version'"));
  assert.ok(probe.indexOf("stage = 'npm-version'") < probe.indexOf("stage = 'npm-ci'"));
  const probeFlags = probe.match(/export const commonFlags = Object\.freeze\(\[([\s\S]+?)\]\);/)?.[1];
  assert.ok(probeFlags);
  assert.deepEqual([...probeFlags.matchAll(/'([^']+)'/g)].map(m => m[1]), flags);
  assert.ok(probe.includes("env: { ...childEnv }"));
  for (const value of Object.values(env)) assert.ok(probe.includes(`'${value}'`));
  assert.ok(probe.includes("import.meta.url === pathToFileURL(process.argv[1]).href"));
  assert.ok(!/(?:node:(?:net|http|https|os)|\/proc\/|\/root-write|hostCanary|execFile|\/bin\/sh)/.test(probe + observer));
});

test('R6 observation accepts the owned result only with complete independent controller checks', () => {
  const good = observation(), before = clone(good);
  assert.equal(verifyNpmObservation(good), true); assert.deepEqual(good, before);
  assert.equal(verifyNpmObservation({ ...observation(), ciSummary: { added: 0, changed: 0, removed: 0, audited: 0, funding: 0, add: [], change: [] } }), true);
  for (const [key, value] of Object.entries(good)) {
    const changed = clone(good); delete changed[key]; assert.throws(() => verifyNpmObservation(changed), Error, `missing ${key}`);
  }
  for (const changes of [{ node: 'v24.22.2' }, { npmVersion: '11.19.2' }, { observerPositiveExit: 0 },
    { observerPositiveMarker: false }, { observerReset: false }, { observerAfterCi: true }, { staleAfterCi: true },
    { manifestUnchanged: false }, { lockUnchanged: false }, { installedPackageCount: 1 }, { outputAccepted: false },
    { versionExit: 1 }, { versionExit: null }, { ciExit: 1 }, { ciExit: null }, { ciSignal: 'SIGKILL' },
    { versionSignal: 'SIGTERM' }, { ciTimedOut: true }, { versionTimedOut: true }, { versionStdoutBytes: 65537 },
    { ciStdoutBytes: 65537 }, { ciStdoutBytes: -1 }, { ciStdoutBytes: 0.5 }, { cleanupComplete: false },
    { mutationOutcomeUncertain: true }, { sourcePreserved: false }, { unknown: true }]) {
    assert.throws(() => verifyNpmObservation({ ...observation(), ...changes }), Error, JSON.stringify(changes));
  }
  for (const changes of [{ added: 1 }, { changed: 1 }, { audited: 1 }, { funding: 1 }, { added: '0' },
    { removed: -1 }, { removed: 0.5 }, { removed: Number.MAX_SAFE_INTEGER + 1 }, { add: [{}] }, { change: [{}] }, { unknown: [] }]) {
    assert.throws(() => verifyNpmObservation({ ...observation(), ciSummary: { ...observation().ciSummary, ...changes } }), Error, JSON.stringify(changes));
  }
});
