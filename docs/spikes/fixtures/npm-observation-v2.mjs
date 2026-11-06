// DO_NOT_COPY: complete owned observation validator for the explicit empty-remove v2 contract.
// Import is inert. Field/order gates derive from the immutable v1 host validator.
import { isDeepStrictEqual } from 'node:util';
const requireFact = value => { if (!value) throw new Error('owned-npm-requirement'); };
const same = (a, b) => requireFact(isDeepStrictEqual(a, b));
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exactKeys = (x, keys) => requireFact(record(x) && Reflect.ownKeys(x).length === keys.length && Reflect.ownKeys(x).every(k => keys.includes(k)));
const safeInteger = (x, max) => Number.isSafeInteger(x) && x >= 0 && x <= max;

export function verifyNpmObservationV2(o) {
  const expected = { node: 'v24.22.1', npmVersion: '11.19.1', observerPositiveExit: 73, observerPositiveMarker: true,
    observerReset: true, versionExit: 0, versionSignal: null, versionTimedOut: false, ciExit: 0, ciSignal: null,
    ciTimedOut: false, observerAfterCi: false, staleAfterCi: false, manifestUnchanged: true, lockUnchanged: true,
    installedPackageCount: 0, outputAccepted: true, cleanupComplete: true, mutationOutcomeUncertain: false, sourcePreserved: true };
  exactKeys(o, [...Object.keys(expected), 'versionStdoutBytes', 'ciStdoutBytes', 'ciSummary']);
  for (const [k, v] of Object.entries(expected)) same(o[k], v);
  for (const k of ['versionStdoutBytes', 'ciStdoutBytes']) requireFact(safeInteger(o[k], 65536));
  const s = o.ciSummary; requireFact(record(s) && Reflect.ownKeys(s).every(k => ['added', 'changed', 'removed', 'audited', 'funding', 'add', 'change', 'remove'].includes(k)));
  for (const k of ['added', 'changed', 'audited', 'funding']) requireFact(s[k] === 0);
  requireFact(safeInteger(s.removed, Number.MAX_SAFE_INTEGER));
  for (const k of ['add', 'change', 'remove']) if (k in s) requireFact(Array.isArray(s[k]) && s[k].length === 0);
  return true;
}

