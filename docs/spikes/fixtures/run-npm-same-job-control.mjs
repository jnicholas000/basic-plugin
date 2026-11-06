// DO_NOT_COPY: derived same-job owned npm control; original fixture/pure validators remain unchanged.
// Import is inert. No upstream module/config, runtime discovery, install, pull, or security probe.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { normalizeOwnedRootfsModes, classifyOwnedStartupError } from './owned-rootfs-modes.mjs';

const requireFact = value => { if (!value) throw new Error('owned-npm-requirement'); };
const same = (a, b) => requireFact(isDeepStrictEqual(a, b));
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exactKeys = (x, keys) => requireFact(record(x) && Reflect.ownKeys(x).length === keys.length && Reflect.ownKeys(x).every(k => keys.includes(k)));
const digestPattern = /^[a-f0-9]{64}$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const safeInteger = (x, max) => Number.isSafeInteger(x) && x >= 0 && x <= max;
const inside = (parent, child) => child === parent || child.startsWith(`${parent}/`);
const cache = '/opt/hostedtoolcache/node/24.22.1/x64';
const npmRoot = `${cache}/lib/node_modules/npm`;
const manifestDigest = 'f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6';
const probeDigest = '18800d03a5f86171c2eb96631a54e7a3b4e1aaa1f65f25d5d402067ec96ebb5c';
const observerDigest = 'a3059404cb6f0cfcc861d00a53a471e8f7dc90632d5e8b9b02f68d88b7f9fcb9';
const testDigest = '5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972';
const modeHelperDigest = '497324bc0eb012c4180705554546d948f2ce0691c97ca771ab041aa3a5354fad';
const modeTestDigest = '50eb4d13e2be8dfbeb6059a7ad1728f484a53fd7d9e988c99dd9ed2484a9d25e';
const entrypoint = ['/runtime/node', '--max-old-space-size=32', '/npm-probe.mjs'];
const childEnv = { HOME: '/nonexistent', PATH: '/usr/bin:/bin', FIXTURE_VISIBLE: 'synthetic', HOSTNAME: 'fixture' };
const flags = ['--offline', '--ignore-scripts', '--audit=false', '--fund=false', '--update-notifier=false',
  '--userconfig=/config/user.npmrc', '--globalconfig=/config/global.npmrc', '--cache=/output/cache',
  '--prefix=/output/project', '--global=false', '--workspaces=false', '--include-workspace-root=false',
  '--logs-max=0', '--loglevel=error', '--progress=false', '--color=false', '--fetch-retries=0',
  '--bin-links=false', '--script-shell=/lifecycle-observer.mjs'];
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
].map(([destination, bytes, sha256]) => ({ source: destination === '/runtime/node' ? `${cache}/bin/node`
  : `/usr/lib/x86_64-linux-gnu/${destination.endsWith('/libstdc++.so.6') ? 'libstdc++.so.6.0.33' : destination.split('/').at(-1)}`, destination, bytes, sha256 }));

