# Owned npm same-job control — independent Odo test ownership

Mission slug: `candidate-catalog-parity`. Date: 2026-11-06.
Checkpoint: **TESTS FROZEN BEFORE PRODUCER; BEHAVIOR NOT EXECUTED**.
Basis: `c85869d2fd2742ad2360665f06023fb99e02a4da` and
[Data's prospective same-job contract](candidate-npm-same-job.md), SHA-256
`fed48ffb04b65f5062849e841578b1b5c56f73376f077893f01d80848ea86cc1`.

Odo actually read the installed Starfleet Crew 0.2.0 behavioral-integrity role and core
principles, the original npm pure exports/fixtures, the availability contract and its inert
ownership-test seam. This role owns only the new test and this note; the coordinator-selected
spike location supersedes the role's generic testing-artifact location. No producer existed
when the test was frozen. Bashir retains readiness judgment.

## Frozen test and expectation match

[fixtures/test_npm_same_job.py](fixtures/test_npm_same_job.py), SHA-256
`9bdc9d9543039ab34a00f0a082710c871cb70cf90096d1b2e5c01db5ab51649d`, is 9,414 bytes.
It imports only the three Data-specified pure functions from the future `npm_same_job.py`.
Eight methods use small dictionary records, input copies and named original-source hash reads.
They neither import wrappers/probes nor invoke filesystem mutation, archives, network,
subprocesses, Docker, Node24 or npm. No old fixture, test or implementation was changed.

| Requirement | Test case | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| Exact policy/source and bounded control | Valid policy plus independent source, every numeric limit and execution-surface drift; reject booleans as numbers | Exact policy returns True without mutation; independent drift raises ValueError | Authored before producer | NOT EXECUTED |
| Phase lifetime prerequisites | Verified cache, archive release, stage release and no ownership uncertainty individually required | Every false/unknown/wrong-type prerequisite rejects | Authored before producer | NOT EXECUTED |
| Aggregate disk bound | Exact ceiling and first-byte excess from each sum component; independently insufficient Docker reserve; tar cap; zero-byte accounting control | Exact bound accepts; each independent excess/short reserve rejects | Authored before producer | NOT EXECUTED |
| Reserved phase time and numeric types | 115,000 ms accepts; 114,999 ms and independent malformed byte/time fields reject | Child and both cleanup allowances remain reserved | Authored before producer | NOT EXECUTED |
| Composite single-attempt success | Every preparation/npm/source/child-surface fact, network GET count, retries and peak independently varied | Success cannot survive a false phase, extra attempt or over-budget record | Authored before producer | NOT EXECUTED |
| Cleanup truth | Incomplete, uncertain, remaining paths, wrong scalar/array types and incomplete/extra cleanup keys | No uncertain or incomplete cleanup can be promoted to success | Authored before producer | NOT EXECUTED |
| Closed records | Missing each field, extra field and non-record argument for all three predicates | Reject rather than assume defaults | Authored before producer | NOT EXECUTED |
| Historical fixture preservation | Exact hashes of original controller/probe/observer/test and installer source | All five original files remain byte-identical | Authored before producer | NOT EXECUTED |

## Executed static check

- Requirement: the frozen test must be syntactically valid before implementation.
- Test Case: existing host Python parsed only this test's source with `ast.parse`; checked that
  the future producer file did not exist and computed the test's byte length/hash.
- Expected Result: parsing succeeds without importing or running the test or any producer.
- Observed Result: source parsed; producer absent; the length/hash above were recorded.
- Status: PASS

## Remaining operational checks and limits

The predicates constrain records; they do not establish actual acquisition order, one GET,
stop-before-child after a preparation failure, effective native container policy, interrupted
ownership acknowledgement or real cleanup. Independent Bashir source review must inspect those
paths in the actual derived wrappers; the sole admitted CI receipt and full inventories supply
the separate actual-action evidence. A narrow inert seam can be added only if a concrete touched
operational defect requires reproduction; no placeholder static ordering check is called runtime
proof. Existing nine npm and eleven availability/ownership tests remain independently owned and
unchanged. No missing-module test was run merely to obtain a loader failure.

Run the focused suites after Scotty implements the new producer, then record exact candidate
hashes and observations before Bashir readiness review. Any mismatch returns to the owning role;
Odo does not repair production code or broaden this empty-graph gate. The target test, any actual
Docker image/container creation, runtime acquisition and cleanup remain **NOT EXECUTED** here.

## Independent operational regression — child cleanup propagation

Bashir found a blocking P1 in the first derived owner, SHA-256
`f07b511fdf66a00b03e591119525aed5e5cf99427a74d26f4a891f5cd02f663b`.
A child receipt with failed image/container cleanup and a false mutation-uncertainty flag did
not set the outer owner's `child_uncertain` signal. Later rejection of the result therefore
could leave aggregate cleanup reporting success despite an outstanding child resource.

Odo independently froze [fixtures/test_npm_same_job_cleanup.py](fixtures/test_npm_same_job_cleanup.py)
before correction. Test SHA-256:
`1d754c29bb19fad671c953d8ead2c9f227bd0bd20b5d7575a3159cdc574a9399`;
3,848 bytes. The original eight-method test remains unchanged.

- Requirement: incomplete, malformed or uncertain child cleanup must propagate to the owner;
  acknowledged successful cleanup must not create uncertainty, and prior uncertainty must survive.
- Test Case: parse the actual owner source, select its single `child_uncertain` assignment whose
  expression references `npm.get`, compile only that statement and execute it with in-memory
  receipt dictionaries. The wrapper, imports and main are never evaluated. Malformed-expression
  errors model the existing outer-handler behavior of retaining the prior signal. No filesystem
  mutation, network, subprocess, Docker, archive, target-runtime or cache operation occurs.
- Expected Result: exact successful cleanup preserves false, prior uncertainty preserves true,
  and every failed/incomplete/malformed cleanup sets the uncertainty signal true.
- Observed Result: one existing-host invocation of `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest
  discover -s docs/spikes/fixtures -p test_npm_same_job_cleanup.py` exited1. Four methods ran in
  0.001 seconds: the exact-success and prior-uncertainty controls passed; twelve subcases failed,
  including well-formed image/container failures, incomplete completion and malformed receipts.
  The explicit mutation-uncertainty=true case passed. These are actual inert statement-behavior
  failures rather than loader failures or a reimplementation of the desired predicate.
- Status: FAIL

This seam establishes the local propagation defect only. It does not execute the owner's full
exception/finally path, prove actual daemon cleanup or replace Bashir's review of the corrected
ordering and aggregate result. Scotty owns the repair; coordinator admission remains blocked.
