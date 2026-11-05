// DO_NOT_COPY: owned, empty-graph npm control. Import is inert; execution is CI-only.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

export const manifestText = `{
  "name": "owned-npm-preparation-control",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "preinstall": "/lifecycle-observer.mjs",
    "install": "/lifecycle-observer.mjs",
    "postinstall": "/lifecycle-observer.mjs",
    "prepublish": "/lifecycle-observer.mjs",
    "preprepare": "/lifecycle-observer.mjs",
    "prepare": "/lifecycle-observer.mjs",
    "postprepare": "/lifecycle-observer.mjs"
  }
}
`;
export const lockText = `{
  "name": "owned-npm-preparation-control",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "owned-npm-preparation-control",
      "version": "1.0.0",
      "hasInstallScript": true
    }
  }
}
`;
export const commonFlags = Object.freeze([
  '--offline', '--ignore-scripts', '--audit=false', '--fund=false', '--update-notifier=false',
  '--userconfig=/config/user.npmrc', '--globalconfig=/config/global.npmrc',
  '--cache=/output/cache', '--prefix=/output/project', '--global=false', '--workspaces=false',
  '--include-workspace-root=false', '--logs-max=0', '--loglevel=error', '--progress=false',
  '--color=false', '--fetch-retries=0', '--bin-links=false', '--script-shell=/lifecycle-observer.mjs',
]);
export const childEnv = Object.freeze({ HOME: '/nonexistent', PATH: '/usr/bin:/bin', FIXTURE_VISIBLE: 'synthetic', HOSTNAME: 'fixture' });
const requireFact = value => { if (!value) throw new Error('owned-npm-requirement'); };
const marker = '/output/lifecycle-observed.txt';
const project = '/output/project';

