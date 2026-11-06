// Independent Odo freeze before v2 producer. Synthetic records and isolated source blocks only.
// No main, spawn, filesystem mutation, npm, target runtime, container, archive or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import * as v1 from './npm-preparation-probe.mjs';
import { verifyNpmObservation } from './run-npm-preparation-control.mjs';

const v2Url = new URL('./npm-preparation-probe-v2.mjs', import.meta.url);
const validatorUrl = new URL('./npm-observation-v2.mjs', import.meta.url);
const v2 = fs.existsSync(v2Url) ? await import(v2Url) : null;
const validator = fs.existsSync(validatorUrl) ? await import(validatorUrl) : null;
if (v2) {
  assert.equal(typeof v2.evaluateOwnedCiResult, 'function');
  assert.equal(typeof v2.sanitizeOwnedNpmFailure, 'function');
}
if (validator) assert.equal(typeof validator.verifyNpmObservationV2, 'function');
const evaluateCandidate = v2?.evaluateOwnedCiResult ?? v1.evaluateOwnedCiResult;
const verifyCandidate = validator?.verifyNpmObservationV2 ?? verifyNpmObservation;
const summary = () => ({ added: 0, changed: 0, audited: 0, funding: 0, removed: 1 });
const ci = value => ({ status: 0, stderr: '', stdout: JSON.stringify(value) });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hostSource = fs.readFileSync(new URL('./run-npm-same-job-control.mjs', import.meta.url), 'utf8');
const ownerSource = fs.readFileSync(new URL('./run_npm_same_job.py', import.meta.url), 'utf8');
const prefix = ['admission', 'observer-positive', 'observer-reset', 'npm-version'];

function observation(ciSummary = summary()) {
  return { node: 'v24.22.1', npmVersion: '11.19.1', observerPositiveExit: 73,
    observerPositiveMarker: true, observerReset: true, versionExit: 0, versionSignal: null,
    versionTimedOut: false, versionStdoutBytes: 8, ciExit: 0, ciSignal: null, ciTimedOut: false,
    ciStdoutBytes: 126, ciSummary, observerAfterCi: false, staleAfterCi: false,
    manifestUnchanged: true, lockUnchanged: true, installedPackageCount: 0, outputAccepted: true,
    cleanupComplete: true, mutationOutcomeUncertain: false, sourcePreserved: true };
}
function acceptsHost(verify, value) {
  try { return verify(value) === true; } catch { return false; }
}
function outsideDeltaCases() {
  const values = [ci(summary()), ci({ ...summary(), removed: 0 }), ci({ ...summary(), removed: 123 }),
    ci({ ...summary(), add: [], change: [] }), ci(null), ci([]), ci('synthetic'), ci(0), ci(false),
    { status: 1, stdout: '{bad', stderr: 'synthetic' }, { status: 0, stdout: '{bad', stderr: '' },
    { status: 0, stdout: '{}', stderr: 'synthetic' }];
  for (const key of ['added', 'changed', 'audited', 'funding']) {
    const missing = summary(); delete missing[key]; values.push(ci(missing));
    for (const value of [1, '0', null, true]) values.push(ci({ ...summary(), [key]: value }));
  }
  const missing = summary(); delete missing.removed; values.push(ci(missing));
  for (const value of [-1, 0.5, '1', null, true, 9007199254740992]) values.push(ci({ ...summary(), removed: value }));
  for (const key of ['audit', 'unreviewedScripts', 'error', 'PRIVATE_KEY']) values.push(ci({ ...summary(), [key]: 'PRIVATE_VALUE' }));
  for (const key of ['add', 'change']) {
    for (const value of [null, {}, 'synthetic', ['synthetic']]) values.push(ci({ ...summary(), [key]: value }));
  }
  values.push({ status: 0, stderr: '', stdout: '{"added":-0,"changed":0,"audited":0,"funding":0,"removed":-0}' });
  return values;
}

