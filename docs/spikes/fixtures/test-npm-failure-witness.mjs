// Independent Odo freeze before producer: synthetic records and isolated catch bodies only.
// No main, filesystem mutation, spawn, npm, target runtime, container, archive or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { verifyNpmObservation } from './run-npm-preparation-control.mjs';

const probeUrl = new URL('./npm-preparation-probe.mjs', import.meta.url);
const probeSource = fs.readFileSync(probeUrl, 'utf8');
const hostSource = fs.readFileSync(new URL('./run-npm-same-job-control.mjs', import.meta.url), 'utf8');
const probe = await import(probeUrl); // Original guarded main remains uncalled.
const evaluate = probe.evaluateOwnedCiResult;
const sanitize = probe.sanitizeOwnedNpmFailure;
if (evaluate || sanitize) {
  assert.equal(typeof evaluate, 'function'); assert.equal(typeof sanitize, 'function');
}
const prefix = ['admission', 'observer-positive', 'observer-reset', 'npm-version'];
const goodSummary = () => ({ added: 0, changed: 0, audited: 0, funding: 0, removed: 1 });
const child = () => ({ exit: 0, signal: null, code: null, timedOut: false, stdoutBytes: 126, stderrBytes: 0 });
const diagnostic = (checkpoint, jsonKind, detail) => ({ checkpoint, jsonKind, detail });
const envelope = () => ({ status: 'INDETERMINATE', stage: 'ci-funding', reason: 'owned-npm-requirement',
  code: null, child: child(), witness: { version: 1, passed: [...prefix],
    ci: diagnostic('ci-funding', 'object', 'missing') } });
const ci = summary => ({ status: 0, stderr: '', stdout: JSON.stringify(summary) });

// Literal original ci oracle from immutable pre-correction probe18800d03… . No new semantics.
function originalOracle(result) {
  const requireFact = value => { if (!value) throw new Error('original-ci-rejection'); };
  try {
    requireFact(result.status === 0 && result.stderr === '');
    const summary = JSON.parse(result.stdout);
    for (const key of ['added', 'changed', 'audited', 'funding']) requireFact(summary[key] === 0);
    requireFact(Number.isSafeInteger(summary.removed) && summary.removed >= 0);
    requireFact(Object.keys(summary).every(key => ['added', 'removed', 'changed', 'audited', 'funding', 'add', 'change'].includes(key)));
    for (const key of ['add', 'change']) if (key in summary) requireFact(Array.isArray(summary[key]) && summary[key].length === 0);
    return { accepted: true, summary };
  } catch { return { accepted: false, summary: null }; }
}

function catchBody(source, endMarker) {
  const marker = '\n  } catch (error) {';
  const start = source.lastIndexOf(marker), end = source.indexOf(endMarker, start + marker.length);
  assert.ok(start >= 0 && end > start, 'extract only the actual outer catch body');
  return source.slice(start + marker.length, end);
}
const probeCatch = catchBody(probeSource, '\n  }\n}\n// No subprocess');
const hostCatch = catchBody(hostSource, '\n  } finally {');

function emittedFailure(witness = envelope().witness, error = {}) {
  let output = '';
  const fakeProcess = { stderr: { write: text => { output += text; } }, exitCode: 0 };
  vm.runInNewContext(probeCatch, { stage: envelope().stage, childFailure: child(), witness,
    error, process: fakeProcess, Buffer, sanitizeOwnedNpmFailure: sanitize });
  assert.equal(fakeProcess.exitCode, 1);
  return JSON.parse(output);
}
function retainedFailure(stderr) {
  const result = {};
  vm.runInNewContext(hostCatch, { stage: 'owned-npm-control', commandFailure: child(), result,
    error: { stderr }, Buffer, sanitizeOwnedNpmFailure: sanitize });
  return JSON.parse(JSON.stringify(result.failure.contained));
}

