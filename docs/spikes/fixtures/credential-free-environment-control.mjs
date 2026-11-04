// DO_NOT_COPY: an environment-only negative control, never a candidate sandbox.
// Reads/writes only this process's newly created synthetic fixture; no real secrets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const probe = `
  import fs from 'node:fs';
  import path from 'node:path';
  const root = process.argv[1];
  const sibling = path.join(root, 'same-user-sibling');
  const readable = fs.readFileSync(path.join(sibling, 'synthetic-canary'), 'utf8')
    === 'synthetic-no-authority';
  fs.writeFileSync(path.join(sibling, 'synthetic-write'), 'fixture-write-observed');
  fs.writeFileSync('permitted-output.json', JSON.stringify({ fixture: true }));
  process.stdout.write(JSON.stringify({
    syntheticEnvironmentPresent: Object.hasOwn(process.env, 'FIXTURE_FAKE_TOKEN'),
    environmentKeys: Object.keys(process.env).sort(),
    ownedSiblingReadable: readable,
    ownedSiblingWritable: true,
    permittedOutputWritten: true
  }) + '\\n');
`;

assert.equal(process.argv.length, 2, 'fixture takes no arguments');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'basic-boundary-control-'));
const workspace = path.join(root, 'workspace');
const sibling = path.join(root, 'same-user-sibling');
const home = path.join(root, 'empty-home');
const temporary = path.join(root, 'temporary');
let result;
try {
  for (const directory of [workspace, sibling, home, temporary])
    fs.mkdirSync(directory, { mode: 0o700 });
  const canary = path.join(sibling, 'synthetic-canary');
  const writeControl = path.join(sibling, 'synthetic-write');
  fs.writeFileSync(canary, 'synthetic-no-authority', { mode: 0o600 });
  fs.writeFileSync(writeControl, 'original-fixture-state', { mode: 0o600 });
  const canaryHash = sha(fs.readFileSync(canary));
  const canaryMode = fs.statSync(canary).mode & 0o777;
  const writeMode = fs.statSync(writeControl).mode & 0o777;
  const baseEnvironment = { HOME: home, TMPDIR: temporary, PATH: '/usr/bin:/bin' };
  const observations = [];
  for (const [label, environment] of [
    ['positive-observer-control', { ...baseEnvironment, FIXTURE_FAKE_TOKEN: 'synthetic-no-authority' }],
    ['environment-allowlist-only', baseEnvironment]
  ]) {
    fs.writeFileSync(writeControl, 'original-fixture-state');
    const beforeWrite = sha(fs.readFileSync(writeControl));
    const output = path.join(workspace, 'permitted-output.json');
    if (fs.existsSync(output)) fs.unlinkSync(output);
    const raw = execFileSync(process.execPath, ['--input-type=module', '-e', probe, root], {
      cwd: workspace, env: environment, timeout: 3000, maxBuffer: 8192,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const observed = JSON.parse(raw.toString('utf8'));
    const suppliedKeys = Object.keys(environment).sort();
    const additionalKeys = observed.environmentKeys.filter(key => !suppliedKeys.includes(key));
    assert.deepEqual(observed.environmentKeys.filter(key => suppliedKeys.includes(key)), suppliedKeys);
    // One observed runtime-added key is retained by name only, never erased or read for value.
    assert(additionalKeys.every(key => key === '__CF_USER_TEXT_ENCODING'));
    assert.equal(observed.syntheticEnvironmentPresent, label === 'positive-observer-control');
    assert.equal(observed.ownedSiblingReadable, true);
    assert.equal(observed.ownedSiblingWritable, true);
    assert.equal(observed.permittedOutputWritten, true);
    assert.deepEqual(JSON.parse(fs.readFileSync(output)), { fixture: true });
    assert.notEqual(sha(fs.readFileSync(writeControl)), beforeWrite);
    assert.equal(fs.readFileSync(writeControl, 'utf8'), 'fixture-write-observed');
    assert.equal(sha(fs.readFileSync(canary)), canaryHash);
    assert.equal(fs.statSync(canary).mode & 0o777, canaryMode);
    assert.equal(fs.statSync(writeControl).mode & 0o777, writeMode);
    observations.push({ label, ...observed, additionalKeys, canaryUnchanged: true, modesUnchanged: true });
  }
  result = {
    schemaVersion: 1,
    status: 'ENVIRONMENT_ONLY_BOUNDARY_DISPROVEN_FOR_OWNED_FIXTURE',
    observations,
    limits: {
      realCredentialAccess: 'NOT_ATTEMPTED', hostedRoute: 'NOT_EXECUTED',
      filesystemConfinement: 'NOT_IMPLEMENTED', networkIsolation: 'NOT_TESTED',
      upstreamExecution: 'NOT_EXECUTED', candidateAdmission: 'NOT_GRANTED'
    }
  };
} finally {
  fs.rmSync(root, { recursive: true, force: true });
  assert.equal(fs.existsSync(root), false, 'owned fixture cleanup');
}
process.stdout.write(JSON.stringify({ ...result, ownedFixtureRemoved: true }) + '\n');