async function actualHostBindings() {
  const selected = new Set(['sanitizeOwnedNpmFailure', 'verifyNpmObservation', 'verifyNpmObservationV2', 'npmContractVersion']);
  const bindings = {};
  for (const match of hostSource.matchAll(/import\s*{([^}]+)}\s*from\s*['"]([.][/]([^'"]+))['"]/g)) {
    const names = match[1].split(',').map(part => part.trim().split(/\s+as\s+/));
    if (!names.some(([name]) => selected.has(name))) continue;
    assert.ok(['./npm-preparation-probe.mjs', './npm-preparation-probe-v2.mjs',
      './run-npm-preparation-control.mjs', './npm-observation-v2.mjs'].includes(match[2]));
    const module = await import(new URL(match[2], import.meta.url));
    for (const [name, local = name] of names) if (selected.has(name)) bindings[local] = module[name];
  }
  return bindings;
}
function actualFinalizer(bindings, complete, { cleanup = true, uncertain = false, priorFailure = false } = {}) {
  const start = hostSource.indexOf('    if (!result.failure && candidateObservation) {');
  const end = hostSource.indexOf('    result.completedAt =', start);
  assert.ok(start >= 0 && end > start, 'extract only the actual pure finalization block');
  const candidateObservation = structuredClone(complete);
  for (const field of ['cleanupComplete', 'mutationOutcomeUncertain', 'sourcePreserved']) delete candidateObservation[field];
  const result = { status: 'INDETERMINATE', cleanup: { completed: cleanup } };
  if (priorFailure) result.failure = { stage: 'synthetic-prior-failure' };
  vm.runInNewContext(hostSource.slice(start, end), { ...bindings, result, candidateObservation,
    mutationOutcomeUncertain: uncertain });
  return JSON.parse(JSON.stringify(result));
}
function actualCatch(bindings, value) {
  const marker = '\n  } catch (error) {', start = hostSource.lastIndexOf(marker);
  const end = hostSource.indexOf('\n  } finally {', start);
  assert.ok(start >= 0 && end > start);
  const result = {};
  vm.runInNewContext(hostSource.slice(start + marker.length, end), { ...bindings, result,
    stage: 'owned-npm-control', commandFailure: null, error: { stderr: value }, Buffer });
  return JSON.parse(JSON.stringify(result.failure.contained));
}
function witness(version = 2) {
  return { status: 'INDETERMINATE', stage: 'ci-remove', reason: 'owned-npm-requirement', code: null,
    child: { exit: 0, signal: null, code: null, timedOut: false, stdoutBytes: 126, stderrBytes: 0 },
    witness: { version, passed: [...prefix], ci: { checkpoint: 'ci-remove', jsonKind: 'object', detail: 'nonempty-array' } } };
}

test('v1 source, original oracle, witness fixture and six historical receipts remain immutable', () => {
  const expected = {
    'fixtures/npm-preparation-probe.mjs': 'fd905605bd8d9b80c1f493d1726f9aad9e876eadb6ee57b41f8b93bbe1298cb3',
    'fixtures/run-npm-preparation-control.mjs': 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7',
    'fixtures/test-npm-preparation-control.mjs': '5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972',
    'fixtures/test-npm-failure-witness.mjs': '0eb22750fa7f09e0a1928981c177e3383575db2fcf1b107fa0b0dd2e468f3e4c',
    'candidate-npm-corrected-observation-first-receipt.json': 'b0d7603d59816ccd333576b83bcf82a74b1b53f31ef0773ebd524891d4f67229',
    'candidate-npm-preparation-first-receipt.json': 'eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e',
    'candidate-npm-prerequisite-metadata-receipt.json': '98a50ed171e884f20384c31fc6928c4cd07a4bc29b9d28fcd81a41dec7cfd2cc',
    'candidate-npm-same-job-first-receipt.json': 'debb5ad9d1928acac90f463663770f9da7e1c12689bad215f3dea7742010b091',
    'candidate-npm-witness-observation-first-receipt.json': '61979e9c975bbe9b6e598b61e6d34ab795b44e432a4cb98f86f1a018a55fde74',
    'candidate-pinned-runtime-availability-receipt.json': 'd8c14eab91e6486ae2cc9ff6e236024af8fd2a13fbee22d93d5fc63a27a74226',
  };
  for (const [file, digest] of Object.entries(expected)) assert.equal(sha(fs.readFileSync(new URL(`../${file}`, import.meta.url))), digest, file);
  const value = { ...summary(), remove: [] };
  assert.equal(v1.evaluateOwnedCiResult(ci(summary())).accepted, true);
  assert.equal(verifyNpmObservation(observation()), true);
  assert.deepEqual(v1.evaluateOwnedCiResult(ci(value)).diagnostic,
    { checkpoint: 'ci-keys', jsonKind: 'object', detail: 'unexpected-keys' });
  assert.throws(() => verifyNpmObservation(observation(value)));
});