function evaluationCases() {
  const cases = [
    ['exit-first', { status: 1, stderr: 'PRIVATE_ERROR', stdout: '{bad' }, diagnostic('ci-exit', 'not-parsed', 'nonzero-exit')],
    ['stderr-first', { status: 0, stderr: 'PRIVATE_ERROR', stdout: '{bad' }, diagnostic('ci-stderr', 'not-parsed', 'nonempty-stderr')],
    ['invalid-json', { status: 0, stderr: '', stdout: '{bad' }, diagnostic('ci-json', 'not-parsed', 'parse-error')],
    ['null', ci(null), diagnostic('ci-added', 'null', 'wrong-type')],
    ['array', ci([]), diagnostic('ci-added', 'array', 'missing')],
    ['string', ci('PRIVATE_JSON_STRING'), diagnostic('ci-added', 'string', 'missing')],
    ['number', ci(1), diagnostic('ci-added', 'number', 'missing')],
    ['boolean', ci(false), diagnostic('ci-added', 'boolean', 'missing')],
  ];
  for (const status of [null, true, '0', -1]) cases.push(['exit-no-coercion', { status, stderr: '', stdout: '{}' }, diagnostic('ci-exit', 'not-parsed', 'nonzero-exit')]);
  cases.push(['stderr-no-coercion', { status: 0, stderr: null, stdout: '{}' }, diagnostic('ci-stderr', 'not-parsed', 'nonempty-stderr')]);
  for (const key of ['added', 'changed', 'audited', 'funding']) {
    const missing = goodSummary(); delete missing[key];
    cases.push([`${key}-missing`, ci(missing), diagnostic(`ci-${key}`, 'object', 'missing')]);
    for (const value of [null, true, 'PRIVATE_VALUE', [], {}]) {
      cases.push([`${key}-wrong-type-${typeof value}`, ci({ ...goodSummary(), [key]: value }), diagnostic(`ci-${key}`, 'object', 'wrong-type')]);
    }
    for (const value of [1, -1, 0.5]) cases.push([`${key}-nonzero-${value}`, ci({ ...goodSummary(), [key]: value }), diagnostic(`ci-${key}`, 'object', 'nonzero')]);
  }
  const missingRemoved = goodSummary(); delete missingRemoved.removed;
  cases.push(['removed-missing', ci(missingRemoved), diagnostic('ci-removed', 'object', 'not-safe-nonnegative-integer')]);
  for (const value of [null, true, '0', -1, 0.5, 9007199254740992]) {
    cases.push([`removed-invalid-${String(value)}`, ci({ ...goodSummary(), removed: value }), diagnostic('ci-removed', 'object', 'not-safe-nonnegative-integer')]);
  }
  cases.push(['unexpected-private-key', ci({ ...goodSummary(), PRIVATE_KEY: 'PRIVATE_VALUE' }), diagnostic('ci-keys', 'object', 'unexpected-keys')]);
  for (const key of ['add', 'change']) {
    for (const value of [null, 0, {}, 'PRIVATE_VALUE']) cases.push([`${key}-not-array`, ci({ ...goodSummary(), [key]: value }), diagnostic(`ci-${key}`, 'object', 'not-array')]);
    cases.push([`${key}-nonempty`, ci({ ...goodSummary(), [key]: ['PRIVATE_VALUE'] }), diagnostic(`ci-${key}`, 'object', 'nonempty-array')]);
  }
  for (const summary of [goodSummary(), { ...goodSummary(), removed: 0 }, { ...goodSummary(), add: [], change: [] },
    { ...goodSummary(), added: -0, removed: -0 }]) cases.push(['accepted', ci(summary), diagnostic('ci-accepted', 'object', 'none')]);
  cases.push(['native-negative-zero', { status: 0, stderr: '', stdout: '{"added":-0,"changed":0,"audited":0,"funding":0,"removed":-0}' }, diagnostic('ci-accepted', 'object', 'none')]);
  cases.push(['duplicate-key-native-json', { status: 0, stderr: '', stdout: '{"added":1,"added":0,"changed":0,"audited":0,"funding":0,"removed":0}' }, diagnostic('ci-accepted', 'object', 'none')]);
  cases.push(['numeric-overflow', { status: 0, stderr: '', stdout: '{"added":1e999,"changed":0,"audited":0,"funding":0,"removed":0}' }, diagnostic('ci-added', 'object', 'nonzero')]);
  return cases;
}

test('actual probe catch retains the owned checkpoint witness instead of dropping it', () => {
  assert.deepEqual(emittedFailure(), envelope());
});

test('actual host catch retains the complete sanitized failure witness', () => {
  assert.deepEqual(retainedFailure(Buffer.from(JSON.stringify(envelope()))), envelope());
});

