// Independent Odo contract: authored before the metadata producer; injected I/O only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getFixedSelectors, observeFixedPrerequisites, serializeReceipt } from './npm-prerequisite-metadata.mjs';

const cache = '/opt/hostedtoolcache/node/24.22.1/x64';
const system = '/usr/lib/x86_64-linux-gnu';
const expected = [
  ['cache', cache], ['cache-complete', `${cache}.complete`], ['node-header', `${cache}/include/node/node_version.h`],
  ['runtime:/runtime/node', `${cache}/bin/node`],
  ['runtime:/lib64/ld-linux-x86-64.so.2', `${system}/ld-linux-x86-64.so.2`],
  ['runtime:/lib/x86_64-linux-gnu/libdl.so.2', `${system}/libdl.so.2`],
  ['runtime:/lib/x86_64-linux-gnu/libstdc++.so.6', `${system}/libstdc++.so.6.0.33`],
  ['runtime:/lib/x86_64-linux-gnu/libm.so.6', `${system}/libm.so.6`],
  ['runtime:/lib/x86_64-linux-gnu/libgcc_s.so.1', `${system}/libgcc_s.so.1`],
  ['runtime:/lib/x86_64-linux-gnu/libpthread.so.0', `${system}/libpthread.so.0`],
  ['runtime:/lib/x86_64-linux-gnu/libc.so.6', `${system}/libc.so.6`],
  ['runtime:/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2', `${system}/ld-linux-x86-64.so.2`],
  ['npm-root', `${cache}/lib/node_modules/npm`], ['npm-manifest', `${cache}/lib/node_modules/npm/package.json`],
].map(([label, requestedPath]) => ({ label, requestedPath }));
const unique = [...new Set(expected.map(s => s.requestedPath))];
const binding = () => ({ controllerSha256: 'a'.repeat(64), originalRunnerSha256: 'b'.repeat(64), firstReceiptSha256: 'c'.repeat(64),
  runId: '42097240276', runAttempt: 1, headCommit: 'd'.repeat(40), baseCommit: 'e'.repeat(40), sourceCommit: 'f'.repeat(40),
  runnerOS: 'Linux', runnerArch: 'X64', imageOS: 'ubuntu24', imageVersion: '20261026.354.1' });
const stat = (type = 'file', size = 64) => ({ size,
  isFile: () => type === 'file', isDirectory: () => type === 'directory', isSymbolicLink: () => type === 'symlink' });
const error = code => Object.assign(new Error('PRIVATE_ERROR_MESSAGE_MUST_NOT_ESCAPE'), { code,
  path: '/unrelated/private/path', syscall: 'PRIVATE_SYSCALL' });
function fakeIO(overrides = {}) {
  const calls = [];
  return { calls, io: {
    lstatSync(p) {
      calls.push(['lstat', p]);
      if (overrides.lstat) return overrides.lstat(p);
      return stat(p === cache || p === `${cache}/lib/node_modules/npm` ? 'directory' : 'file');
    },
    realpathSync(p) { calls.push(['realpath', p]); return overrides.realpath ? overrides.realpath(p) : p; },
  } };
}
const rows = r => r.observations;
const rowKeys = ['label', 'requestedPath', 'status', 'type', 'size', 'resolvedPath', 'lstatError', 'realpathError'];

test('M1 fixed ordered selectors, destination labels and one lstat/realpath per unique path', () => {
  assert.deepEqual(getFixedSelectors(), expected); assert.equal(expected.length, 14); assert.equal(unique.length, 13);
  const altered = getFixedSelectors(); altered[0].requestedPath = '/other'; altered.pop();
  assert.deepEqual(getFixedSelectors(), expected, 'fresh data, no caller mutation of fixed selector set');
  const { io, calls } = fakeIO(), receipt = observeFixedPrerequisites(io);
  assert.deepEqual(Object.keys(receipt).sort(), ['observations', 'schemaVersion', 'status']);
  assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.status, 'METADATA_COMPLETE');
  assert.deepEqual(calls, unique.flatMap(p => [['lstat', p], ['realpath', p]]));
  assert.equal(rows(receipt).length, 14);
  for (const [i, r] of rows(receipt).entries()) {
    assert.deepEqual(Object.keys(r).sort(), [...rowKeys].sort());
    assert.deepEqual({ label: r.label, requestedPath: r.requestedPath }, expected[i]);
    assert.equal(r.status, 'OBSERVED'); assert.equal(r.size, 64); assert.equal(r.resolvedPath, r.requestedPath);
    assert.equal(r.lstatError, null); assert.equal(r.realpathError, null);
    assert.equal(r.type, [0, 12].includes(i) ? 'directory' : 'file');
  }
  assert.notEqual(rows(receipt)[4], rows(receipt)[11], 'shared observation has distinct labeled row objects');
  rows(receipt)[4].size = 0; assert.equal(rows(receipt)[11].size, 64);
  assert.deepEqual(serializeReceipt(observeFixedPrerequisites(fakeIO().io)), `${JSON.stringify(observeFixedPrerequisites(fakeIO().io))}\n`);
});

