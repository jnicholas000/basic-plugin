// DO_NOT_COPY: fixed metadata observations only; no identity or runtime qualification.
const cache = '/opt/hostedtoolcache/node/24.22.1/x64';
const system = '/usr/lib/x86_64-linux-gnu';
const selectors = [
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
];
const codes = ['ENOENT', 'ENOTDIR', 'EACCES', 'EPERM', 'EIO', 'ELOOP', 'EINVAL', 'ENAMETOOLONG', 'EMFILE', 'ENFILE', 'ENOMEM'];
const fields = ['status', 'type', 'size', 'resolvedPath', 'lstatError', 'realpathError'];
const requireFact = value => { if (!value) throw new Error('fixed-metadata-requirement'); };
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exactKeys = (x, keys) => requireFact(record(x) && Reflect.ownKeys(x).length === keys.length && Reflect.ownKeys(x).every(k => keys.includes(k)));
const byteLength = s => { let n = 0; for (const c of s) { const p = c.codePointAt(0); n += p < 128 ? 1 : p < 2048 ? 2 : p < 65536 ? 3 : 4; } return n; };
const validPath = p => typeof p === 'string' && p.startsWith('/') && !/[\x00-\x1f\x7f-\x9f]/.test(p) && byteLength(p) <= 4096;
const validSize = x => Number.isSafeInteger(x) && x >= 0;
const validType = x => ['file', 'directory', 'symlink', 'other'].includes(x);
const stateFor = code => ['ENOENT', 'ENOTDIR'].includes(code) ? 'MISSING' : ['EACCES', 'EPERM'].includes(code) ? 'DENIED' : 'ERROR';
const empty = () => ({ status: 'NOT_OBSERVED', type: null, size: null, resolvedPath: null, lstatError: null, realpathError: null });
function safeCode(error) {
  try { return typeof error?.code === 'string' && codes.includes(error.code) ? error.code : 'UNKNOWN'; }
  catch { return 'UNKNOWN'; }
}
function statMetadata(st) {
  try {
    requireFact(record(st) && validSize(st.size));
    const methods = ['isFile', 'isDirectory', 'isSymbolicLink'];
    const types = methods.map(name => { requireFact(typeof st[name] === 'function'); const value = st[name](); requireFact(typeof value === 'boolean'); return value; });
    requireFact(types.filter(Boolean).length <= 1);
    return { type: types[0] ? 'file' : types[1] ? 'directory' : types[2] ? 'symlink' : 'other', size: st.size };
  } catch { return null; }
}
export function getFixedSelectors() {
  return selectors.map(([label, requestedPath]) => ({ label, requestedPath }));
}
export function observeFixedPrerequisites(io) {
  requireFact(io && typeof io.lstatSync === 'function' && typeof io.realpathSync === 'function');
  const seen = new Map(), observations = []; let stop = null, missing = false;
  for (const { label, requestedPath } of getFixedSelectors()) {
    let row = seen.get(requestedPath);
    if (!row) {
      row = empty();
      if (!stop) {
        let st;
        try { st = io.lstatSync(requestedPath); }
        catch (error) { row.lstatError = safeCode(error); }
        if (!row.lstatError) {
          const metadata = statMetadata(st);
          if (!metadata) row.lstatError = 'INVALID_METADATA';
          else {
            row.type = metadata.type; row.size = metadata.size;
            try {
              const resolved = io.realpathSync(requestedPath);
              if (validPath(resolved)) row.resolvedPath = resolved;
              else row.realpathError = 'INVALID_METADATA';
            } catch (error) { row.realpathError = safeCode(error); }
          }
        }
        const code = row.lstatError ?? row.realpathError;
        row.status = code ? stateFor(code) : 'OBSERVED';
        if (row.status === 'MISSING') missing = true;
        if (row.status === 'DENIED' || row.status === 'ERROR') stop = row.status;
      }
      seen.set(requestedPath, row);
    }
    observations.push({ label, requestedPath, ...row });
  }
  return { schemaVersion: 1, status: stop === 'DENIED' ? 'PERMISSION_STOPPED' : stop === 'ERROR' ? 'ERROR_STOPPED'
    : missing ? 'MISSING_PREREQUISITES' : 'METADATA_COMPLETE', observations };
}
function validateBinding(b) {
  exactKeys(b, ['controllerSha256', 'originalRunnerSha256', 'firstReceiptSha256', 'runId', 'runAttempt', 'headCommit', 'baseCommit', 'sourceCommit', 'runnerOS', 'runnerArch', 'imageOS', 'imageVersion']);
  for (const k of ['controllerSha256', 'originalRunnerSha256', 'firstReceiptSha256']) requireFact(typeof b[k] === 'string' && /^[a-f0-9]{64}$/.test(b[k]));
  for (const k of ['headCommit', 'baseCommit', 'sourceCommit']) requireFact(typeof b[k] === 'string' && /^[a-f0-9]{40}$/.test(b[k]));
  requireFact(typeof b.runId === 'string' && /^[0-9]{1,30}$/.test(b.runId) && b.runAttempt === 1 && b.runnerOS === 'Linux' && b.runnerArch === 'X64');
  requireFact(typeof b.imageOS === 'string' && ['ubuntu22', 'ubuntu24', 'ubuntu26', 'UNAVAILABLE'].includes(b.imageOS));
  requireFact(typeof b.imageVersion === 'string' && b.imageVersion.length <= 40 && (b.imageVersion === 'UNAVAILABLE' || /^[0-9]+(?:\.[0-9]+)*$/.test(b.imageVersion)));
}
export function serializeReceipt(receipt) {
  requireFact(record(receipt));
  exactKeys(receipt, ['schemaVersion', 'status', 'observations', ...('binding' in receipt ? ['binding'] : [])]);
  requireFact(receipt.schemaVersion === 1 && Array.isArray(receipt.observations) && receipt.observations.length === selectors.length);
  if ('binding' in receipt) validateBinding(receipt.binding);
  let stop = null, missing = false; const seen = new Map();
  for (const [i, row] of receipt.observations.entries()) {
    exactKeys(row, ['label', 'requestedPath', ...fields]);
    requireFact(row.label === selectors[i][0] && row.requestedPath === selectors[i][1]);
    const cached = seen.get(row.requestedPath);
    if (cached) { for (const key of fields) requireFact(row[key] === cached[key]); continue; }
    if (stop) { requireFact(row.status === 'NOT_OBSERVED' && fields.slice(1).every(k => row[k] === null)); }
    else if (row.status === 'OBSERVED') {
      requireFact(validType(row.type) && validSize(row.size) && validPath(row.resolvedPath) && row.lstatError === null && row.realpathError === null);
    } else {
      requireFact(['MISSING', 'DENIED', 'ERROR'].includes(row.status));
      const code = row.lstatError ?? row.realpathError;
      requireFact(typeof code === 'string' && [...codes, 'UNKNOWN', 'INVALID_METADATA'].includes(code) && row.status === stateFor(code));
      requireFact(row.resolvedPath === null);
      if (row.lstatError !== null) requireFact(row.realpathError === null && row.type === null && row.size === null);
      else requireFact(validType(row.type) && validSize(row.size));
      if (row.status === 'MISSING') missing = true;
      if (row.status === 'DENIED' || row.status === 'ERROR') stop = row.status;
    }
    seen.set(row.requestedPath, row);
  }
  requireFact(receipt.status === (stop === 'DENIED' ? 'PERMISSION_STOPPED' : stop === 'ERROR' ? 'ERROR_STOPPED'
    : missing ? 'MISSING_PREREQUISITES' : 'METADATA_COMPLETE'));
  const text = `${JSON.stringify(receipt)}\n`; requireFact(byteLength(text) <= 65536); return text;
}