test('every original ci parse and summary predicate has an exact finite diagnostic', { skip: !evaluate }, () => {
  for (const [name, result, expected] of evaluationCases()) {
    const before = structuredClone(result), actual = evaluate(result);
    assert.deepEqual(actual.diagnostic, expected, name);
    assert.equal(actual.accepted, expected.checkpoint === 'ci-accepted', name);
    assert.equal(actual.summary === null, !actual.accepted, name);
    assert.deepEqual(result, before, `${name}: preserve input`);
  }
});

test('new acceptance exactly matches the literal original oracle including unusual JSON semantics', { skip: !evaluate }, () => {
  for (const [name, result] of evaluationCases()) {
    const expected = originalOracle(result), actual = evaluate(result);
    assert.equal(actual.accepted, expected.accepted, name);
    assert.deepEqual(actual.summary, expected.summary, name);
    if (actual.accepted) {
      const observation = { node: 'v24.22.1', npmVersion: '11.19.1', observerPositiveExit: 73,
        observerPositiveMarker: true, observerReset: true, versionExit: 0, versionSignal: null,
        versionTimedOut: false, versionStdoutBytes: 8, ciExit: 0, ciSignal: null, ciTimedOut: false,
        ciStdoutBytes: Buffer.byteLength(result.stdout), ciSummary: actual.summary, observerAfterCi: false,
        staleAfterCi: false, manifestUnchanged: true, lockUnchanged: true, installedPackageCount: 0,
        outputAccepted: true, cleanupComplete: true, mutationOutcomeUncertain: false, sourcePreserved: true };
      assert.equal(verifyNpmObservation(observation), true, name);
    }
  }
});

test('failed evaluation never retains hostile keys, values or raw output', { skip: !evaluate }, () => {
  const hostile = `PRIVATE_PAYLOAD_${'x'.repeat(32000)}`;
  for (const result of [ci({ ...goodSummary(), PRIVATE_KEY: hostile }), ci({ ...goodSummary(), funding: hostile }),
    { status: 0, stderr: '', stdout: hostile }, { status: 1, stderr: hostile, stdout: hostile }]) {
    const actual = evaluate(result), encoded = JSON.stringify(actual);
    assert.equal(actual.accepted, false); assert.equal(actual.summary, null);
    assert.equal(encoded.includes('PRIVATE'), false); assert.ok(Buffer.byteLength(encoded) < 256);
    assert.deepEqual(Object.keys(actual).sort(), ['accepted', 'diagnostic', 'summary']);
    assert.deepEqual(Object.keys(actual.diagnostic).sort(), ['checkpoint', 'detail', 'jsonKind']);
  }
});

function stagedEnvelope(stage, length, diagnosticValue = null) {
  return { ...envelope(), stage, witness: { version: 1, passed: prefix.slice(0, length), ci: diagnosticValue } };
}
function validEnvelopes() {
  const values = [stagedEnvelope('admission', 0), stagedEnvelope('observer-positive', 1),
    stagedEnvelope('observer-positive', 2), stagedEnvelope('npm-version', 3), stagedEnvelope('npm-ci', 4)];
  for (const [, , d] of evaluationCases()) values.push(stagedEnvelope(d.checkpoint, 4, d));
  values.push(stagedEnvelope('owned-output', 4, diagnostic('ci-accepted', 'object', 'none')));
  return values;
}

test('sanitizer preserves only valid ordered checkpoints as a fresh bounded closed copy', { skip: !sanitize }, () => {
  for (const value of validEnvelopes()) {
    const before = structuredClone(value), actual = sanitize(value);
    assert.deepEqual(actual, value); assert.deepEqual(value, before);
    assert.notEqual(actual, value); assert.notEqual(actual.witness, value.witness);
    assert.notEqual(actual.witness.passed, value.witness.passed);
    if (actual.child) assert.notEqual(actual.child, value.child);
    assert.ok(Buffer.byteLength(JSON.stringify(actual)) <= 2048);
  }
  const noChild = { ...stagedEnvelope('admission', 0), child: null };
  assert.deepEqual(sanitize(noChild), noChild);
  for (const code of ['ETIMEDOUT', 'ENOENT', 'EACCES', 'ENOBUFS', 'OTHER']) {
    const value = stagedEnvelope('npm-ci', 4); value.code = code; value.child.code = code;
    value.child.exit = null; value.child.timedOut = code === 'ETIMEDOUT';
    assert.deepEqual(sanitize(value), value);
  }
  for (const signal of ['SIGTERM', 'SIGKILL', 'SIGABRT', 'SIGSEGV', 'SIGBUS', 'SIGILL',
    'SIGFPE', 'SIGPIPE', 'SIGINT', 'SIGHUP', 'OTHER']) {
    const value = stagedEnvelope('npm-ci', 4); value.child.signal = signal; value.child.exit = null;
    assert.deepEqual(sanitize(value), value);
  }
});

