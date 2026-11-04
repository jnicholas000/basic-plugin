// DO_NOT_COPY: cache-only inert host control, never a runtime installer or candidate executor.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const fact = value => { if (!value) throw new Error('cached-node24-control-requirement'); };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const result = { schemaVersion: 1, status: 'INDETERMINATE', installedRuntime: false,
  dependenciesAcquired: false, npmExecuted: false, upstreamExecuted: false, realCredentialsProbed: false };
let root, stage = 'admission';
const started = Date.now();
try {
  fact(process.argv.length === 2 && process.platform === 'linux' && process.arch === 'x64'
    && process.env.GITHUB_EVENT_NAME === 'pull_request'
    && process.env.GITHUB_HEAD_REF === 'spike/node-dependency-preparation-20261104'
    && process.env.GITHUB_RUN_ATTEMPT === '1');
  fact(/^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '')
    && /^[a-f0-9]{40}$/.test(process.env.NODE_PREP_HEAD_SHA ?? ''));
  const repo = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'));
  fact(fs.realpathSync(process.cwd()) === repo);
  const temporary = fs.realpathSync(process.env.RUNNER_TEMP);
  root = fs.mkdtempSync(path.join(temporary, 'cached-node24-control-'));
  fs.mkdirSync(path.join(root, 'home'), { mode: 0o700 });
  fs.mkdirSync(path.join(root, 'tmp'), { mode: 0o700 });
  const env = { HOME: path.join(root, 'home'), TMPDIR: path.join(root, 'tmp'),
    PATH: '/usr/bin:/bin', OPENSSL_CONF: '/dev/null' };
  const git = (...args) => execFileSync('/usr/bin/git', ['--no-lazy-fetch', '-C', repo, ...args],
    { cwd: root, env, timeout: 3000, maxBuffer: 16384, stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8').trim();
  result.sourceCommit = git('rev-parse', 'HEAD'); fact(result.sourceCommit === process.env.GITHUB_SHA);
  result.headCommit = process.env.NODE_PREP_HEAD_SHA;
  const snapshot = () => Object.fromEntries(git('ls-files', '-z').split('\0').filter(Boolean).sort().map(n => {
    const p = path.join(repo, n); fact(fs.lstatSync(p).isFile()); return [n, sha(fs.readFileSync(p))];
  }));
  const before = snapshot();
  stage = 'read-existing-cache';
  const cache = fs.realpathSync('/opt/hostedtoolcache/node');
  const versions = fs.readdirSync(cache).filter(v => /^24\.\d+\.\d+$/.test(v)).sort((a, b) => {
    const x = a.split('.').map(Number), y = b.split('.').map(Number);
    return y[1] - x[1] || y[2] - x[2];
  });
  fact(versions.length > 0 && versions.length <= 16);
  const version = versions[0], directory = path.join(cache, version, 'x64');
  fact(fs.lstatSync(directory).isDirectory() && fs.lstatSync(`${directory}.complete`).isFile());
  const within = p => {
    const real = fs.realpathSync(p); fact(real.startsWith(`${cache}/`) && fs.lstatSync(real).isFile());
    return real;
  };
  const binary = within(path.join(directory, 'bin/node'));
  const header = within(path.join(directory, 'include/node/node_version.h'));
  const npmManifest = within(path.join(directory, 'lib/node_modules/npm/package.json'));
  fact(fs.statSync(binary).size <= 268435456 && fs.statSync(header).size <= 65536
    && fs.statSync(npmManifest).size <= 65536);
  const headerText = fs.readFileSync(header, 'utf8');
  const fields = ['MAJOR', 'MINOR', 'PATCH'].map(k => {
    const matches = [...headerText.matchAll(new RegExp(`^#define NODE_${k}_VERSION\\s+(\\d+)\\s*$`, 'gm'))];
    fact(matches.length === 1); return matches[0][1];
  });
  fact(fields.join('.') === version);
  const bytes = fs.readFileSync(binary);
  fact(bytes.subarray(0, 4).equals(Buffer.from([127, 69, 76, 70])) && bytes[4] === 2
    && bytes[5] === 1 && bytes.readUInt16LE(18) === 62);
  const npm = JSON.parse(fs.readFileSync(npmManifest, 'utf8'));
  fact(typeof npm.version === 'string' && typeof npm.engines?.node === 'string');
  result.cachedRuntime = { version, relativeCachePath: `${version}/x64/bin/node`,
    nodeBinarySha256: sha(bytes), headerSha256: sha(Buffer.from(headerText)),
    npmManifestSha256: sha(fs.readFileSync(npmManifest)), npmVersion: npm.version,
    npmNodeEngine: npm.engines.node };
  result.runnerEnvironmentMetadata = { imageOS: process.env.ImageOS ?? null, imageVersion: process.env.ImageVersion ?? null };
  const probe = path.join(repo, 'docs/spikes/fixtures/node24-host-probe.mjs');
  fact(fs.lstatSync(probe).isFile());
  result.probeSha256 = sha(fs.readFileSync(probe));
  result.wrapperSha256 = sha(fs.readFileSync(fileURLToPath(import.meta.url)));
  stage = 'owned-inert-probe';
  const raw = execFileSync(binary, [probe], { cwd: root, env, timeout: 5000, maxBuffer: 8192,
    stdio: ['ignore', 'pipe', 'pipe'] });
  result.observation = JSON.parse(raw.toString('utf8'));
  fact(result.observation.status === 'INERT_NODE24_HOST_PROBE_PASSED'
    && result.observation.node === `v${version}` && result.observation.markerRemoved === true);
  fact(JSON.stringify(snapshot()) === JSON.stringify(before));
  result.trackedSourceFilesUnchanged = Object.keys(before).length;
  result.status = 'CACHED_NODE24_INERT_HOST_CONTROL_PASSED';
} catch (error) {
  result.failure = { stage, code: error.code ?? null, signal: error.signal ?? null,
    diagnostic: error.stderr ? String(error.stderr).slice(0, 2048) : error.message };
} finally {
  try { if (root) { fs.rmSync(root, { recursive: true, force: true }); fact(!fs.existsSync(root)); } result.cleanupCompleted = true; }
  catch { result.cleanupCompleted = false; result.status = 'INDETERMINATE'; }
  result.elapsedMs = Date.now() - started;
  result.limits = ['HOST_PROBE_ONLY', 'NO_NODE_CONTAINER_OR_DEPENDENCY_QUALIFICATION', 'NO_UPSTREAM_EXECUTION_AUTHORITY'];
}
process.stdout.write(`${JSON.stringify(result)}\n`);
if (result.status !== 'CACHED_NODE24_INERT_HOST_CONTROL_PASSED' || !result.cleanupCompleted) process.exitCode = 1;