test('candidate probe admits the newly approved empty remove while v1 behavior stays separate', () => {
  const value = { ...summary(), removed: 3, remove: [] };
  const actual = evaluateCandidate(ci(value));
  assert.equal(actual.accepted, true); assert.deepEqual(actual.summary, value);
});

test('candidate full host observation admits the same newly approved empty remove', () => {
  assert.equal(verifyCandidate(observation({ ...summary(), removed: 3, remove: [] })), true);
});

test('v2 accepts only absent or empty remove and appends its predicate after every existing check', { skip: !v2 }, () => {
  for (const removed of [0, 1, 123, Number.MAX_SAFE_INTEGER]) {
    for (const extra of [{}, { remove: [] }, { add: [], change: [], remove: [] }]) {
      const value = { ...summary(), removed, ...extra }, input = ci(value), before = structuredClone(input);
      const actual = v2.evaluateOwnedCiResult(input);
      assert.equal(actual.accepted, true); assert.deepEqual(actual.summary, value); assert.deepEqual(input, before);
    }
  }
  for (const remove of [null, 'synthetic', 0, false, {}, ['PRIVATE_VALUE']]) {
    const actual = v2.evaluateOwnedCiResult(ci({ ...summary(), remove }));
    assert.equal(actual.accepted, false); assert.equal(actual.summary, null);
    assert.deepEqual(actual.diagnostic, { checkpoint: 'ci-remove', jsonKind: 'object',
      detail: Array.isArray(remove) ? 'nonempty-array' : 'not-array' });
    assert.equal(JSON.stringify(actual).includes('PRIVATE'), false);
  }
  const ordered = [
    [{ ...summary(), added: 1, remove: ['x'] }, 'ci-added'],
    [{ ...summary(), removed: -1, remove: ['x'] }, 'ci-removed'],
    [{ ...summary(), audit: true, add: ['x'], remove: ['x'] }, 'ci-keys'],
    [{ ...summary(), add: ['x'], change: ['x'], remove: ['x'] }, 'ci-add'],
    [{ ...summary(), change: ['x'], remove: ['x'] }, 'ci-change'],
    [{ ...summary(), remove: ['x'] }, 'ci-remove'],
  ];
  for (const [value, first] of ordered) assert.equal(v2.evaluateOwnedCiResult(ci(value)).diagnostic.checkpoint, first);
});

test('v2 preserves v1 probe and full-host behavior on the finite matrix outside the approved delta', { skip: !v2 || !validator }, () => {
  for (const value of outsideDeltaCases()) {
    assert.deepEqual(v2.evaluateOwnedCiResult(value), v1.evaluateOwnedCiResult(value));
    let parsed; try { parsed = JSON.parse(value.stdout); } catch { continue; }
    assert.equal(acceptsHost(validator.verifyNpmObservationV2, observation(parsed)),
      acceptsHost(verifyNpmObservation, observation(parsed)));
  }
});

