# Owned npm failure evidence — independent Odo test freeze

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `dfcef02dc146628f938c80768a523a55c792b28e` and the approved offline Data handoff,
including its finite-diagnostic/prefix amendment, SHA-256
`c8aae82f19d64341ad548b20c36fe4746fa344c37eb19dea8f45d887d424cd41`.
Checkpoint: **TESTS FROZEN BEFORE PRODUCER; ACTUAL WITNESS LOSS REPRODUCED**.

Odo reread the installed Starfleet Crew 0.2.0 behavioral-integrity role and inspected the original
probe, current host relay and original success validator. Only this note and the new test are
Odo-owned changes. The coordinator's spike destination supersedes the role's generic artifact path.

## Frozen fixture and actual pre-fix result

[fixtures/test-npm-failure-witness.mjs](fixtures/test-npm-failure-witness.mjs) is 15,218 bytes,
SHA-256 `a97ad364d6e2560f8fd20dce8218c9f15c9b11b909971afe5c7d78af27cbcc18`.
It uses existing host Node22, synthetic records, a literal copy of the original ci oracle and
isolated actual catch bodies. Guarded module imports expose pure definitions only; no main or
spawn function is called. No filesystem mutation, npm, target runtime, container, archive,
acquisition, network or external command occurs.

- Requirement: safe earlier checkpoints and the first ci predicate must survive probe failure
  emission and host retention, without changing the original success oracle.
- Test Case: one `node --test docs/spikes/fixtures/test-npm-failure-witness.mjs` before producer
  edits. Extract only the actual probe and host outer catch bodies into VM contexts with
  synthetic stage/error/child/witness records, fake stderr/exit state, JSON/Buffer and the future
  pure sanitizer binding. Never evaluate either whole main or filesystem/process operations.
- Expected Result: the exact closed owned failure envelope retains its versioned checkpoint
  witness across both paths. A pre-fix failure must expose actual dropped data, not missing exports.
- Observed Result: exit 1, nine groups, two failed and seven explicitly skipped, 93.298125 ms.
  The actual probe catch omitted the entire witness; the actual host catch omitted both witness
  and code. Both assertions failed on concrete output differences. Helper-only cases were skipped
  because neither new pure export existed; no import/loader failure was substituted for behavior.
- Status: FAIL

Source under that execution:

- Probe: `18800d03a5f86171c2eb96631a54e7a3b4e1aaa1f65f25d5d402067ec96ebb5c`.
- Derived host controller: `7dd18a9edbb8de224e41298be2f3baebc3af259085b88f4ebbaab9749214b6b4`.

## Authored post-implementation checks

| Requirement | Test case | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| Exact first ci rejection | Synthetic exit/stderr precedence, malformed/null/primitive/array JSON, every zero counter missing/wrong-type/nonzero, invalid removed, unknown keys, invalid/nonempty optional arrays | Exact closed checkpoint/kind/detail and no failed summary | Producer absent | NOT EXECUTED |
| Original success semantics | Same vectors against literal original oracle and accepted records against original `verifyNpmObservation`; include native negative zero, duplicate keys and overflow | Identical acceptance and accepted parsed summary; no new coercion/schema | Producer absent | NOT EXECUTED |
| Failure privacy | Large synthetic private strings in invalid JSON, counter values, extra keys and stderr | No raw body/key/value in failed result; closed finite diagnostics only | Producer absent | NOT EXECUTED |
| Ordered partial witness | Valid early prefixes, all ci checkpoints and owned-output/ci-accepted; null child and allowed native enums | Fresh closed immutable copy, encoded envelope <=2048 bytes | Producer absent | NOT EXECUTED |
| Schema and cross-stage binding | Missing/extra fields, unknown strings, wrong scalar types, invalid child bounds, impossible prefix and mismatched stage/checkpoint | Return null without input mutation | Producer absent | NOT EXECUTED |
| Real host retention bounds | Actual catch on valid JSON padded to 65536 bytes, 65537-byte input, malformed/private/open envelope | Exact boundary retains sanitized witness; invalid/oversize remains generic failure | Producer absent | NOT EXECUTED |
| Safe probe construction | Actual catch with an unknown synthetic native code | OTHER enum, no raw code and bounded sanitized envelope | Producer absent | NOT EXECUTED |

The oracle uses native JSON.parse/property/in semantics, including null property-access rejection;
it does not reinterpret an absent funding field or speculate about the lost historical stdout.
Valid envelope size is checked on every accepted vector. Because closed enum/string/prefix fields
already constrain its maximum size, this does not claim an independent near-2048 valid payload.
The host stderr boundary is exercised separately at its actual 65536-byte cap.

Scotty owns the current probe exports, ordered checkpoint updates, actual catch integration and
derived pin closure. Run this frozen focused suite after implementation and record its exact
source basis, then Bashir independently reviews oracle parity, partial-witness truth and privacy.
The original controller/validators/tests and raw historical receipts remain unchanged. A later
coordinator-authorized expected current-probe hash refresh in the separate eight-method suite is
a deliberate source-version update, not removal of its pin assertion or retroactive qualification.

This offline evidence repair grants no new controlled execution. Prior observations remain
INDETERMINATE, and the previous ci predicate and output remain unknown.