import { validateRuntimeInventory, validateNpmInventory, buildNpmContainerArgs, verifyNpmPolicy, verifyNpmObservation } from './run-npm-preparation-control.mjs';
function npmPath(p) {
  return typeof p === 'string' && p.length > 0 && !/[\x00-\x1f\x7f\\]/.test(p)
    && p.split('/').length <= 32 && p.split('/').every(c => c && c !== '.' && c !== '..' && c !== '.bin' && c !== '.npmrc' && !c.endsWith('.node'))
    && (['package.json', 'bin/npm-cli.js', 'npmrc', 'LICENSE'].includes(p) || p.startsWith('lib/') || p.startsWith('node_modules/'));
}
function safePath(p) {
  return typeof p === 'string' && path.posix.isAbsolute(p) && p !== '/' && !/[\x00-\x1f\x7f,\\]/.test(p)
    && path.posix.normalize(p) === p && !p.endsWith('/');
}
const absent = x => x === null || (Array.isArray(x) && x.length === 0);
// Runtime-only helpers below are never called during module import or the pure suite.
function fileHash(p, maxBytes, checkDeadline) {
  checkDeadline();
  const before = fs.lstatSync(p); requireFact(before.isFile() && !before.isSymbolicLink() && before.size <= maxBytes);
  const fd = fs.openSync(p, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const h = createHash('sha256'), chunk = Buffer.alloc(1048576); let bytes = 0, count;
    while ((count = fs.readSync(fd, chunk, 0, chunk.length, null)) !== 0) {
      checkDeadline(); bytes += count; requireFact(bytes <= maxBytes); h.update(chunk.subarray(0, count));
    }
    const after = fs.fstatSync(fd); requireFact(before.dev === after.dev && before.ino === after.ino
      && before.size === bytes && after.size === bytes && before.mtimeMs === after.mtimeMs && before.ctimeMs === after.ctimeMs);
    return { bytes, sha256: h.digest('hex') };
  } finally { fs.closeSync(fd); }
}
function boundedBytes(p, cap, checkDeadline) {
  const observation = fileHash(p, cap, checkDeadline), bytes = fs.readFileSync(p);
  same({ bytes: bytes.length, sha256: hash(bytes) }, observation); return bytes;
}
function inspectOutput(root, manifestText, lockText, checkDeadline) {
  let count = 0, bytes = 0; const found = new Set();
  const walk = (dir, relative = '', depth = 0) => {
    checkDeadline(); requireFact(depth <= 8);
    for (const name of fs.readdirSync(dir).sort()) {
      const rel = relative ? `${relative}/${name}` : name, p = path.join(dir, name), st = fs.lstatSync(p);
      requireFact(++count <= 128 && !st.isSymbolicLink()); found.add(rel);
      if (st.isDirectory()) {
        requireFact(rel === 'project' || rel === 'project/node_modules' || rel === 'cache' || rel.startsWith('cache/'));
        walk(p, rel, depth + 1);
      } else {
        requireFact(st.isFile() && st.nlink === 1);
        bytes += st.size; requireFact(bytes <= 1048576);
        requireFact(['project/package.json', 'project/package-lock.json', 'project/node_modules/.package-lock.json'].includes(rel));
        if (rel === 'project/package.json') same(boundedBytes(p, 16384, checkDeadline).toString('utf8'), manifestText);
        else if (rel === 'project/package-lock.json') same(boundedBytes(p, 16384, checkDeadline).toString('utf8'), lockText);
        else {
          const h = JSON.parse(boundedBytes(p, 16384, checkDeadline));
          requireFact(record(h) && h.name === 'owned-npm-preparation-control' && h.version === '1.0.0' && h.lockfileVersion === 3
            && Object.keys(h).every(k => ['name', 'version', 'lockfileVersion', 'requires', 'packages'].includes(k))
            && (h.requires === undefined || h.requires === true) && record(h.packages) && Object.keys(h.packages).length === 0);
        }
      }
    }
  };
  walk(root); requireFact(found.has('project/package.json') && found.has('project/package-lock.json') && found.has('cache'));
  return { entries: count, bytes };
}
const policyTemplate = `{"imageId":{{json .Image}},"label":{{json (index .Config.Labels "personal.basic.confinement")}},"user":{{json .Config.User}},"entrypoint":{{json .Config.Entrypoint}},"cmd":{{json .Config.Cmd}},"workingDir":{{json .Config.WorkingDir}},"hostname":{{json .Config.Hostname}},"tty":{{json .Config.Tty}},"links":{{json .HostConfig.Links}},"networkMode":{{json .HostConfig.NetworkMode}},"readOnly":{{json .HostConfig.ReadonlyRootfs}},"privileged":{{json .HostConfig.Privileged}},"capAdd":{{json .HostConfig.CapAdd}},"capDrop":{{json .HostConfig.CapDrop}},"securityOpt":{{json .HostConfig.SecurityOpt}},"pidMode":{{json .HostConfig.PidMode}},"ipcMode":{{json .HostConfig.IpcMode}},"cgroupnsMode":{{json .HostConfig.CgroupnsMode}},"pidsLimit":{{json .HostConfig.PidsLimit}},"memory":{{json .HostConfig.Memory}},"nanoCpus":{{json .HostConfig.NanoCpus}},"devices":{{json .HostConfig.Devices}},"deviceRequests":{{json .HostConfig.DeviceRequests}},"configuredEnv":{{json .Config.Env}},"mounts":[{{range .Mounts}}{"type":{{json .Type}},"source":{{json .Source}},"destination":{{json .Destination}},"rw":{{json .RW}},"propagation":{{json .Propagation}}},{{end}}null]}`;

