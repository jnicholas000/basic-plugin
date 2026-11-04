// DO_NOT_COPY: fixed existing Node runtime + owned probe only. No npm, candidate, install or image pull.
// DO_NOT_COPY: bounded inert Linux CI control, never an upstream/candidate executor.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const requireFact = value => { if (!value) throw new Error('inert-control-requirement'); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const nodeEntrypoint = ['/runtime/node', '--max-old-space-size=32', '/probe.mjs'];
const keys = ['imageId', 'name', 'uid', 'gid', 'input', 'output', 'hostCanary', 'nonce'];
const envKeys = ['FIXTURE_VISIBLE', 'HOME', 'HOSTNAME', 'PATH'];
const command = o => ['contained', '/input/readable', '/output/result.txt', '/root-write-control', o.hostCanary];
const same = (a, b) => requireFact(isDeepStrictEqual(a, b));
const inside = (parent, child) => child === parent || child.startsWith(`${parent}/`);
function safePath(p) {
  return typeof p === 'string' && path.posix.isAbsolute(p) && p !== '/'
    && !/[\0\r\n,\\]/.test(p) && path.posix.normalize(p) === p && !p.endsWith('/');
}
export function buildNodeContainerArgs(o) {
  requireFact(o && typeof o === 'object' && Reflect.ownKeys(o).length === keys.length
    && Reflect.ownKeys(o).every(k => keys.includes(k)));
  requireFact(/^sha256:[a-f0-9]{64}$/.test(o.imageId) && /^[a-z][a-z0-9-]{0,63}$/.test(o.name)
    && /^[a-f0-9]{16}$/.test(o.nonce));
  for (const id of [o.uid, o.gid]) requireFact(Number.isSafeInteger(id) && id > 0 && id <= 2147483647);
  for (const p of [o.input, o.output, o.hostCanary]) requireFact(safePath(p));
  requireFact(!inside(o.input, o.output) && !inside(o.output, o.input)
    && !inside(o.input, o.hostCanary) && !inside(o.output, o.hostCanary));
  return ['create', '--name', o.name, '--label', `personal.basic.confinement=${o.nonce}`,
    '--pull', 'never', '--user', `${o.uid}:${o.gid}`, '--read-only', '--network', 'none',
    '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges', '--ipc', 'private',
    '--cgroupns', 'private', '--pids-limit', '32', '--memory', '134217728', '--cpus', '1',
    '--workdir', '/', '--hostname', 'fixture', '--log-driver', 'none',
    '--env', 'HOME=/nonexistent', '--env', 'PATH=/usr/bin:/bin', '--env', 'FIXTURE_VISIBLE=synthetic',
    '--mount', `type=bind,src=${o.input},dst=/input,readonly,bind-propagation=rprivate`,
    '--mount', `type=bind,src=${o.output},dst=/output,bind-propagation=rprivate`, o.imageId, ...command(o)];
}
const absent = x => x === null || (Array.isArray(x) && x.length === 0);
export function verifyNodePolicy(p, o) {
  buildNodeContainerArgs(o);
  requireFact(p && typeof p === 'object');
  const expected = { imageId: o.imageId, label: o.nonce, user: `${o.uid}:${o.gid}`,
    entrypoint: nodeEntrypoint, cmd: command(o), workingDir: '/', networkMode: 'none', readOnly: true,
    privileged: false, capDrop: ['ALL'], securityOpt: ['no-new-privileges'], pidMode: '',
    ipcMode: 'private', cgroupnsMode: 'private', pidsLimit: 32, memory: 134217728, nanoCpus: 1000000000 };
  for (const [k, v] of Object.entries(expected)) same(p[k], v);
  for (const k of ['capAdd', 'devices', 'deviceRequests']) requireFact(absent(p[k]));
  requireFact(Array.isArray(p.envKeys) && Array.isArray(p.mounts));
  same([...p.envKeys].sort(), envKeys);
  same([...p.mounts].sort((a, b) => a.destination < b.destination ? -1 : 1), [
    { type: 'bind', source: o.input, destination: '/input', rw: false, propagation: 'rprivate' },
    { type: 'bind', source: o.output, destination: '/output', rw: true, propagation: 'rprivate' }
  ]);
  return true;
}
export function verifyContainedObservation(p, { uid, gid }) {
  requireFact(p && typeof p === 'object');
  const expected = { mode: 'contained', uid, gid, pid: 1, allowedRead: true, allowedWrite: true,
    hostRead: false, inputWriteErrno: 30, rootWriteErrno: 30, hostReadErrno: 2, hostWriteErrno: 2,
    nonLoopback: 0, effectiveCaps: 0, permittedCaps: 0, inheritableCaps: 0,
    noNewPrivs: 1, seccomp: 2, fakeEnv: false };
  for (const [k, v] of Object.entries(expected)) same(p[k], v);
  requireFact(Number.isSafeInteger(p.interfaces) && p.interfaces >= 1 && Array.isArray(p.envKeys));
  same([...p.envKeys].sort(), envKeys);
  return true;
}