test('M2 missing paths continue; lstat and realpath errors remain operation-specific metadata', () => {
  const missing = new Map([[cache, 'ENOENT'], [expected[2].requestedPath, 'ENOTDIR']]);
  const realMissing = expected[6].requestedPath;
  const { io, calls } = fakeIO({ lstat: p => { if (missing.has(p)) throw error(missing.get(p)); return stat('symlink', 21); },
    realpath: p => { if (p === realMissing) throw error('ENOENT'); return '/metadata/owned-target'; } });
  const receipt = observeFixedPrerequisites(io); assert.equal(receipt.status, 'MISSING_PREREQUISITES');
  assert.equal(rows(receipt).length, 14);
  for (const [p, code] of missing) {
    const r = rows(receipt).find(r => r.requestedPath === p);
    assert.deepEqual({ status: r.status, type: r.type, size: r.size, resolvedPath: r.resolvedPath, lstatError: r.lstatError, realpathError: r.realpathError },
      { status: 'MISSING', type: null, size: null, resolvedPath: null, lstatError: code, realpathError: null });
    assert.ok(!calls.some(([op, path]) => op === 'realpath' && path === p));
  }
  const r = rows(receipt).find(r => r.requestedPath === realMissing);
  assert.deepEqual({ status: r.status, type: r.type, size: r.size, resolvedPath: r.resolvedPath, lstatError: r.lstatError, realpathError: r.realpathError },
    { status: 'MISSING', type: 'symlink', size: 21, resolvedPath: null, lstatError: null, realpathError: 'ENOENT' });
  assert.equal(rows(receipt).at(-1).status, 'OBSERVED', 'later npm manifest metadata still observed');
  assert.equal(rows(receipt)[3].resolvedPath, '/metadata/owned-target', 'resolved metadata is not runtime identity acceptance');
  assert.equal(calls.length, 24); assert.ok(!serializeReceipt(receipt).includes('PRIVATE_'));
});

test('M3 permission errors stop all further I/O, preserve cached alias and mark untouched labels', () => {
  const stopPath = expected[5].requestedPath;
  for (const code of ['EACCES', 'EPERM']) for (const operation of ['lstat', 'realpath']) {
    const { io, calls } = fakeIO({
      lstat: p => { if (operation === 'lstat' && p === stopPath) throw error(code); return stat(); },
      realpath: p => { if (operation === 'realpath' && p === stopPath) throw error(code); return p; },
    });
    const receipt = observeFixedPrerequisites(io); assert.equal(receipt.status, 'PERMISSION_STOPPED');
    assert.deepEqual(calls.at(-1), [operation, stopPath]); assert.equal(calls.length, operation === 'lstat' ? 11 : 12);
    const denied = rows(receipt)[5]; assert.equal(denied.status, 'DENIED');
    assert.equal(denied[`${operation}Error`], code);
    assert.equal(denied.type, operation === 'lstat' ? null : 'file');
    for (const i of [6, 7, 8, 9, 10, 12, 13]) {
      const r = rows(receipt)[i]; assert.equal(r.status, 'NOT_OBSERVED');
      for (const k of ['type', 'size', 'resolvedPath', 'lstatError', 'realpathError']) assert.equal(r[k], null);
    }
    assert.equal(rows(receipt)[11].status, 'OBSERVED', 'already-cached loader alias retains evidence after stop');
    assert.equal(rows(receipt).length, 14); assert.ok(!serializeReceipt(receipt).includes('PRIVATE_'));
  }
});

test('M4 bounded safe errors and metadata validation never retain raw exceptions or retry', () => {
  for (const [thrown, safeCode] of [[error('EIO'), 'EIO'], [error('not-safe-secret'), 'UNKNOWN'], [error('X'.repeat(4096)), 'UNKNOWN'],
    [new Error('PRIVATE_ERROR_MESSAGE_MUST_NOT_ESCAPE'), 'UNKNOWN'], ['PRIVATE_RAW_THROW', 'UNKNOWN']]) {
    const { io, calls } = fakeIO({ realpath: () => { throw thrown; } });
    const receipt = observeFixedPrerequisites(io); assert.equal(receipt.status, 'ERROR_STOPPED');
    assert.deepEqual(calls, [['lstat', cache], ['realpath', cache]]);
    assert.equal(rows(receipt)[0].realpathError, safeCode); assert.equal(rows(receipt)[0].status, 'ERROR');
    const serialized = serializeReceipt(receipt);
    for (const forbidden of ['PRIVATE_', '/unrelated/', 'not-safe-secret', 'Error:', 'stack', 'syscall']) assert.ok(!serialized.includes(forbidden));
  }
  for (const invalid of [stat('file', -1), stat('file', 0.5), stat('file', Number.MAX_SAFE_INTEGER + 1)]) {
    const { io, calls } = fakeIO({ lstat: () => invalid });
    const receipt = observeFixedPrerequisites(io); assert.equal(receipt.status, 'ERROR_STOPPED');
    assert.equal(rows(receipt)[0].lstatError, 'INVALID_METADATA'); assert.deepEqual(calls, [['lstat', cache]]);
  }
  for (const resolved of ['relative', '/bad\npath', `/${'x'.repeat(4096)}`]) {
    const receipt = observeFixedPrerequisites(fakeIO({ realpath: () => resolved }).io);
    assert.equal(receipt.status, 'ERROR_STOPPED'); assert.equal(rows(receipt)[0].realpathError, 'INVALID_METADATA');
  }
});