function hiddenLockAccepted(bytes) {
  requireFact(bytes.length <= 16384);
  const lock = JSON.parse(bytes);
  requireFact(lock && lock.name === 'owned-npm-preparation-control' && lock.version === '1.0.0' && lock.lockfileVersion === 3);
  requireFact(Object.keys(lock).every(k => ['name', 'version', 'lockfileVersion', 'requires', 'packages'].includes(k)));
  requireFact(lock.requires === undefined || lock.requires === true);
  requireFact(lock.packages && !Array.isArray(lock.packages) && Object.keys(lock.packages).length === 0);
}
function inspectOwnedOutput() {
  let entries = 0, bytes = 0;
  const walk = (dir, relative = '', depth = 0) => {
    requireFact(depth <= 8);
    for (const name of fs.readdirSync(dir).sort()) {
      const rel = relative ? `${relative}/${name}` : name;
      const p = path.join(dir, name), st = fs.lstatSync(p);
      requireFact(++entries <= 128 && !st.isSymbolicLink() && st.nlink >= 1);
      if (st.isDirectory()) {
        requireFact(rel === 'project' || rel === 'project/node_modules' || rel === 'cache' || rel.startsWith('cache/'));
        walk(p, rel, depth + 1);
      } else {
        requireFact(st.isFile() && st.nlink === 1);
        bytes += st.size; requireFact(bytes <= 1048576);
        requireFact(['project/package.json', 'project/package-lock.json', 'project/node_modules/.package-lock.json'].includes(rel));
        if (rel.endsWith('/.package-lock.json')) hiddenLockAccepted(fs.readFileSync(p));
      }
    }
  };
  walk('/output');
  return { entries, bytes };
}
function main() {
  let stage = 'admission', childFailure = null;
  const started = performance.now(), deadline = started + 85000;
  const observed = { node: process.version };
  const run = (args, limit) => {
    const timeout = Math.min(limit, Math.floor(deadline - performance.now()));
    requireFact(timeout > 0);
    const child = spawnSync('/runtime/node', args, { cwd: project, env: { ...childEnv }, timeout,
      maxBuffer: 65536, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    childFailure = { exit: child.status, signal: child.signal, code: typeof child.error?.code === 'string' ? child.error.code : null,
      timedOut: child.error?.code === 'ETIMEDOUT', stdoutBytes: Buffer.byteLength(child.stdout ?? ''), stderrBytes: Buffer.byteLength(child.stderr ?? '') };
    requireFact(!child.error && child.signal === null && child.stdout !== null && child.stderr !== null
      && childFailure.stdoutBytes <= 65536 && childFailure.stderrBytes <= 65536);
    return child;
  };
  try {
    requireFact(process.platform === 'linux' && process.arch === 'x64' && process.version === 'v24.22.1'
      && process.argv.length === 2 && process.argv[1] === '/npm-probe.mjs');
    requireFact(fs.readdirSync('/output').length === 0);
    requireFact(JSON.stringify(fs.readdirSync('/input').sort()) === JSON.stringify(['package-lock.json', 'package.json']));
    for (const [name, expected] of [['package.json', manifestText], ['package-lock.json', lockText]]) {
      const st = fs.lstatSync(`/input/${name}`);
      requireFact(st.isFile() && !st.isSymbolicLink() && st.nlink === 1 && st.size <= 16384);
      requireFact(fs.readFileSync(`/input/${name}`, 'utf8') === expected);
    }
    fs.mkdirSync(project); fs.mkdirSync('/output/cache'); fs.mkdirSync(`${project}/node_modules`);
    fs.writeFileSync(`${project}/package.json`, manifestText, { flag: 'wx', mode: 0o600 });
    fs.writeFileSync(`${project}/package-lock.json`, lockText, { flag: 'wx', mode: 0o600 });
    fs.writeFileSync(`${project}/node_modules/owned-stale.txt`, 'owned-stale\n', { flag: 'wx', mode: 0o600 });
    stage = 'observer-positive';
    const positive = run(['--max-old-space-size=32', '/lifecycle-observer.mjs', '-c', '/lifecycle-observer.mjs'], 5000);
    observed.observerPositiveExit = positive.status;
    observed.observerPositiveMarker = fs.existsSync(marker) && fs.lstatSync(marker).isFile()
      && fs.readFileSync(marker, 'utf8') === 'owned-lifecycle-observer\n';
    requireFact(observed.observerPositiveExit === 73 && observed.observerPositiveMarker);
    fs.unlinkSync(marker); observed.observerReset = !fs.existsSync(marker); requireFact(observed.observerReset);
    stage = 'npm-version';
    const version = run(['--max-old-space-size=32', '/npm/bin/npm-cli.js', ...commonFlags, '--version'], 10000);
    Object.assign(observed, { versionExit: version.status, versionSignal: version.signal,
      versionTimedOut: false, versionStdoutBytes: Buffer.byteLength(version.stdout) });
    requireFact(version.status === 0 && /^11\.19\.1\r?\n$/.test(version.stdout) && version.stderr === '');
    observed.npmVersion = '11.19.1';
    stage = 'npm-ci';
    const ci = run(['--max-old-space-size=32', '/npm/bin/npm-cli.js', ...commonFlags, 'ci', '--json'], 10000);
    Object.assign(observed, { ciExit: ci.status, ciSignal: ci.signal, ciTimedOut: false,
      ciStdoutBytes: Buffer.byteLength(ci.stdout) });
    requireFact(ci.status === 0 && ci.stderr === '');
    observed.ciSummary = JSON.parse(ci.stdout);
    for (const k of ['added', 'changed', 'audited', 'funding']) requireFact(observed.ciSummary[k] === 0);
    requireFact(Number.isSafeInteger(observed.ciSummary.removed) && observed.ciSummary.removed >= 0);
    requireFact(Object.keys(observed.ciSummary).every(k => ['added', 'removed', 'changed', 'audited', 'funding', 'add', 'change'].includes(k)));
    for (const k of ['add', 'change']) if (k in observed.ciSummary) requireFact(Array.isArray(observed.ciSummary[k]) && observed.ciSummary[k].length === 0);
    stage = 'owned-output';
    Object.assign(observed, { observerAfterCi: fs.existsSync(marker), staleAfterCi: fs.existsSync(`${project}/node_modules/owned-stale.txt`),
      manifestUnchanged: fs.readFileSync(`${project}/package.json`, 'utf8') === manifestText,
      lockUnchanged: fs.readFileSync(`${project}/package-lock.json`, 'utf8') === lockText });
    requireFact(!observed.observerAfterCi && !observed.staleAfterCi && observed.manifestUnchanged && observed.lockUnchanged);
    const modules = fs.existsSync(`${project}/node_modules`) ? fs.readdirSync(`${project}/node_modules`) : [];
    requireFact(modules.every(n => n === '.package-lock.json'));
    observed.installedPackageCount = 0;
    inspectOwnedOutput(); observed.outputAccepted = true;
    const text = `${JSON.stringify(observed)}\n`; requireFact(Buffer.byteLength(text) <= 65536);
    // stdout only: host independently rechecks the mounted output and supplies cleanup/source facts.
    process.stdout.write(text);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ status: 'INDETERMINATE', stage, reason: 'owned-npm-requirement',
      code: typeof error.code === 'string' ? error.code.slice(0, 32) : null, child: childFailure })}\n`);
    process.exitCode = 1;
  }
}
// No subprocess or filesystem work occurs on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