// Selected metadata only. Environment values and other process/credential data are not returned.
const policyTemplate = `{"imageId":{{json .Image}},"label":{{json (index .Config.Labels "personal.basic.confinement")}},"user":{{json .Config.User}},"entrypoint":{{json .Config.Entrypoint}},"cmd":{{json .Config.Cmd}},"workingDir":{{json .Config.WorkingDir}},"hostname":{{json .Config.Hostname}},"tty":{{json .Config.Tty}},"links":{{json .HostConfig.Links}},"networkMode":{{json .HostConfig.NetworkMode}},"readOnly":{{json .HostConfig.ReadonlyRootfs}},"privileged":{{json .HostConfig.Privileged}},"capAdd":{{json .HostConfig.CapAdd}},"capDrop":{{json .HostConfig.CapDrop}},"securityOpt":{{json .HostConfig.SecurityOpt}},"pidMode":{{json .HostConfig.PidMode}},"ipcMode":{{json .HostConfig.IpcMode}},"cgroupnsMode":{{json .HostConfig.CgroupnsMode}},"pidsLimit":{{json .HostConfig.PidsLimit}},"memory":{{json .HostConfig.Memory}},"nanoCpus":{{json .HostConfig.NanoCpus}},"devices":{{json .HostConfig.Devices}},"deviceRequests":{{json .HostConfig.DeviceRequests}},"envKeys":[{{range .Config.Env}}{{json (index (split . "=") 0)}},{{end}}null],"mounts":[{{range .Mounts}}{"type":{{json .Type}},"source":{{json .Source}},"destination":{{json .Destination}},"rw":{{json .RW}},"propagation":{{json .Propagation}}},{{end}}null]}`;


/** Parse only selected readelf metadata; never execute an inspected object. */
export function parseReadelfReport(text) {
  requireFact(typeof text === 'string' && text.length > 0 && text.length <= 65536);
  const loaders = [...text.matchAll(/\[Requesting program interpreter: ([^\]\r\n]+)\]/g)].map(m => m[1]);
  requireFact(loaders.length <= 1 && loaders.every(p => p === '/lib64/ld-linux-x86-64.so.2'));
  const needed = [];
  for (const line of text.split('\n')) {
    if (/\(RPATH\)|\(RUNPATH\)/.test(line)) {
      const match = line.match(/\[([^\]]*)\]/); requireFact(match && match[1] === '');
    }
    if (!line.includes('(NEEDED)')) continue;
    const match = line.match(/\(NEEDED\)\s+Shared library: \[([^\]]+)\]\s*$/);
    requireFact(match && /^[A-Za-z0-9_+-][A-Za-z0-9._+-]*$/.test(match[1])
      && match[1] !== '.' && match[1] !== '..' && !needed.includes(match[1]) && needed.length < 16);
    needed.push(match[1]);
  }
  return { interpreter: loaders[0] ?? null, needed };
}