test('M5 bounded receipt serialization and exact optional outer-controller provenance', () => {
  const receipt = observeFixedPrerequisites(fakeIO().io), before = structuredClone(receipt);
  const encoded = serializeReceipt(receipt); assert.ok(encoded.endsWith('\n')); assert.ok(Buffer.byteLength(encoded) <= 65536);
  assert.deepEqual(JSON.parse(encoded), receipt); assert.deepEqual(receipt, before);
  const bound = { ...receipt, binding: binding() }; assert.deepEqual(JSON.parse(serializeReceipt(bound)), bound);
  assert.deepEqual(JSON.parse(serializeReceipt({ ...receipt, binding: { ...binding(), imageOS: 'UNAVAILABLE', imageVersion: 'UNAVAILABLE' } })).binding.imageOS, 'UNAVAILABLE');
  for (const change of [{ controllerSha256: 'A'.repeat(64) }, { originalRunnerSha256: 'short' }, { firstReceiptSha256: 'x'.repeat(64) },
    { runId: 'x' }, { runId: '1'.repeat(31) }, { runAttempt: 2 }, { headCommit: 'x' }, { baseCommit: 'A'.repeat(40) },
    { sourceCommit: 'x'.repeat(40) }, { runnerOS: 'Darwin' }, { runnerArch: 'ARM64' }, { imageOS: 'private-hostname' },
    { imageVersion: 'private-value' }, { imageVersion: '1'.repeat(41) }, { unknown: 'PRIVATE_VALUE' }]) {
    assert.throws(() => serializeReceipt({ ...receipt, binding: { ...binding(), ...change } }), Error);
  }
  for (const key of Object.keys(binding())) { const b = binding(); delete b[key]; assert.throws(() => serializeReceipt({ ...receipt, binding: b }), Error, `missing binding ${key}`); }
  for (const change of [{ unknown: true }, { status: 'PASSED' }, { schemaVersion: 2 }, { observations: [] }, { error: error('ENOENT') }]) {
    assert.throws(() => serializeReceipt({ ...receipt, ...change }), Error);
  }
  for (const mutate of [r => { r.observations[0].requestedPath = '/foreign'; }, r => { r.observations[0].label = 'foreign'; },
    r => { r.observations[0].lstatError = error('ENOENT'); }, r => { r.observations[0].extra = 'PRIVATE'; },
    r => { r.status = 'MISSING_PREREQUISITES'; }, r => { r.observations[0].status = 'UNKNOWN'; },
    r => { r.observations[0].lstatError = 'PRIVATE_ARBITRARY_CODE'; }]) {
    const bad = structuredClone(receipt); mutate(bad); assert.throws(() => serializeReceipt(bad), Error);
  }
  const large = structuredClone(receipt);
  // Quotes are legal path bytes but their JSON escaping makes the whole envelope exceed64KiB.
  for (const r of large.observations) r.resolvedPath = `/${'"'.repeat(4095)}`;
  assert.throws(() => serializeReceipt(large), Error, 'whole envelope including escaping must remain <=65536bytes');
});

test('M6 metadata module is a pure import surface; all real I/O belongs to external caller', () => {
  const source = fs.readFileSync(new URL('./npm-prerequisite-metadata.mjs', import.meta.url), 'utf8');
  const uncommented = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/^\s*import\b/m.test(uncommented), 'pure module imports no filesystem, subprocess or other external module');
  assert.ok(!/\b(?:process|globalThis|require|eval|Function|fetch|readFileSync|readdirSync|execFileSync|spawnSync|createHash)\b/.test(uncommented));
  assert.deepEqual([...uncommented.matchAll(/export\s+function\s+(\w+)/g)].map(m => m[1]).sort(),
    ['getFixedSelectors', 'observeFixedPrerequisites', 'serializeReceipt'].sort());
  // Import already completed above; direct source inspection complements injected-I/O behavior.
  // No real fixed prerequisite path is passed to a host filesystem call by this suite.
});