test('sanitizer rejects open shapes, arbitrary text, scalar drift and inconsistent stages', { skip: !sanitize }, () => {
  const good = envelope(), rejects = [null, [], 'PRIVATE_RAW', { ...good, raw: 'PRIVATE_RAW' }];
  for (const key of Object.keys(good)) { const missing = structuredClone(good); delete missing[key]; rejects.push(missing); }
  for (const [key, value] of [['status', 'PASSED'], ['stage', 'PRIVATE_STAGE'], ['reason', 'PRIVATE_REASON'],
    ['code', 'PRIVATE_ERROR'], ['code', 0], ['child', []], ['witness', null]]) rejects.push({ ...structuredClone(good), [key]: value });
  for (const key of ['version', 'passed', 'ci']) { const value = structuredClone(good); delete value.witness[key]; rejects.push(value); }
  for (const change of [{ version: true }, { version: 2 }, { extra: 'PRIVATE_VALUE' }, { passed: ['npm-version'] },
    { passed: [...prefix, 'owned-output'] }, { passed: ['admission', 'observer-reset'] }, { ci: { ...good.witness.ci, raw: 'PRIVATE_RAW' } },
    { ci: { ...good.witness.ci, checkpoint: 'PRIVATE_STAGE' } }, { ci: { ...good.witness.ci, jsonKind: 'PRIVATE_KIND' } },
    { ci: { ...good.witness.ci, detail: 'PRIVATE_DETAIL' } }]) {
    rejects.push({ ...structuredClone(good), witness: { ...structuredClone(good.witness), ...change } });
  }
  for (const key of Object.keys(child())) { const value = structuredClone(good); delete value.child[key]; rejects.push(value); }
  for (const change of [{ exit: -1 }, { exit: 256 }, { exit: true }, { signal: 'PRIVATE_SIGNAL' }, { code: 'PRIVATE_CODE' },
    { timedOut: 0 }, { stdoutBytes: -1 }, { stderrBytes: 65537 }, { stdoutBytes: true }, { raw: 'PRIVATE_RAW' }]) {
    rejects.push({ ...structuredClone(good), child: { ...child(), ...change } });
  }
  for (const [stage, length] of [['admission', 1], ['observer-positive', 0], ['observer-positive', 3],
    ['npm-version', 2], ['npm-version', 4], ['npm-ci', 3]]) rejects.push(stagedEnvelope(stage, length));
  rejects.push(stagedEnvelope('ci-funding', 4, diagnostic('ci-added', 'object', 'missing')),
    stagedEnvelope('ci-funding', 3, good.witness.ci), stagedEnvelope('ci-funding', 4),
    stagedEnvelope('owned-output', 4), stagedEnvelope('owned-output', 4, good.witness.ci));
  for (const value of rejects) {
    const before = structuredClone(value); assert.equal(sanitize(value), null); assert.deepEqual(value, before);
  }
});

test('host actual relay rejects invalid and oversized stderr while retaining the exact byte boundary', { skip: !sanitize }, () => {
  const value = envelope(), encoded = JSON.stringify(value);
  assert.deepEqual(retainedFailure(encoded.padEnd(65536, ' ')), value);
  assert.equal(retainedFailure(encoded.padEnd(65537, ' ')), null);
  assert.equal(retainedFailure('{malformed'), null);
  assert.equal(retainedFailure(JSON.stringify({ ...value, raw: `PRIVATE_${'x'.repeat(4096)}` })), null);
  assert.equal(retainedFailure(JSON.stringify({ ...value, stage: 'PRIVATE_STAGE' })), null);
});

test('probe actual failure emission maps unknown native code to enum without leaking it', { skip: !sanitize }, () => {
  const actual = emittedFailure(envelope().witness, { code: 'PRIVATE_NATIVE_ERROR' });
  assert.equal(actual.code, 'OTHER'); assert.equal(JSON.stringify(actual).includes('PRIVATE'), false);
  assert.ok(Buffer.byteLength(JSON.stringify(actual)) <= 2048);
  assert.deepEqual(sanitize(actual), actual);
});