function main() {
  const started = Date.now(), clockStart = performance.now(), deadline = clockStart + 90000;
  const result = { schemaVersion: 1, status: 'INDETERMINATE', startedAt: new Date(started).toISOString(),
    upstreamExecuted: false, npmExecuted: false, realCredentialsProbed: false, downloadsOrInstalls: false };
  let root, env, nonce, stage = 'admission', cleaned = false, objectOpsAttempted = false,
    mutationOutcomeUncertain = false, cleanupDeadline = Infinity;
  const run = (file, args, timeout = 10000, cleanup = false) => {
    const remaining = Math.min(timeout, (cleanup ? cleanupDeadline : deadline) - performance.now());
    requireFact(remaining > 0);
    return execFileSync(file, args, { cwd: root, env, timeout: remaining, maxBuffer: 65536,
      stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8').trim();
  };
  const docker = (args, timeout, cleanup) => run('/usr/bin/docker', args, timeout, cleanup);
  const mutateDocker = args => {
    try { return docker(args); }
    catch (error) {
      // Lost acknowledgement can race a late daemon completion even after an empty listing.
      // A known failure to start the client itself does not create a daemon operation.
      if (!['ENOENT', 'EACCES'].includes(error.code))
        mutationOutcomeUncertain = true;
      throw error;
    }
  };
  const snapshot = repo => {
    const names = run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'ls-files', '-z']).split('\0').filter(Boolean);
    return Object.fromEntries(names.sort().map(name => {
      const p = path.join(repo, name); requireFact(fs.lstatSync(p).isFile());
      return [name, hash(fs.readFileSync(p))];
    }));
  };
  try {
    requireFact(process.argv.length === 2 && process.platform === 'linux' && process.arch === 'x64'
      && process.env.GITHUB_EVENT_NAME === 'pull_request'
      && process.env.NODE_CONFINEMENT_EVENT_ACTION === 'opened'
      && process.env.GITHUB_HEAD_REF === 'spike/node-confinement-20261104'
      && process.env.GITHUB_RUN_ATTEMPT === '1');
    requireFact(/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '')
      && /^[a-f0-9]{40}$/.test(process.env.NODE_CONFINEMENT_HEAD_SHA ?? ''));
    const repo = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'));
    requireFact(fs.realpathSync(process.cwd()) === repo && safePath(process.env.RUNNER_TEMP));
    const uid = process.getuid(), gid = process.getgid();
    requireFact(uid > 0 && gid > 0);
    root = fs.mkdtempSync(path.join(fs.realpathSync(process.env.RUNNER_TEMP), 'basic-confinement-'));
    const dirs = Object.fromEntries(['input', 'output', 'rootfs', 'home', 'docker-config'].map(k => [k, path.join(root, k)]));
    for (const p of Object.values(dirs)) fs.mkdirSync(p, { mode: 0o700 });
    env = { HOME: dirs.home, DOCKER_CONFIG: dirs['docker-config'], DOCKER_HOST: 'unix:///var/run/docker.sock',
      PATH: '/usr/bin:/bin', LC_ALL: 'C', OPENSSL_CONF: '/dev/null', FIXTURE_FAKE_TOKEN: 'synthetic-no-authority' };
    nonce = randomBytes(8).toString('hex');
    stage = 'runtime-metadata';
    result.sourceCommit = run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'rev-parse', 'HEAD']);
    same(result.sourceCommit, process.env.GITHUB_SHA);
    result.headCommit = process.env.NODE_CONFINEMENT_HEAD_SHA;
    result.runner = { imageOS: process.env.ImageOS ?? null, imageVersion: process.env.ImageVersion ?? null,
      controllerNode: process.version, readelf: run('/usr/bin/readelf', ['--version']).split('\n')[0],
      docker: JSON.parse(docker(['version', '--format', '{{json .}}'])) };
    // Retain version identifiers only, not daemon configuration or credentials.
    result.runner.docker = { client: result.runner.docker.Client?.Version, server: result.runner.docker.Server?.Version };
    requireFact(result.runner.imageOS && result.runner.imageVersion && result.runner.docker.server);
    const before = snapshot(repo);
    const probeSource = path.join(repo, 'docs/spikes/fixtures/node24-confinement-probe.mjs');
    requireFact(fs.lstatSync(probeSource).isFile());
    result.probeSourceSha256 = hash(fs.readFileSync(probeSource));
    requireFact(result.probeSourceSha256 === 'd642eacb7065903b36822350815424ecd6a76b29500a6cb432dd460fbea14cec');
    result.wrapperSha256 = hash(fs.readFileSync(fileURLToPath(import.meta.url)));
    stage = 'read-fixed-existing-runtime';
    const cachePath = '/opt/hostedtoolcache/node/24.22.1/x64';
    requireFact(fs.lstatSync(cachePath).isDirectory() && fs.lstatSync(`${cachePath}.complete`).isFile());
    const cache = fs.realpathSync(cachePath);
    const cachedFile = relative => {
      const p = fs.realpathSync(path.join(cache, relative));
      requireFact(p.startsWith(`${cache}/`) && fs.lstatSync(p).isFile());
      return p;
    };
    const binary = cachedFile('bin/node'), header = cachedFile('include/node/node_version.h');
    const npmManifest = cachedFile('lib/node_modules/npm/package.json');
    requireFact(fs.statSync(binary).size <= 268435456 && fs.statSync(header).size <= 65536
      && fs.statSync(npmManifest).size <= 65536);
    requireFact(hash(fs.readFileSync(binary)) === 'e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb'
      && hash(fs.readFileSync(header)) === '0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad'
      && hash(fs.readFileSync(npmManifest)) === 'f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6');
    const npm = JSON.parse(fs.readFileSync(npmManifest));
    requireFact(npm.version === '11.19.1' && npm.engines.node === '^20.17.0 || >=22.9.0');
    result.cachedRuntime = { nodeVersion: '24.22.1', nodeSha256: hash(fs.readFileSync(binary)),
      npmVersion: npm.version, npmManifestSha256: hash(fs.readFileSync(npmManifest)), npmExecuted: false };
    stage = 'inspect-and-copy-existing-ELF-closure';
    const allowedRoots = [...new Set(['/lib/x86_64-linux-gnu', '/usr/lib/x86_64-linux-gnu'].map(p => fs.realpathSync(p)))];
    const resolveLibrary = name => {
      for (const prefix of ['/lib/x86_64-linux-gnu', '/usr/lib/x86_64-linux-gnu']) {
        const requested = path.join(prefix, name);
        if (!fs.existsSync(requested)) continue;
        const source = fs.realpathSync(requested);
        requireFact(allowedRoots.some(p => source.startsWith(`${p}/`)) && fs.lstatSync(source).isFile());
        return { source, destination: requested };
      }
      throw new Error('required-existing-system-library-missing');
    };
    const queue = [{ source: binary, destination: '/runtime/node', node: true }], destinations = new Set();
    const inventory = [];
    let copiedBytes = 0;
    fs.chmodSync(dirs.rootfs, 0o755);
    while (queue.length) {
      const item = queue.shift();
      if (destinations.has(item.destination)) continue;
      requireFact(destinations.size < 32 && safePath(item.destination));
      const source = fs.realpathSync(item.source);
      requireFact(fs.lstatSync(source).isFile() && fs.statSync(source).size <= 268435456);
      const bytes = fs.readFileSync(source);
      requireFact(bytes.length >= 64 && bytes.subarray(0, 4).equals(Buffer.from([127, 69, 76, 70]))
        && bytes[4] === 2 && bytes[5] === 1 && bytes.readUInt16LE(18) === 62);
      copiedBytes += bytes.length; requireFact(copiedBytes <= 268435456);
      const report = parseReadelfReport(run('/usr/bin/readelf', ['--program-headers', '--dynamic', '--wide', source]));
      if (item.node) requireFact(report.interpreter === '/lib64/ld-linux-x86-64.so.2' && report.needed.length > 0);
      const destination = path.join(dirs.rootfs, item.destination);
      requireFact(destination.startsWith(`${dirs.rootfs}/`));
      fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 });
      fs.writeFileSync(destination, bytes, { flag: 'wx', mode: 0o555 });
      destinations.add(item.destination);
      inventory.push({ source, destination: item.destination, bytes: bytes.length, sha256: hash(bytes), needed: report.needed });
      if (report.interpreter) {
        const loader = fs.realpathSync(report.interpreter);
        requireFact(allowedRoots.some(p => loader.startsWith(`${p}/`)) && fs.lstatSync(loader).isFile());
        queue.push({ source: loader, destination: report.interpreter });
      }
      for (const name of report.needed) queue.push(resolveLibrary(name));
    }
    result.runtimeFiles = inventory;
    result.runtimeBytes = copiedBytes;
    fs.copyFileSync(probeSource, path.join(dirs.rootfs, 'probe.mjs'), fs.constants.COPYFILE_EXCL);
    fs.chmodSync(path.join(dirs.rootfs, 'probe.mjs'), 0o444);
    const input = path.join(dirs.input, 'readable'), output = path.join(dirs.output, 'result.txt');
    const rootControl = path.join(dirs.rootfs, 'root-write-control'), hostCanary = path.join(root, 'owned-host-canary');
    fs.writeFileSync(input, 'readable-input\n', { mode: 0o600 });
    fs.writeFileSync(rootControl, 'root-control\n', { mode: 0o666 }); fs.chmodSync(rootControl, 0o666);
    fs.writeFileSync(hostCanary, 'owned-host-canary\n', { mode: 0o600 });
    stage = 'host-positive';
    result.hostPositive = JSON.parse(run(binary, ['--max-old-space-size=32', probeSource, 'host-positive', input, output, rootControl, hostCanary], 5000));
    const h = result.hostPositive;
    requireFact(h.node === 'v24.22.1' && h.mode === 'host-positive' && h.uid === uid && h.gid === gid && h.allowedRead === true
      && h.allowedWrite === true && h.hostRead === true && h.inputWriteErrno === 0 && h.rootWriteErrno === 0
      && h.hostWriteErrno === 0 && h.nonLoopback >= 1 && h.fakeEnv === true);
    same(fs.readFileSync(output, 'utf8'), 'controlled-output\n');
    fs.writeFileSync(input, 'readable-input\n'); fs.writeFileSync(rootControl, 'root-control\n');
    fs.writeFileSync(hostCanary, 'owned-host-canary\n'); fs.unlinkSync(output);
    const protectedControls = Object.fromEntries([input, rootControl, hostCanary].map(p => [p,
      { hash: hash(fs.readFileSync(p)), mode: fs.statSync(p).mode & 0o777 }]));
    const archive = path.join(root, 'owned-rootfs.tar');
    stage = 'import-owned-rootfs';
    run('/usr/bin/tar', ['--owner=0', '--group=0', '--numeric-owner', '-C', dirs.rootfs, '-cf', archive, '.']);
    result.rootfsTarSha256 = hash(fs.readFileSync(archive));
    objectOpsAttempted = true;
    const imageId = mutateDocker(['image', 'import', '--change', `ENTRYPOINT ${JSON.stringify(nodeEntrypoint)}`, '--change',
      `LABEL personal.basic.confinement=${nonce}`, '--change', 'USER 65532:65532', '--change', 'ENV PATH=/usr/bin:/bin', archive]);
    requireFact(/^sha256:[a-f0-9]{64}$/.test(imageId)); result.imageId = imageId;
    const image = JSON.parse(docker(['image', 'inspect', '--format',
      '{"id":{{json .Id}},"label":{{json (index .Config.Labels "personal.basic.confinement")}},"entrypoint":{{json .Config.Entrypoint}},"envKeys":[{{range .Config.Env}}{{json (index (split . "=") 0)}},{{end}}null]}', imageId]));
    requireFact(image.envKeys.pop() === null);
    same(image, { id: imageId, label: nonce, entrypoint: nodeEntrypoint, envKeys: ['PATH'] });
    const options = { imageId, name: `basic-node-${nonce}`, uid, gid, input: dirs.input, output: dirs.output, hostCanary, nonce };
    stage = 'create-and-inspect';
    const containerId = mutateDocker(buildNodeContainerArgs(options));
    requireFact(/^[a-f0-9]{64}$/.test(containerId)); result.containerId = containerId;
    const policy = JSON.parse(docker(['inspect', '--format', policyTemplate, containerId]));
    requireFact(policy.envKeys.pop() === null && policy.mounts.pop() === null);
    same(policy.hostname, 'fixture'); same(policy.tty, false); requireFact(absent(policy.links));
    delete policy.hostname; delete policy.tty; delete policy.links;
    // Docker constructs HOSTNAME at start; inspect.Config.Env contains only our three entries.
    same([...policy.envKeys].sort(), ['FIXTURE_VISIBLE', 'HOME', 'PATH']);
    result.configuredEnvironmentKeys = [...policy.envKeys].sort();
    policy.envKeys.push('HOSTNAME'); // Derived default, checked again by the actual child probe.
    verifyNodePolicy(policy, options);
    // Redact owned absolute host paths from published configuration evidence.
    result.policy = { ...policy, cmd: command({ hostCanary: 'OWNED_UNMOUNTED_CANARY' }),
      mounts: policy.mounts.map(m => ({ ...m, source: m.destination === '/input' ? 'OWNED_INPUT' : 'OWNED_OUTPUT' })) };
    stage = 'contained-probe';
    result.contained = JSON.parse(docker(['start', '--attach', containerId], 10000));
    requireFact(result.contained.node === 'v24.22.1');
    verifyContainedObservation(result.contained, { uid, gid });
    same(fs.readFileSync(output, 'utf8'), 'controlled-output\n');
    result.outputSha256 = hash(fs.readFileSync(output));
    for (const [p, observation] of Object.entries(protectedControls)) {
      same(hash(fs.readFileSync(p)), observation.hash); same(fs.statSync(p).mode & 0o777, observation.mode);
    }
    same(snapshot(repo), before);
    result.trackedSourceFilesUnchanged = Object.keys(before).length;
    result.status = 'NODE24_CONFINED_INERT_CONTROL_PASSED';
  } catch (error) {
    result.failure = { stage, code: error.code ?? null, signal: error.signal ?? null,
      diagnostic: error.stderr ? String(error.stderr).slice(0, 2048) : error.message };
    result.status = 'INDETERMINATE';
  } finally {
    const failures = mutationOutcomeUncertain ? ['mutating-operation-outcome-unknown'] : [];
    cleanupDeadline = performance.now() + 10000;
    // Discover only this nonce's objects, including a create/import whose client timed out.
    if (env && nonce && objectOpsAttempted) for (const [kind, listArgs, removeArgs] of [
      ['container', ['container', 'ls', '--all'], ['container', 'rm', '--force']],
      ['image', ['image', 'ls'], ['image', 'rm']]
    ]) {
      try {
        const ids = docker([...listArgs, '--filter', `label=personal.basic.confinement=${nonce}`, '--no-trunc', '--format', '{{.ID}}'], 5000, true).split('\n').filter(Boolean);
        requireFact(ids.length <= 1 && ids.every(id => /^(sha256:)?[a-f0-9]{64}$/.test(id)));
        for (const id of ids) docker([...removeArgs, id], 5000, true);
        requireFact(docker([...listArgs, '--filter', `label=personal.basic.confinement=${nonce}`, '--no-trunc', '--format', '{{.ID}}'], 5000, true) === '');
      } catch { failures.push(kind); }
    }
    if (root) { try { fs.rmSync(root, { recursive: true, force: true }); requireFact(!fs.existsSync(root)); } catch { failures.push('files'); } }
    cleaned = failures.length === 0;
    result.cleanup = { completed: cleaned, mutationOutcomeUncertain, failures };
    if (!cleaned) result.status = 'INDETERMINATE';
    result.completedAt = new Date().toISOString();
    result.elapsedMs = performance.now() - clockStart;
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (result.status !== 'NODE24_CONFINED_INERT_CONTROL_PASSED' || !cleaned) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
