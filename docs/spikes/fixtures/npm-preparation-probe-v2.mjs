// DO_NOT_COPY: owned, empty-graph npm control. Import is inert; execution is CI-only.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

// Controlled v2 copy: only optional empty remove and witness-version separation differ.
export const npmContractVersion = 'owned-empty-ci/v2';

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

// Pure closed diagnostics preserve the original ci oracle; failed output is never retained.
const ciCheckpoints = ['ci-exit', 'ci-stderr', 'ci-json', 'ci-added', 'ci-changed', 'ci-audited',
  'ci-funding', 'ci-removed', 'ci-keys', 'ci-add', 'ci-change', 'ci-remove', 'ci-accepted'];
const jsonKinds = ['not-parsed', 'null', 'object', 'array', 'string', 'number', 'boolean'];
const details = ['none', 'nonzero-exit', 'nonempty-stderr', 'parse-error', 'missing', 'wrong-type',
  'nonzero', 'not-safe-nonnegative-integer', 'unexpected-keys', 'not-array', 'nonempty-array'];
const passedCheckpoints = ['admission', 'observer-positive', 'observer-reset', 'npm-version'];
const failureCodes = ['ETIMEDOUT', 'ENOENT', 'EACCES', 'ENOBUFS', 'OTHER'];
const failureSignals = ['SIGTERM', 'SIGKILL', 'SIGABRT', 'SIGSEGV', 'SIGBUS', 'SIGILL',
  'SIGFPE', 'SIGPIPE', 'SIGINT', 'SIGHUP', 'OTHER'];
const closed = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value)
  && Reflect.ownKeys(value).length === keys.length && Reflect.ownKeys(value).every(key => keys.includes(key));

export function evaluateOwnedCiResult(ci) {
  let jsonKind = 'not-parsed', summary;
  const result = (checkpoint, detail, accepted = false) => ({ accepted,
    summary: accepted ? summary : null, diagnostic: { checkpoint, jsonKind, detail } });
  if (ci?.status !== 0) return result('ci-exit', 'nonzero-exit');
  if (ci.stderr !== '') return result('ci-stderr', 'nonempty-stderr');
  try { summary = JSON.parse(ci.stdout); } catch { return result('ci-json', 'parse-error'); }
  jsonKind = summary === null ? 'null' : Array.isArray(summary) ? 'array' : typeof summary;
  for (const key of ['added', 'changed', 'audited', 'funding']) {
    if (summary === null) return result(`ci-${key}`, 'wrong-type');
    const value = summary[key];
    if (value !== 0) return result(`ci-${key}`, value === undefined ? 'missing' : typeof value === 'number' ? 'nonzero' : 'wrong-type');
  }
  if (!Number.isSafeInteger(summary.removed) || summary.removed < 0) return result('ci-removed', 'not-safe-nonnegative-integer');
  if (!Object.keys(summary).every(key => ['added', 'removed', 'changed', 'audited', 'funding', 'add', 'change', 'remove'].includes(key)))
    return result('ci-keys', 'unexpected-keys');
  for (const key of ['add', 'change', 'remove']) if (key in summary) {
    if (!Array.isArray(summary[key])) return result(`ci-${key}`, 'not-array');
    if (summary[key].length !== 0) return result(`ci-${key}`, 'nonempty-array');
  }
  return result('ci-accepted', 'none', true);
}