test('v2 full host keeps every required observation and summary gate without prevalidation reordering', { skip: !validator }, () => {
  const verify = validator.verifyNpmObservationV2;
  const good = observation({ ...summary(), remove: [] }), before = structuredClone(good);
  assert.equal(verify(good), true); assert.deepEqual(good, before);
  for (const field of Object.keys(good)) {
    const missing = structuredClone(good); delete missing[field]; assert.throws(() => verify(missing), field);
    if (field === 'ciSummary' || field.endsWith('StdoutBytes')) continue;
    const value = good[field], wrong = value === null ? 'SIGKILL' : typeof value === 'boolean' ? !value
      : typeof value === 'number' ? value + 1 : `${value}-wrong`;
    assert.throws(() => verify({ ...good, [field]: wrong }), field);
  }
  for (const field of ['versionStdoutBytes', 'ciStdoutBytes']) {
    for (const value of [-1, 65537, 0.5, true, '8', null]) assert.throws(() => verify({ ...good, [field]: value }));
  }
  assert.throws(() => verify({ ...good, npmContractVersion: 'owned-empty-ci/v2' }));
  for (const remove of [null, 'x', 0, false, {}, ['x']]) assert.throws(() => verify(observation({ ...summary(), remove })));
  let readSummary = false;
  const wrongNode = observation(); wrongNode.node = 'wrong';
  Object.defineProperty(wrongNode, 'ciSummary', { enumerable: true, get() { readSummary = true; return summary(); } });
  assert.throws(() => verify(wrongNode)); assert.equal(readSummary, false, 'observation gates precede summary checks');
  let readCounter = false;
  const unknown = { ...summary(), audit: true };
  Object.defineProperty(unknown, 'added', { enumerable: true, get() { readCounter = true; return 0; } });
  assert.throws(() => verify(observation(unknown))); assert.equal(readCounter, false, 'original host key check precedes counters');
});

test('v2 witnesses are version-separated, closed and bounded with only the new remove diagnostic', { skip: !v2 }, () => {
  const source = fs.readFileSync(v2Url, 'utf8');
  const initializer = source.match(/const witness = ([^\n;]+);/)?.[1]; assert.ok(initializer);
  const initialWitness = vm.runInNewContext(`(${initializer})`);
  assert.deepEqual(JSON.parse(JSON.stringify(initialWitness)), { version: 2, passed: [], ci: null });
  const marker = '\n  } catch (error) {', start = source.lastIndexOf(marker);
  const end = source.indexOf('\n  }\n}\n// No subprocess', start);
  assert.ok(start >= 0 && end > start);
  let emitted = '';
  const value = witness(), fakeProcess = { stderr: { write: text => { emitted += text; } }, exitCode: 0 };
  vm.runInNewContext(source.slice(start + marker.length, end), { stage: value.stage, error: {},
    childFailure: value.child, witness: value.witness, sanitizeOwnedNpmFailure: v2.sanitizeOwnedNpmFailure,
    Buffer, process: fakeProcess });
  assert.equal(fakeProcess.exitCode, 1); assert.deepEqual(JSON.parse(emitted), value);
  for (const detail of ['not-array', 'nonempty-array']) {
    const value = witness(); value.witness.ci.detail = detail;
    const before = structuredClone(value), safe = v2.sanitizeOwnedNpmFailure(value);
    assert.deepEqual(safe, value); assert.deepEqual(value, before); assert.notEqual(safe, value);
    assert.ok(Buffer.byteLength(JSON.stringify(safe)) <= 2048);
    assert.equal(v1.sanitizeOwnedNpmFailure(value), null);
  }
  const old = witness(1); old.stage = 'ci-keys'; old.witness.ci = { checkpoint: 'ci-keys', jsonKind: 'object', detail: 'unexpected-keys' };
  assert.notEqual(v1.sanitizeOwnedNpmFailure(old), null); assert.equal(v2.sanitizeOwnedNpmFailure(old), null);
  for (const change of [{ version: 1 }, { ci: { checkpoint: 'ci-remove', jsonKind: 'array', detail: 'not-array' } },
    { ci: { checkpoint: 'ci-remove', jsonKind: 'object', detail: 'unexpected-keys' } },
    { passed: prefix.slice(0, 3) }, { raw: `PRIVATE_${'x'.repeat(3000)}` }]) {
    const value = witness(); Object.assign(value.witness, change); assert.equal(v2.sanitizeOwnedNpmFailure(value), null);
  }
  const leaked = { ...witness(), raw: 'PRIVATE_RAW' }; assert.equal(v2.sanitizeOwnedNpmFailure(leaked), null);
});

