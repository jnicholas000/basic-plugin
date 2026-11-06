# Owned npm failure evidence — independent Odo test freeze

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `dfcef02dc146628f938c80768a523a55c792b28e` and the approved offline Data handoff,
including its finite-diagnostic/prefix amendment, SHA-256
`c8aae82f19d64341ad548b20c36fe4746fa344c37eb19dea8f45d887d424cd41`.
Checkpoint: **TESTS FROZEN BEFORE PRODUCER; ACTUAL WITNESS LOSS REPRODUCED**.

Odo reread the installed Starfleet Crew 0.2.0 behavioral-integrity role and inspected the original
probe, current host relay and original success validator. Only this note and the new test are
Odo-owned changes. The coordinator's spike destination supersedes the role's generic artifact path.

## Initial frozen fixture and actual pre-fix result

[Initial nine-group fixture](https://github.com/jnicholas000/basic-plugin/blob/957a0d91112298edab70741780cf7cbb2709f208/docs/spikes/fixtures/test-npm-failure-witness.mjs)
was frozen at 15,218 bytes,
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

## Post-implementation focused verification and controlled source pin

The current probe now has SHA-256
`9a412d237ec662a1fb5671ba121afcb14b3bfeec6f4dd4e7093aafece599dda5`;
the actual derived host catch source is
`6485d3a8e267e10ccb193cd07c61131236d9865b361fe417a4d002f19ffb9e24`.
Odo independently checked the probe's exact bytes and confirmed the new nine-group test remained
unchanged at frozen SHA-256 `a97ad364d6e2560f8fd20dce8218c9f15c9b11b909971afe5c7d78af27cbcc18`.

Under the explicit planned source-version update, Odo changed only the current probe's expected
hash and the preservation-method label in `fixtures/test_npm_same_job.py`. Its other four exact
historical source assertions remain unchanged, and the probe assertion remains exact. The label
now distinguishes original controls from the current evolving prospective probe. New derived
eight-method test SHA-256:
`835524606bddecc08cd8798a3decccfdc52fd5b33de5c86d457254eb445876e3`.
The original PR25 controller/validators/test, historical source versions and all raw outcomes are
untouched. This versioned pin update is not an exception to the assertion or a retroactive pass.

- Requirement: retain exact current and historical source bindings after the allowed evidence-only
  probe evolution.
- Test Case: one affected eight-method Python suite on the current probe version, with bytecode
  writing disabled.
- Expected Result: all pure policy/admission/evidence/source checks pass with exact assertions.
- Observed Result: eight methods, eight passed, zero errors/failures in 0.005 seconds, exit 0.
- Status: PASS

- Requirement: actual failure emission/host retention and all authored finite diagnostic/oracle,
  privacy/schema/prefix/boundary controls must pass without target execution.
- Test Case: one frozen nine-group Node suite after the controlled pin update, on the source
  identities above. Only pure definitions and actual isolated catch bodies receive synthetic data.
- Expected Result: all nine groups run, including previously skipped helper cases; no skips.
- Observed Result: nine passed, zero failed/cancelled/skipped/todo, 59.906791 ms, exit 0. Both genuine
  pre-fix witness-loss regressions now pass; original acceptance parity and retained stderr
  65536/65537-byte controls also pass.
- Status: PASS

These checks establish the bounded offline evidence behavior only. They do not recover the old
126-byte ci output, identify its prior failing predicate, qualify npm or authorize a new attempt.
Scotty received the new derived-test hash for the owner pin closure; Bashir independently reviews
the final complete source closure and readiness. No npm, runtime, acquisition or container ran.

## Independent diagnostic-consistency regression before narrow repair

Bashir identified a current-mission P2 in the first witness implementation: the sanitizer accepted
non-object JSON kinds at `ci-changed`, `ci-audited` and `ci-funding`, although reaching them requires
an object whose earlier added counter passed. At `ci-added`, parsed array/string/number/boolean
values can only lack the property, so wrong-type/nonzero details are impossible. Scotty also
identified that Array.every skips holes in a direct sparse passed-prefix array. Host JSON cannot
encode array holes; that second case concerns the exported direct API, not a new host-input claim.

Odo appended exactly one finite regression group to the frozen test before producer repair.
The original nine groups remain unchanged. The
[expanded fixture frozen before repair](https://github.com/jnicholas000/basic-plugin/blob/7aeeb5dcf69fbf9d0aff33cf8baa9e9e37341a43/docs/spikes/fixtures/test-npm-failure-witness.mjs)
is 16,603 bytes, SHA-256
`0eb22750fa7f09e0a1928981c177e3383575db2fcf1b107fa0b0dd2e468f3e4c`.
The prior frozen nine-group identity and its actual outcomes remain historical above.

- Requirement: a retained witness must be consistent with the exact existing predicate order
  and a fully populated ordered prefix; do not change the ci oracle or its permitted ci-accepted
  witness case.
- Test Case: after the coordinator preserved implementation commit
  `7007f75870f478fe74b09228f715605fb684cdd0`, one expanded synthetic suite invoked the actual
  sanitizer on 22 invalid records: twelve later-checkpoint/non-object kinds, eight impossible
  ci-added details and two sparse direct-prefix arrays. It evaluates every record before one
  aggregate assertion and verifies input preservation. No implementation was edited by Odo.
- Expected Result: all 22 return null; the existing nine groups retain their previous behavior.
- Observed Result: one `node --test docs/spikes/fixtures/test-npm-failure-witness.mjs` exited 1,
  ten groups in 94.957 ms, nine passed and one failed, zero skipped. The actual sanitizer returned
  non-null for every one of the 22 invalid records. This is actual pure-function acceptance,
  not source inspection or missing-export evidence. Probe under test remained
  `9a412d237ec662a1fb5671ba121afcb14b3bfeec6f4dd4e7093aafece599dda5`.
- Status: FAIL

Scotty owns the narrow witness-kind/prefix repair. The original ci acceptance oracle and Data's
explicitly permitted ci-accepted witness remain unchanged. Recheck only affected pure tests after
the final repair and refresh the exact current-probe pin as separately authorized. No actual
probe/main, npm, process spawn, target runtime, container, archive or network action occurred.

## Final affected verification after consistency repair

Odo independently verified final probe SHA-256
`fd905605bd8d9b80c1f493d1726f9aad9e876eadb6ee57b41f8b93bbe1298cb3`
and confirmed that the expanded ten-group regression remained unchanged at
`0eb22750fa7f09e0a1928981c177e3383575db2fcf1b107fa0b0dd2e468f3e4c`.
Under the same explicit source-version authority, only the current-probe expected hash was
refreshed again in the separate eight-method suite. Its method label and four historical pin
assertions remain intact. Final eight-method test SHA-256:
`0c6839d21cf722eb4a15aa218630b0b058c2ec83bf1e4adc81e02529da780d6d`.

- Requirement: reject the demonstrated impossible witness combinations and sparse direct prefixes
  while retaining every original valid-oracle and failure-relay case.
- Test Case: one final frozen ten-group Node suite and one affected eight-method pure Python suite
  after the exact final-probe pin refresh. Actual host catch source at this verification was
  `97b3b84788fde67fbe5b5c03050e61c43b661891ed40683403d41daff492e418`.
- Expected Result: both affected suites pass, with no skipped regression group and no altered ci
  acceptance oracle or excluded historical failure.
- Observed Result: Python eight methods passed in 0.007 seconds, exit 0; Node ten groups passed,
  zero failures/cancellations/skips/todo in 71.489167 ms, exit 0. The previously accepted 22 invalid
  witness vectors now reject. Both pre-fix failure records above remain unchanged.
- Status: PASS

Scotty received the final eight-method test identity for the owner pin closure. These are synthetic
offline verification results, not npm execution, recovered old stdout or full runtime qualification.
Bashir owns the independent final readiness decision. No target/main, acquisition or container ran.