export function sanitizeOwnedNpmFailure(value) {
  try {
    if (!closed(value, ['status', 'stage', 'reason', 'code', 'child', 'witness'])
      || value.status !== 'INDETERMINATE' || value.reason !== 'owned-npm-requirement'
      || !(value.code === null || failureCodes.includes(value.code))
      || Buffer.byteLength(JSON.stringify(value)) > 2048) return null;
    const w = value.witness;
    if (!closed(w, ['version', 'passed', 'ci']) || w.version !== 2 || !Array.isArray(w.passed)
      || w.passed.length > 4 || !passedCheckpoints.slice(0, w.passed.length)
        .every((item, index) => Object.hasOwn(w.passed, index) && w.passed[index] === item)) return null;
    let ci = null;
    if (w.ci !== null) {
      if (!closed(w.ci, ['checkpoint', 'jsonKind', 'detail']) || !ciCheckpoints.includes(w.ci.checkpoint)
        || !jsonKinds.includes(w.ci.jsonKind) || !details.includes(w.ci.detail)) return null;
      const d = w.ci;
      const allowed = d.checkpoint === 'ci-exit' ? d.jsonKind === 'not-parsed' && d.detail === 'nonzero-exit'
        : d.checkpoint === 'ci-stderr' ? d.jsonKind === 'not-parsed' && d.detail === 'nonempty-stderr'
        : d.checkpoint === 'ci-json' ? d.jsonKind === 'not-parsed' && d.detail === 'parse-error'
        : d.checkpoint === 'ci-added' && d.jsonKind === 'null' ? d.detail === 'wrong-type'
        : d.checkpoint === 'ci-added' && ['array', 'string', 'number', 'boolean'].includes(d.jsonKind) ? d.detail === 'missing'
        : ['ci-added', 'ci-changed', 'ci-audited', 'ci-funding'].includes(d.checkpoint)
          ? d.jsonKind === 'object' && ['missing', 'wrong-type', 'nonzero'].includes(d.detail)
        : d.checkpoint === 'ci-removed' ? d.jsonKind === 'object' && d.detail === 'not-safe-nonnegative-integer'
        : d.checkpoint === 'ci-keys' ? d.jsonKind === 'object' && d.detail === 'unexpected-keys'
        : ['ci-add', 'ci-change', 'ci-remove'].includes(d.checkpoint) ? d.jsonKind === 'object' && ['not-array', 'nonempty-array'].includes(d.detail)
        : d.checkpoint === 'ci-accepted' && d.jsonKind === 'object' && d.detail === 'none';
      if (!allowed) return null;
      ci = { checkpoint: d.checkpoint, jsonKind: d.jsonKind, detail: d.detail };
    }
    const length = w.passed.length;
    const consistent = value.stage === 'admission' ? length === 0 && ci === null
      : value.stage === 'observer-positive' ? (length === 1 || length === 2) && ci === null
      : value.stage === 'npm-version' ? length === 3 && ci === null
      : value.stage === 'npm-ci' ? length === 4 && ci === null
      : value.stage === 'owned-output' ? length === 4 && ci?.checkpoint === 'ci-accepted'
      : ciCheckpoints.includes(value.stage) && length === 4 && ci?.checkpoint === value.stage;
    if (!consistent) return null;
    let child = null;
    if (value.child !== null) {
      const c = value.child;
      if (!closed(c, ['exit', 'signal', 'code', 'timedOut', 'stdoutBytes', 'stderrBytes'])
        || !(c.exit === null || Number.isInteger(c.exit) && c.exit >= 0 && c.exit <= 255)
        || !(c.signal === null || failureSignals.includes(c.signal)) || !(c.code === null || failureCodes.includes(c.code))
        || typeof c.timedOut !== 'boolean' || ![c.stdoutBytes, c.stderrBytes].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 65536)) return null;
      child = { exit: c.exit, signal: c.signal, code: c.code, timedOut: c.timedOut,
        stdoutBytes: c.stdoutBytes, stderrBytes: c.stderrBytes };
    }
    const copy = { status: 'INDETERMINATE', stage: value.stage, reason: 'owned-npm-requirement', code: value.code,
      child, witness: { version: 2, passed: [...w.passed], ci } };
    return Buffer.byteLength(JSON.stringify(copy)) <= 2048 ? copy : null;
  } catch { return null; }
}

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
  const witness = { version: 2, passed: [], ci: null };
  const started = performance.now(), deadline = started + 85000;
  const observed = { node: process.version };
  const run = (args, limit) => {
    const timeout = Math.min(limit, Math.floor(deadline - performance.now()));
    requireFact(timeout > 0);
    const child = spawnSync('/runtime/node', args, { cwd: project, env: { ...childEnv }, timeout,
      maxBuffer: 65536, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    childFailure = { exit: child.status,
      signal: child.signal === null ? null : failureSignals.includes(child.signal) ? child.signal : 'OTHER',
      code: typeof child.error?.code === 'string' ? (failureCodes.includes(child.error.code) ? child.error.code : 'OTHER') : null,
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
    witness.passed.push('admission');
    stage = 'observer-positive';
    const positive = run(['--max-old-space-size=32', '/lifecycle-observer.mjs', '-c', '/lifecycle-observer.mjs'], 5000);
    observed.observerPositiveExit = positive.status;
    observed.observerPositiveMarker = fs.existsSync(marker) && fs.lstatSync(marker).isFile()
      && fs.readFileSync(marker, 'utf8') === 'owned-lifecycle-observer\n';
    requireFact(observed.observerPositiveExit === 73 && observed.observerPositiveMarker);
    witness.passed.push('observer-positive');
    fs.unlinkSync(marker); observed.observerReset = !fs.existsSync(marker); requireFact(observed.observerReset);
    witness.passed.push('observer-reset');
    stage = 'npm-version';
    const version = run(['--max-old-space-size=32', '/npm/bin/npm-cli.js', ...commonFlags, '--version'], 10000);
    Object.assign(observed, { versionExit: version.status, versionSignal: version.signal,
      versionTimedOut: false, versionStdoutBytes: Buffer.byteLength(version.stdout) });
    requireFact(version.status === 0 && /^11\.19\.1\r?\n$/.test(version.stdout) && version.stderr === '');
    observed.npmVersion = '11.19.1';
    witness.passed.push('npm-version');
    stage = 'npm-ci';
    const ci = run(['--max-old-space-size=32', '/npm/bin/npm-cli.js', ...commonFlags, 'ci', '--json'], 10000);
    Object.assign(observed, { ciExit: ci.status, ciSignal: ci.signal, ciTimedOut: false,
      ciStdoutBytes: Buffer.byteLength(ci.stdout) });
    const evaluation = evaluateOwnedCiResult(ci);
    witness.ci = evaluation.diagnostic;
    stage = evaluation.diagnostic.checkpoint;
    requireFact(evaluation.accepted);
    observed.ciSummary = evaluation.summary;
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
    const failure = sanitizeOwnedNpmFailure({ status: 'INDETERMINATE', stage, reason: 'owned-npm-requirement',
      code: typeof error.code === 'string' ? (['ETIMEDOUT', 'ENOENT', 'EACCES', 'ENOBUFS', 'OTHER'].includes(error.code) ? error.code : 'OTHER') : null,
      child: childFailure, witness });
    // Invalid evidence stays a fixed generic failure; no raw text or unvalidated witness is emitted.
    process.stderr.write(`${JSON.stringify(failure ?? { status: 'INDETERMINATE', reason: 'owned-npm-requirement' })}\n`);
    process.exitCode = 1;
  }
}
// No subprocess or filesystem work occurs on import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