function main() {
  const clockStart = performance.now(), deadline = clockStart + 90000;
  const result = { schemaVersion: 1, status: 'INDETERMINATE', startedAt: new Date().toISOString(),
    upstreamExecuted: false, realCredentialsProbed: false, downloadsOrInstalls: false, targetInvocationAttempted: false, hostNodeVersion: process.version };
  let root, rootIdentity, parentIdentity, pendingRoot = false, env, nonce, objectOpsAttempted = false, mutationOutcomeUncertain = false, cleanupDeadline = Infinity;
  let stage = 'admission', commandFailure = null, candidateObservation, before, repo;
  const checkDeadline = () => requireFact(performance.now() < deadline);
  const identity = p => { const st = fs.lstatSync(p); requireFact(st.isDirectory() && !st.isSymbolicLink()); return `${st.dev}:${st.ino}:${st.mode & 0o170000}`; };
  const checkRoot = () => { requireFact(rootIdentity && fs.realpathSync(root) === root && identity(root) === rootIdentity
    && identity(path.dirname(root)) === parentIdentity); };
  const mutateFs = fn => { try { const value = fn(); checkRoot(); return value; } catch (e) { mutationOutcomeUncertain = true; throw e; } };
  const measure = p => { let count = 0, total = 0; const walk = (p, depth) => { checkDeadline(); requireFact(depth <= 40 && ++count <= 32768);
    const st = fs.lstatSync(p); requireFact(!st.isSymbolicLink() && (st.isFile() || st.isDirectory()) && Number.isSafeInteger(st.blocks));
    total += st.blocks * 512; requireFact(Number.isSafeInteger(total) && total <= 1288490188);
    if (st.isDirectory()) for (const name of fs.readdirSync(p)) walk(path.join(p, name), depth + 1); }; walk(p, 0); return total; };
  let cacheLive, filesystemBound, dockerReserve = 416 * 1048576, filesystemPeak = 0, admittedPeak = 0;
  const diskCheckpoint = () => { checkRoot(); const live = measure(root); filesystemPeak = Math.max(filesystemPeak, live);
    requireFact(Number.isSafeInteger(filesystemBound) && live <= filesystemBound);
    const peak = cacheLive + filesystemBound + dockerReserve + 16 * 1048576;
    requireFact(Number.isSafeInteger(peak) && peak <= 1288490188); admittedPeak = Math.max(admittedPeak, peak); };
  const ownedRootRemoval = () => { checkRoot(); fs.rmSync(root, { recursive: true, force: false }); requireFact(!fs.existsSync(root)); };
  const run = (file, args, timeout = 10000, cleanup = false) => {
    const remaining = Math.min(timeout, Math.floor((cleanup ? cleanupDeadline : deadline) - performance.now())); requireFact(remaining > 0);
    try {
      const output = execFileSync(file, args, { cwd: root ?? process.cwd(), env, timeout: remaining,
        maxBuffer: 65536, stdio: ['ignore', 'pipe', 'pipe'] }); requireFact(output.length <= 65536); return output.toString('utf8').trim();
    } catch (error) {
      commandFailure = { exit: Number.isInteger(error.status) ? error.status : null, signal: error.signal ?? null,
        code: typeof error.code === 'string' ? error.code.slice(0, 32) : null, timedOut: error.code === 'ETIMEDOUT',
        stdoutBytes: Buffer.byteLength(error.stdout ?? ''), stderrBytes: Buffer.byteLength(error.stderr ?? '') };
      throw error;
    }
  };
  const docker = (args, timeout, cleanup) => run('/usr/bin/docker', args, timeout, cleanup);
  const mutateDocker = args => {
    objectOpsAttempted = true;
    try { return docker(args); } catch (error) { if (!['ENOENT', 'EACCES'].includes(error.code)) mutationOutcomeUncertain = true; throw error; }
  };
  const snapshot = () => {
    const names = run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'ls-files', '-z']).split('\0').filter(Boolean);
    requireFact(names.length > 0 && names.length <= 8192);
    return Object.fromEntries(names.sort().map(name => {
      requireFact(!path.isAbsolute(name) && !name.split('/').includes('..'));
      const p = path.join(repo, name), st = fs.lstatSync(p); requireFact(st.isFile() && st.nlink === 1);
      return [name, { ...fileHash(p, 268435456, checkDeadline), mode: st.mode & 0o777 }];
    }));
  };
  try {
    requireFact(process.argv.length === 2 && process.platform === 'linux' && process.arch === 'x64'
      && process.env.GITHUB_ACTIONS === 'true' && process.env.RUNNER_OS === 'Linux'
      && process.env.GITHUB_JOB === 'local' && process.env.GITHUB_WORKFLOW === 'AQC quality gates'
      && /^refs\/pull\/[1-9][0-9]*\/merge$/.test(process.env.GITHUB_REF ?? '')
      && process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.NPM_SAME_JOB_EVENT_ACTION === 'opened'
      && process.env.GITHUB_HEAD_REF === 'feat/owned-npm-same-job-20261106' && process.versions.node.split('.')[0] === '22' && process.env.GITHUB_RUN_ATTEMPT === '1');
    for (const k of ['GITHUB_SHA', 'NPM_SAME_JOB_HEAD_SHA', 'NPM_SAME_JOB_BASE_SHA']) requireFact(/^[a-f0-9]{40}$/.test(process.env[k] ?? ''));
    requireFact(digestPattern.test(process.env.NPM_SAME_JOB_CONTROLLER_SHA256 ?? '') && safePath(process.env.RUNNER_TEMP));
    repo = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'));
    same(fs.realpathSync(process.cwd()), repo);
    const event = JSON.parse(boundedBytes(process.env.GITHUB_EVENT_PATH, 1048576, checkDeadline));
    requireFact(event.action === 'opened' && event.pull_request?.head?.ref === process.env.GITHUB_HEAD_REF
      && event.pull_request.head.repo?.full_name === process.env.GITHUB_REPOSITORY
      && event.pull_request.base?.repo?.full_name === process.env.GITHUB_REPOSITORY
      && event.repository?.full_name === process.env.GITHUB_REPOSITORY);
    same(event.pull_request.head.sha, process.env.NPM_SAME_JOB_HEAD_SHA); same(event.pull_request.base.sha, process.env.NPM_SAME_JOB_BASE_SHA);
    const uid = process.getuid(), gid = process.getgid(); requireFact(uid > 0 && gid > 0);
    const runnerTemp = fs.realpathSync(process.env.RUNNER_TEMP); requireFact(safePath(runnerTemp));
    nonce = randomBytes(8).toString('hex');
    parentIdentity = identity(runnerTemp); root = path.join(runnerTemp, `basic-npm-same-job-${nonce}`);
    pendingRoot = true;
    try { fs.mkdirSync(root, { mode: 0o700 }); }
    catch (e) { if (e.code === 'EEXIST') { pendingRoot = false; root = undefined; } else mutationOutcomeUncertain = true; throw e; }
    rootIdentity = identity(root); pendingRoot = false; checkRoot();
    cacheLive = Number(process.env.NPM_SAME_JOB_CACHE_ALLOCATED_BYTES);
    requireFact(Number.isSafeInteger(cacheLive) && cacheLive > 0 && cacheLive <= 1288490188);
    requireFact(process.env.NPM_SAME_JOB_CACHE_VERIFIED === 'true' && process.env.NPM_SAME_JOB_ARCHIVE_RELEASED === 'true'
      && process.env.NPM_SAME_JOB_STAGE_RELEASED === 'true');
    const dirs = Object.fromEntries(['input', 'output', 'rootfs', 'home', 'docker-config'].map(k => [k, path.join(root, k)]));
    for (const p of Object.values(dirs)) mutateFs(() => fs.mkdirSync(p, { mode: 0o700 }));
    const rootfsStat = fs.lstatSync(dirs.rootfs);
    const rootfsIdentity = { dev: rootfsStat.dev, ino: rootfsStat.ino };
    env = { HOME: dirs.home, DOCKER_CONFIG: dirs['docker-config'], DOCKER_HOST: 'unix:///var/run/docker.sock', PATH: '/usr/bin:/bin', LC_ALL: 'C', OPENSSL_CONF: '/dev/null' };
    stage = 'source-bindings';
    result.sourceCommit = run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'rev-parse', 'HEAD']); same(result.sourceCommit, process.env.GITHUB_SHA);
    result.headCommit = process.env.NPM_SAME_JOB_HEAD_SHA; result.baseCommit = process.env.NPM_SAME_JOB_BASE_SHA;
    // Raw commit headers retain parent identity at checkout's shallow boundary.
    const headHeader = run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'cat-file', '-p', 'HEAD']).split('\n\n', 1)[0];
    const headParents = headHeader.split('\n').filter(line => line.startsWith('parent ')).map(line => line.slice(7));
    same(headParents, [result.baseCommit, result.headCommit]);
    same(run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'status', '--porcelain', '--untracked-files=normal']), '');
    before = snapshot();
    result.sourceHashes = {};
    for (const [name, expected] of [['run-npm-same-job-control.mjs', process.env.NPM_SAME_JOB_CONTROLLER_SHA256],
      ['run-npm-preparation-control.mjs', 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7'],
      ['npm-preparation-probe.mjs', probeDigest], ['npm-lifecycle-observer.mjs', observerDigest], ['test-npm-preparation-control.mjs', testDigest],
      ['owned-rootfs-modes.mjs', modeHelperDigest], ['test-rootfs-directory-modes.mjs', modeTestDigest]]) {
      const relative = `docs/spikes/fixtures/${name}`, p = path.join(repo, relative), actual = fileHash(p, 1048576, checkDeadline).sha256;
      same(actual, expected); requireFact(before[relative]);
      same(run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'rev-parse', `${result.headCommit}:${relative}`]),
        run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'rev-parse', `HEAD:${relative}`])); result.sourceHashes[name] = actual;
    }
    stage = 'fixed-runtime';
    requireFact(fs.lstatSync(cache).isDirectory() && fs.realpathSync(cache) === cache && fs.lstatSync(`${cache}.complete`).isFile());
    same(fileHash(`${cache}/include/node/node_version.h`, 65536, checkDeadline).sha256, '0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad');
    fs.chmodSync(dirs.rootfs, 0o755);
    result.runtimeFiles = runtime.map(expected => {
      requireFact(fs.realpathSync(expected.source) === expected.source);
      const actual = { source: expected.source, destination: expected.destination, ...fileHash(expected.source, expected.bytes, checkDeadline) };
      same(actual, expected);
      return actual;
    }); validateRuntimeInventory(result.runtimeFiles);
    stage = 'npm-inventory';
    requireFact(fs.lstatSync(npmRoot).isDirectory() && fs.realpathSync(npmRoot) === npmRoot);
    const manifestBytes = boundedBytes(`${npmRoot}/package.json`, 65536, checkDeadline); same(hash(manifestBytes), manifestDigest);
    const manifest = JSON.parse(manifestBytes); requireFact(manifest.version === '11.19.1' && manifest.engines?.node === '^20.17.0 || >=22.9.0'
      && (manifest.bin === 'bin/npm-cli.js' || manifest.bin?.npm === 'bin/npm-cli.js'));
    const entries = []; let directoryCount = 0, totalBytes = 0, inventoryBytes = 2, builtinConfig = { state: 'absent' };
    const collect = (dir, relative = '', depth = 0) => {
      checkDeadline(); requireFact(depth <= 32);
      const names = fs.readdirSync(dir).sort(); requireFact(names.length <= 16384);
      for (const name of names) {
        const rel = relative ? `${relative}/${name}` : name;
        if (!relative && !['package.json', 'bin', 'lib', 'node_modules', 'npmrc', 'LICENSE'].includes(name)) continue;
        if (relative === 'bin' && name !== 'npm-cli.js') continue;
        const p = path.join(dir, name), st = fs.lstatSync(p); requireFact(!st.isSymbolicLink());
        if (name === '.bin') { requireFact(st.isDirectory()); continue; }
        if (st.isDirectory()) {
          requireFact(rel === 'bin' || rel === 'lib' || rel === 'node_modules' || npmPath(`${rel}/owned-placeholder`));
          requireFact(++directoryCount <= 8192 && rel.split('/').length <= 32); collect(p, rel, depth + 1);
        } else {
          requireFact(st.isFile() && st.nlink === 1 && npmPath(rel) && entries.length < 8192);
          const bytes = boundedBytes(p, 8388608, checkDeadline); totalBytes += bytes.length; requireFact(totalBytes <= 67108864);
          const e = { relativePath: rel, bytes: bytes.length, sha256: hash(bytes), kind: 'file', nlink: st.nlink, magicHex: bytes.subarray(0, 4).toString('hex') };
          inventoryBytes += Buffer.byteLength(JSON.stringify(e)) + (entries.length ? 1 : 0);
          requireFact(inventoryBytes <= 4194303); entries.push(e);
          if (rel === 'npmrc') {
            requireFact(bytes.toString('utf8').split(/\r?\n/).every(line => /^\s*(?:[#;].*)?$/.test(line)));
            builtinConfig = { state: 'comments-only', sha256: e.sha256 };
          }
        }
      }
    }; collect(npmRoot); entries.sort((a, b) => a.relativePath < b.relativePath ? -1 : 1);
    const metadata = { version: manifest.version, nodeEngine: manifest.engines.node, manifestSha256: manifestDigest, builtinConfig, directoryCount };
    validateNpmInventory(entries, metadata);
    const inventoryText = `${JSON.stringify(entries)}\n`; requireFact(Buffer.byteLength(inventoryText) <= 4194304);
    result.npmInventory = { sha256: hash(inventoryText), files: entries.length, directoryCount, bytes: totalBytes, inventoryBytes: Buffer.byteLength(inventoryText), metadata };
    // Before any rootfs payload write, admit the complete accepted file/directory table.
    const planned = [...runtime.map(r => ({ relativePath: r.destination.slice(1), bytes: r.bytes })),
      ...entries.map(e => ({ relativePath: `npm/${e.relativePath}`, bytes: e.bytes })),
      { relativePath: 'npm-probe.mjs', bytes: 65536 }, { relativePath: 'lifecycle-observer.mjs', bytes: 65536 },
      { relativePath: 'config/user.npmrc', bytes: 0 }, { relativePath: 'config/global.npmrc', bytes: 0 }];
    const plannedDirs = new Set(['']);
    for (const p of planned) { const bits = p.relativePath.split('/'); for (let i = 1; i < bits.length; i++) plannedDirs.add(bits.slice(0, i).join('/')); }
    const rootfsBound = planned.reduce((n, p) => n + Math.max(4096, Math.ceil(p.bytes / 4096) * 4096) + 4096, 0) + 8192 * plannedDirs.size;
    // 200MiB tar, bounded inventory/output/config and private-root allocation reserves.
    filesystemBound = rootfsBound + 200 * 1048576 + 8 * 1048576;
    diskCheckpoint(); result.diskAdmission = { cacheAllocatedBytes: cacheLive, rootfsBoundBytes: rootfsBound,
      filesystemBoundBytes: filesystemBound, dockerReserveBytes: dockerReserve, safetyReserveBytes: 16 * 1048576,
      dockerPhysicalPeakMeasured: false };
    for (const expected of runtime) {
      const destination = path.join(dirs.rootfs, expected.destination);
      mutateFs(() => fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 }));
      mutateFs(() => fs.copyFileSync(expected.source, destination, fs.constants.COPYFILE_EXCL)); fs.chmodSync(destination, 0o555);
      same(fileHash(destination, expected.bytes, checkDeadline), { bytes: expected.bytes, sha256: expected.sha256 });
      same(fileHash(expected.source, expected.bytes, checkDeadline), { bytes: expected.bytes, sha256: expected.sha256 });
    }
    let copiedFiles = 0;
    for (const e of entries) {
      const source = path.join(npmRoot, e.relativePath), destination = path.join(dirs.rootfs, 'npm', e.relativePath);
      requireFact(fs.lstatSync(source).nlink === 1); same(fileHash(source, 8388608, checkDeadline), { bytes: e.bytes, sha256: e.sha256 });
      mutateFs(() => fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 })); mutateFs(() => fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL)); fs.chmodSync(destination, 0o444);
      same(fileHash(destination, 8388608, checkDeadline), { bytes: e.bytes, sha256: e.sha256 });
      same(fileHash(source, 8388608, checkDeadline), { bytes: e.bytes, sha256: e.sha256 }); requireFact(fs.lstatSync(source).nlink === 1);
      if (++copiedFiles % 128 === 0) diskCheckpoint();
    }
    const inventoryPath = path.join(runnerTemp, 'basic-npm-same-job-inventory.json');
    mutateFs(() => fs.writeFileSync(inventoryPath, inventoryText, { flag: 'wx', mode: 0o600 })); result.npmInventory.artifact = 'basic-npm-same-job-inventory.json';
    stage = 'owned-fixture';
    const probeText = boundedBytes(path.join(repo, 'docs/spikes/fixtures/npm-preparation-probe.mjs'), 65536, checkDeadline).toString('utf8');
    result.inputHashes = { manifest: '2f7fd9cadad92c0af5e113c0ad0140023608312db9ea83050e8bef56ced745eb', lock: '465eac71e5d2ba4a43c47a546ee9280d7d518c320abae0d0d6a7c03e175e7dbe' };
    const manifestText = probeText.match(/export const manifestText = `([^`]+)`;/)?.[1], lockText = probeText.match(/export const lockText = `([^`]+)`;/)?.[1];
    requireFact(manifestText && lockText && hash(manifestText) === '2f7fd9cadad92c0af5e113c0ad0140023608312db9ea83050e8bef56ced745eb'
      && hash(lockText) === '465eac71e5d2ba4a43c47a546ee9280d7d518c320abae0d0d6a7c03e175e7dbe');
    for (const [name, text] of [['package.json', manifestText], ['package-lock.json', lockText]]) mutateFs(() => fs.writeFileSync(path.join(dirs.input, name), text, { flag: 'wx', mode: 0o600 }));
    for (const [name, destination, mode] of [['npm-preparation-probe.mjs', 'npm-probe.mjs', 0o444], ['npm-lifecycle-observer.mjs', 'lifecycle-observer.mjs', 0o555]]) {
      const source = path.join(repo, 'docs/spikes/fixtures', name), dest = path.join(dirs.rootfs, destination);
      mutateFs(() => fs.copyFileSync(source, dest, fs.constants.COPYFILE_EXCL)); fs.chmodSync(dest, mode); same(fileHash(dest, 65536, checkDeadline).sha256, result.sourceHashes[name]);
    }
    mutateFs(() => fs.mkdirSync(path.join(dirs.rootfs, 'config'), { mode: 0o755 }));
    for (const name of ['user.npmrc', 'global.npmrc']) mutateFs(() => fs.writeFileSync(path.join(dirs.rootfs, 'config', name), '', { flag: 'wx', mode: 0o444 }));
    stage = 'owned-rootfs-modes';
    checkRoot();
    result.rootfsModes = normalizeOwnedRootfsModes(dirs.rootfs, rootfsIdentity, [...plannedDirs], checkDeadline);
    checkRoot();
    stage = 'import-owned-rootfs';
    diskCheckpoint();
    const archive = path.join(root, 'owned-rootfs.tar'); run('/usr/bin/tar', ['--owner=0', '--group=0', '--numeric-owner', '-C', dirs.rootfs, '-cf', archive, '.']);
    const tarObservation = fileHash(archive, 209715200, checkDeadline);
    result.rootfsTarSha256 = tarObservation.sha256; result.rootfsTarBytes = tarObservation.bytes;
    dockerReserve = 2 * tarObservation.bytes + 16 * 1048576;
    diskCheckpoint();
    const imageId = mutateDocker(['image', 'import', '--change', `ENTRYPOINT ${JSON.stringify(entrypoint)}`, '--change',
      `LABEL personal.basic.confinement=${nonce}`, '--change', 'USER 65532:65532', '--change', 'ENV PATH=/usr/bin:/bin', archive]);
    if (!/^sha256:[a-f0-9]{64}$/.test(imageId)) { mutationOutcomeUncertain = true; throw new Error('owned-npm-requirement'); } result.imageId = imageId;
    const image = JSON.parse(docker(['image', 'inspect', '--format', '{"id":{{json .Id}},"label":{{json (index .Config.Labels "personal.basic.confinement")}},"entrypoint":{{json .Config.Entrypoint}},"cmd":{{json .Config.Cmd}},"env":{{json .Config.Env}}}', imageId]));
    requireFact(absent(image.cmd)); delete image.cmd; same(image, { id: imageId, label: nonce, entrypoint, env: ['PATH=/usr/bin:/bin'] });
    const logicalSize = Number(docker(['image', 'inspect', '--format', '{{.Size}}', imageId]));
    requireFact(Number.isSafeInteger(logicalSize) && logicalSize > 0 && logicalSize <= 209715200);
    result.diskAdmission.imageLogicalBytes = logicalSize; diskCheckpoint();
    stage = 'create-and-inspect';
    const options = { imageId, name: `basic-npm-${nonce}`, uid, gid, input: dirs.input, output: dirs.output, nonce };
    const containerId = mutateDocker(buildNpmContainerArgs(options));
    if (!/^[a-f0-9]{64}$/.test(containerId)) { mutationOutcomeUncertain = true; throw new Error('owned-npm-requirement'); } result.containerId = containerId;
    const policy = JSON.parse(docker(['inspect', '--format', policyTemplate, containerId])); requireFact(policy.mounts.pop() === null);
    same(policy.hostname, 'fixture'); same(policy.tty, false); requireFact(absent(policy.links));
    same([...policy.configuredEnv].sort(), ['FIXTURE_VISIBLE=synthetic', 'HOME=/nonexistent', 'PATH=/usr/bin:/bin']);
    delete policy.hostname; delete policy.tty; delete policy.links; delete policy.configuredEnv; policy.envKeys = Object.keys(childEnv).sort();
    verifyNpmPolicy(policy, options); result.policy = { ...policy, mounts: policy.mounts.map(m => ({ ...m, source: m.destination === '/input' ? 'OWNED_INPUT' : 'OWNED_OUTPUT' })) };
    stage = 'owned-npm-control';
    let stdout, startError, firstCommandFailure;
    result.targetInvocationAttempted = true;
    try { stdout = docker(['start', '--attach', containerId], 10000); }
    catch (error) { startError = error; firstCommandFailure = commandFailure;
      result.startupErrorClassification = classifyOwnedStartupError(error.stderr); }
    try {
      result.containerState = JSON.parse(docker(['inspect', '--format', '{"exit":{{json .State.ExitCode}},"oomKilled":{{json .State.OOMKilled}},"running":{{json .State.Running}}}', containerId]));
    } catch (error) { if (!startError) throw error; }
    if (startError) { commandFailure = firstCommandFailure; throw startError; }
    same(result.containerState, { exit: 0, oomKilled: false, running: false }); candidateObservation = JSON.parse(stdout);
    stage = 'independent-owned-output';
    same(fileHash(inventoryPath, 4194304, checkDeadline), { bytes: result.npmInventory.inventoryBytes, sha256: result.npmInventory.sha256 });
    result.output = inspectOutput(dirs.output, manifestText, lockText, checkDeadline);
    same(fs.readdirSync(dirs.input).sort(), ['package-lock.json', 'package.json']);
    for (const name of ['package.json', 'package-lock.json']) requireFact(fs.lstatSync(path.join(dirs.input, name)).nlink === 1);
    same(boundedBytes(path.join(dirs.input, 'package.json'), 16384, checkDeadline).toString('utf8'), manifestText);
    same(boundedBytes(path.join(dirs.input, 'package-lock.json'), 16384, checkDeadline).toString('utf8'), lockText);
    diskCheckpoint();
    result.diskAdmission.measuredOwnedFilesystemPeakBytes = filesystemPeak;
    result.diskAdmission.peakAdmittedBytes = admittedPeak;
    stage = 'source-preservation'; same(snapshot(), before); result.trackedSourceFilesUnchanged = Object.keys(before).length;
    same(run('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, 'status', '--porcelain', '--untracked-files=normal']), '');
    // Do not overwrite foreign controller fields supplied by the child.
    requireFact(!['cleanupComplete', 'mutationOutcomeUncertain', 'sourcePreserved'].some(k => k in candidateObservation));
    result.observation = candidateObservation;
  } catch (error) {
    result.failure = { stage, reason: 'owned-npm-requirement', code: typeof error.code === 'string' ? error.code.slice(0, 32) : null,
      command: commandFailure, contained: null };
    // Retain only a bounded, owned structured probe failure; never raw stderr/config/environment.
    if (stage === 'owned-npm-control' && error.stderr && Buffer.byteLength(error.stderr) <= 65536) {
      try { const f = JSON.parse(String(error.stderr));
        if (f.status === 'INDETERMINATE' && typeof f.stage === 'string' && f.stage.length <= 40 && f.reason === 'owned-npm-requirement')
          result.failure.contained = { status: f.status, stage: f.stage, reason: f.reason, child: f.child ?? null };
      } catch { /* A non-JSON failure remains the first bounded command failure. */ }
    }
  } finally {
    cleanupDeadline = performance.now() + 10000;
    mutationOutcomeUncertain ||= pendingRoot;
    const failures = mutationOutcomeUncertain ? ['mutating-operation-outcome-unknown'] : [];
    if (env && nonce && objectOpsAttempted) for (const [kind, listArgs, removeArgs] of [
      ['container', ['container', 'ls', '--all'], ['container', 'rm', '--force']], ['image', ['image', 'ls'], ['image', 'rm']]]) {
      try {
        const ids = docker([...listArgs, '--filter', `label=personal.basic.confinement=${nonce}`, '--no-trunc', '--format', '{{.ID}}'], 5000, true).split('\n').filter(Boolean);
        requireFact(ids.length <= 1 && ids.every(id => /^(sha256:)?[a-f0-9]{64}$/.test(id)));
        for (const id of ids) docker([...removeArgs, id], 5000, true);
        same(docker([...listArgs, '--filter', `label=personal.basic.confinement=${nonce}`, '--no-trunc', '--format', '{{.ID}}'], 5000, true), '');
      } catch { failures.push(kind); }
    }
    if (root) { try { requireFact(performance.now() < cleanupDeadline); ownedRootRemoval(); requireFact(performance.now() < cleanupDeadline); } catch { mutationOutcomeUncertain = true; failures.push('files'); } }
    result.cleanup = { completed: failures.length === 0 && !mutationOutcomeUncertain, mutationOutcomeUncertain, failures };
    if (result.diskAdmission) { result.diskAdmission.measuredOwnedFilesystemPeakBytes = filesystemPeak; result.diskAdmission.peakAdmittedBytes = admittedPeak; }
    if (!result.failure && candidateObservation) {
      try {
        const final = { ...candidateObservation, cleanupComplete: result.cleanup.completed, mutationOutcomeUncertain, sourcePreserved: true };
        verifyNpmObservation(final); result.observation = final; result.status = 'NPM11_OWNED_PREPARATION_CONTROL_PASSED';
      } catch { result.failure = { stage: 'finalization', reason: 'owned-npm-requirement' }; }
    }
    result.completedAt = new Date().toISOString(); result.elapsedMs = performance.now() - clockStart;
  }
  const text = `${JSON.stringify(result)}\n`;
  if (Buffer.byteLength(text) <= 65536) process.stdout.write(text);
  else { result.status = 'INDETERMINATE'; process.stdout.write(`${JSON.stringify({ status: result.status, failure: { stage: 'receipt-size', reason: 'owned-npm-requirement' }, cleanup: result.cleanup })}\n`); }
  if (result.status !== 'NPM11_OWNED_PREPARATION_CONTROL_PASSED') process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