test('actual derived-host finalizer uses v2 and preserves cleanup, output and prior-failure gates', { skip: !v2 || !validator }, async () => {
  const bindings = await actualHostBindings(), good = observation({ ...summary(), remove: [] });
  const accepted = actualFinalizer(bindings, good);
  assert.equal(accepted.status, 'NPM11_OWNED_PREPARATION_CONTROL_PASSED'); assert.deepEqual(accepted.observation, good);
  for (const options of [{ cleanup: false }, { uncertain: true }, { priorFailure: true }]) {
    assert.equal(actualFinalizer(bindings, good, options).status, 'INDETERMINATE');
  }
  const bad = { ...good, outputAccepted: false };
  assert.equal(actualFinalizer(bindings, bad).failure.stage, 'finalization');
});

test('actual derived-host catch resolves the v2 sanitizer and retains no v1 or malformed witness', { skip: !v2 || !validator }, async () => {
  const bindings = await actualHostBindings(), value = witness(), encoded = JSON.stringify(value);
  assert.deepEqual(actualCatch(bindings, encoded.padEnd(65536, ' ')), value);
  assert.equal(actualCatch(bindings, encoded.padEnd(65537, ' ')), null);
  assert.equal(actualCatch(bindings, JSON.stringify(witness(1))), null);
  assert.equal(actualCatch(bindings, JSON.stringify({ ...value, raw: 'PRIVATE_VALUE' })), null);
});

test('actual import/copy/version and pre-host pin closure select v2 while child fixture exports stay identical', { skip: !v2 || !validator }, async () => {
  assert.equal(v2.npmContractVersion, 'owned-empty-ci/v2');
  for (const field of ['manifestText', 'lockText', 'commonFlags', 'childEnv']) assert.deepEqual(v2[field], v1[field], field);
  const bindings = await actualHostBindings(); assert.equal(bindings.npmContractVersion, 'owned-empty-ci/v2');
  const main = hostSource.indexOf('function main() {'), start = hostSource.indexOf('  const result = ', main);
  const end = hostSource.indexOf(';\n', start);
  assert.ok(start > main && end > start);
  const initial = vm.runInNewContext(`(${hostSource.slice(start + '  const result = '.length, end)})`,
    { ...bindings, Date, process: { version: 'v22.0.0' } });
  assert.equal(initial.status, 'INDETERMINATE'); assert.equal(initial.npmContractVersion, 'owned-empty-ci/v2');
  assert.match(hostSource, /\[['"]npm-preparation-probe-v2[.]mjs['"],\s*['"]npm-probe[.]mjs['"],\s*0o444\]/);
  const pinsText = ownerSource.match(/^PINS = {([\s\S]*?)^}/m)?.[1]; assert.ok(pinsText);
  const pins = new Map([...pinsText.matchAll(/'([^']+)':\s*'([a-f0-9]{64})'/g)].map(match => [match[1], match[2]]));
  for (const name of ['npm-preparation-probe-v2.mjs', 'npm-observation-v2.mjs', 'test-npm-empty-remove-v2.mjs',
    'npm-preparation-probe.mjs', 'run-npm-preparation-control.mjs']) {
    assert.equal(pins.get(`docs/spikes/fixtures/${name}`), sha(fs.readFileSync(new URL(`./${name}`, import.meta.url))), name);
  }
  const ownerMain = ownerSource.indexOf('def main():'), pinCheck = ownerSource.indexOf('for name, digest in PINS.items():', ownerMain);
  const hostLaunch = ownerSource.indexOf('child_result, child_uncertain = invoke_owned_controller(', ownerMain);
  assert.ok(pinCheck > ownerMain && hostLaunch > pinCheck, 'exact new imports are pinned before host launch');
  const receiptStart = ownerSource.indexOf('    receipt = dict(', ownerMain);
  const receiptEnd = ownerSource.indexOf('\n    child_uncertain', receiptStart);
  const receiptDeclaration = ownerSource.slice(receiptStart, receiptEnd);
  const selected = receiptDeclaration.match(/npmContractVersion\s*=\s*(?:['"](owned-empty-ci\/v2)['"]|([A-Z_][A-Z_0-9]*))/);
  assert.ok(selected, 'outer Python receipt records selected contract before target execution');
  if (!selected[1]) assert.match(ownerSource, new RegExp(`^${selected[2]}\\s*=\\s*['"]owned-empty-ci/v2['"]`, 'm'));
});
