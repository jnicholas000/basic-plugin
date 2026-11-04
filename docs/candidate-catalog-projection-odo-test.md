# Candidate Catalog Projection — Odo Test Record

This artifact preserves the test-author checkpoints. Later producer execution and current readiness
are separately attributed in the [implementation](candidate-catalog-projection-implementation.md)
and [review](candidate-catalog-projection-review.md); they are not an independent Odo runtime verdict.

## Test Summary

Feature slug: `candidate-catalog-parity`; bounded slice: read-only local projection.
Independent tests precede implementation at consumer base
`cbf6666ed1ed82ba9935a9b884ac5842caf5a36d`. Three ordinary Node tests were added in
`tests/local-catalog-projection.test.mjs`. The single initial execution is RED because the production
module is absent. No negative behavior is credited against that absence; all rejection assertions
follow a successful positive control in the same test.

## Handoff Expectation Match

Tests call the real synchronous `projectLocalCatalog({ root })` API and actual CLI path
`eng/project-local-catalog.mjs`. Synthetic fixtures contain committed Git blobs, fixed commit dates,
three agents, two skills, one local plugin and six search records. This differs intentionally from
the real consumer's one-agent/four-search-record baseline: fixtures cover absent/single/array agent
model forms, absent/inline tools, single-quoted apostrophes, JSON escaped quotes, skills with and
without assets, and executable-mode ordinary blobs without executing them.

The contract leaves the assets container shape unspecified; the observer accepts skill-relative
strings or file records with skill-relative names. Other tested field values are tied to committed
source, not an implementation stub. The assigned evidence path overrides Odo's default docs/testing
location. No artifact/skill content was invoked as instructions.

## Executed Checks

### Initial focused test invocation
- Requirement: Preserve the first prospective test outcome and expose missing implementation without manufacturing negative passes.
- Test Case: `node --test tests/local-catalog-projection.test.mjs`, exactly once in the isolated consumer checkout.
- Expected Result: Missing implementation fails the new controls before rejection assertions.
- Observed Result: Exit 1; 3 tests, 0 passed, 3 failed, 0 cancelled, 0 skipped, 0 todo; duration 46.971334 ms. Each failed with `ERR_MODULE_NOT_FOUND` for `eng/project-local-catalog.mjs`. No fixture or resource assertion was reached.
- Status: PASS

### Test 1 positive API/CLI behavior
- Requirement: Every mapped resource shape, deterministic provenance/content and no writes.
- Test Case: Import the real projector, create a committed fixture, inspect all payload fields and run the actual CLI.
- Expected Result: A synchronous JSON-serializable `LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE` result; matching CLI output and protected bytes.
- Observed Result: Import failed with `ERR_MODULE_NOT_FOUND` at test line 148 before fixture creation.
- Status: FAIL

### Test 2 committed-HEAD behavior
- Requirement: Dirty edits and untracked resources do not replace committed source authority.
- Test Case: Require a successful baseline projection; dirty manifest/agent files and add untracked skill/prompt files; then commit a README change and observe new commit-bound provenance.
- Expected Result: Dirty checkout still returns the original committed projection, and the later committed README deliberately changes commit/input hashes/content digest.
- Observed Result: Import failed with `ERR_MODULE_NOT_FOUND` at test line 165 before the positive control or dirty cases.
- Status: FAIL

### Test 3 rejection-group control
- Requirement: Rejections are observed only against a working projector and leave source/protected bytes unchanged.
- Test Case: Require a successful complete projection before API option, committed-input and CLI rejection cases.
- Expected Result: Positive control succeeds before any negative result is evaluated.
- Observed Result: Import failed with `ERR_MODULE_NOT_FOUND` at test line 191; no rejection assertion was evaluated.
- Status: FAIL

## Manual Or Blocked Checks

### Complete record/hash/date/count observers
- Requirement: All mapped fields are sourced coherently and provenance is deterministic.
- Test Case: Test 1 checks agent identifiers/titles/descriptions/paths/filenames/dates/model/tools and sorted unique facets; skill identity/title/body reference/files/sizes/assets/bin-obj exclusion/dates; local plugin metadata/items/detail references/root marker/tags/null optional metadata; empty unsupported categories/facets; exact search coverage; ASCII-sorted input paths/modes/sizes/SHA-256; full-result contentDigest; observation limits and source binding. It compares repeated API calls with exact single-JSON-plus-LF CLI bytes.
- Expected Result: All observers agree with the committed fixture, not mtimes or untracked files; no absolute checkout root or invented contributor/install information appears.
- Observed Result: Not reached; the implementation and observers still need their first execution against a working module.
- Status: NOT EXECUTED

### Mutation and execution-marker observers
- Requirement: Projection performs no writes or source/asset execution.
- Test Case: Snapshot all non-Git fixture files, including protected accepted config/overlay/generated/workflow bytes; compare after API/CLI projections and rejection attempts. Include a tracked executable-mode script asset that would create `EXECUTED-ASSET` if invoked; assert the marker stays absent.
- Expected Result: Byte-identical fixture files and no marker, with all asset bytes represented only as hashed data.
- Observed Result: Not reached. The harness never intentionally executes the marker script or skill/agent instructions.
- Status: NOT EXECUTED

### Committed-input rejection matrix
- Requirement: Bound local source/schema/count/path/mode/frontmatter and inventory validation fail closed.
- Test Case: After a successful control, commit independent faults: manifest/index schema; foreign source/repository; mismatched metadata; extra plugin row; wrong/fractional/unknown/nonzero-unsupported capability; each unsupported tracked root; nested agent; missing manifest/index/README/SKILL metadata; mismatched skill name; missing/duplicate/block/anchor/tag/nested/unterminated header fields; wrong tools/model types; unsafe Git path; consumed submodule/symlink; empty inventory.
- Expected Result: Synchronous API rejection; CLI exit 1 with no stdout and exactly `Local catalog projection failed.` plus LF on stderr; snapshots unchanged and marker absent. Each fault is committed before invocation, avoiding dirty-tree false positives.
- Observed Result: Not reached. Missing-module failures are not evidence that these faults are rejected correctly.
- Status: NOT EXECUTED

### Override rejection matrix
- Requirement: Root is the only API option and the CLI accepts no arguments.
- Test Case: After a successful control, attempt output/ref/repository/role/unknown API options and a CLI root argument containing a private canary string.
- Expected Result: API throws; CLI emits only the exact generic error, exit 1 and no stdout; protected bytes unchanged.
- Observed Result: Not reached.
- Status: NOT EXECUTED

## Issues And Remaining Evidence

- Implementation is absent. Initial missing-feature RED is expected at test-author handoff and supplies no runtime safety/readiness claim.
- The first working implementation must exercise the fixtures and observers; no implementation stub or substitute success was created.
- Real consumer projection/hash/count evidence remains with the implementation/review owners. No website build/browser/integration/overlay activation was attempted or inferred.

## Constraints And Receipts

- Frozen contract SHA-256: `504349ec114a82e3facb922152d6997dda8fc274b1025ea3634e3a4c7fbecad2`.
- Private coordinator freeze receipt verified SHA-256 `21ce2d4e642d6ac9bd302c9c8fe41a54feff6a31882526bbe89e85f1f05f09d8`, frozen `2026-11-04T06:54:06.306639+00:00`.
- Initial executed test source SHA-256: `efa8b9a00d838c26ce1db7763d65325f5a46f11f7e7fe1165603a7946a6924f4`; no test edits after that run.
- Supported account allowance was checked privately before and after the initial run; source/window/stop receipts remain with the coordinator. No attributable cost or savings is claimed.
- Exactly one test invocation. No new dependencies, network, upstream execution, source/build/config/skill execution, production edits, package edits, PROJECT edits, contract edits, workflows, external contact, further role assignment or commit.
- Coordinator-owned parity plan/field contract changes pre-existed this assignment. Test owner writes only this evidence file and the new focused test file.

Publication note: private operational paths and account-meter details were moved to the coordinator
receipt. The original first-red record and its test-source hash are preserved unchanged privately;
all execution outcomes and uncredited assertions above are unchanged.


## Independent Odo Author-Shape Correction Control

This separately authorized bounded correction follows required P1 issue 1 in
`docs/candidate-catalog-projection-review.md`. The original three tests and their initial outcomes
above remain unchanged; the pre-delta test source and original first-red receipt are retained
privately by the coordinator. This follow-up is attributed to the independent Odo test author,
prior to the producer's author-normalization fix.

### Committed author-shape positive control
- Requirement: Emit author metadata in the pinned consumer's object-or-null shape while preserving supported input semantics.
- Test Case: Added one focused test after the original three. Its successful baseline confirms absent author remains null; committed object author must preserve `{ name: 'Local Author', url: 'https://example.invalid/local-author' }`; committed string author must emit `{ name: 'Local Author' }`. Each projection checks source commit, consumed manifest SHA-256, unchanged fixture/protected bytes and absent execution marker before checking author shape.
- Expected Result: Both accepted author forms project successfully with the required consumer-shaped author value.
- Observed Result: Baseline absent-author and committed object-author assertions passed. The committed string-author projection succeeded, as did its provenance, byte-preservation and marker checks; its author assertion then failed: actual string `"Local Author"`, expected object `{ name: 'Local Author' }`. No assertion after that failure is credited.
- Status: FAIL

### Single pre-fix focused follow-up run
- Requirement: Retain the actual first result of the added requirement control against the unfixed implementation.
- Test Case: `node --test tests/local-catalog-projection.test.mjs`, once for this correction cycle, against projector SHA-256 `ca00f217d8af048132d4817f8f4255c7493e4ab7c4fba6d18459d0d0b6f1c2a3`.
- Expected Result: Existing three tests remain green; the new positive control exposes the confirmed author shape defect.
- Observed Result: Exit 1; 4 tests, 3 passed, 1 failed, 0 cancelled, 0 skipped, 0 todo; duration 6393.267666 ms. Original tests 1–3 passed. New test 4 failed at its string-author `deepStrictEqual` assertion with `ERR_ASSERTION`. This is a reached behavioral failure, distinct from the original missing-module RED.
- Status: PASS

New test source SHA-256: `0bddc6f8840fb2cb7aa0531e9cfcb324fb3764bac720bb7a729ba6e3a7d0654f`. The original source remains an unchanged
prefix with SHA-256 `efa8b9a00d838c26ce1db7763d65325f5a46f11f7e7fe1165603a7946a6924f4`.
Only the new test and this append-only record were changed by the test owner; production bytes
remain at the reviewed pre-fix hash. No fix, repeat run, package/PROJECT/contract edit, new dependency,
external contact, role assignment or commit occurred. Supported account allowance checks before and
after this follow-up remained below the authorized stop; operational receipts remain private.
The producer owns normalization and its subsequent focused verification.


## Ordinary PR20 Repair Continuation — Shallow-History Regression

This is a separately admitted ordinary review-comment repair for automatic-review P2 thread
`PRRT_kwDOUNIPCs6zfe4K`. It does not reclassify the original frozen one-correction phase as passed;
that phase's stop/disposition, original freeze and all earlier results remain unchanged. The
independent Odo test owner appended only one fifth test, with the previous four tests unchanged.
The coordinator privately preserved their pre-delta source/hash and the first follow-up output.

### Full-history control and shallow-history rejection
- Requirement: A projected resource's last-change date must come from complete committed Git history; reject a shallow boundary that cannot establish that date.
- Test Case: Extend the owned committed fixture with a README-only commit dated `2024-06-07T08:09:10Z`, leaving the resource changes at their earlier date. Clone it with full history and then with depth one through temporary local `file://` transport. Confirm full-history output through the existing complete record/hash/date/provenance observer; confirm identical HEADs, full/shallow flags and Git's misleading shallow resource log date. Invoke both real API and CLI on the shallow clone. Compare non-Git source/full/shallow byte snapshots and check execution-marker absence before the rejection assertion.
- Expected Result: Full-history projection succeeds with the true earlier resource date. The same-HEAD shallow API throws, and its CLI exits 1 with no stdout and exactly `Local catalog projection failed.` plus LF on stderr. All observed bytes remain unchanged and markers absent.
- Observed Result: Both local clones succeeded without transport overrides. Full-history positive assertions passed; the depth-one clone reported shallow=true and the same HEAD. The shallow API incorrectly returned agent date `2024-06-07T08:09:10Z` and did not reject; the CLI exited 0, emitted stdout and had empty stderr. All byte-snapshot and marker checks passed before the combined rejection assertion failed. This is a reached behavioral defect, not credit for transport/import failure.
- Status: FAIL

### Single pre-guard focused run
- Requirement: Preserve the first result against the reviewed, unfixed implementation.
- Test Case: `node --test tests/local-catalog-projection.test.mjs`, once for this repair continuation, against unchanged projector SHA-256 `23b2d5d24df6b5091401e0c0d43373f3ed1c7cd975300d302fa83802e864f810`.
- Expected Result: Prior four tests remain green and the new shallow-history control exposes the review finding.
- Observed Result: Exit 1; 5 tests, 4 passed, 1 failed, 0 cancelled, 0 skipped, 0 todo; duration 7351.759833 ms. Tests 1–4 passed. Test 5 failed at its combined API/CLI rejection assertion with `ERR_ASSERTION`; every listed full/shallow control and snapshot/marker observation was reached first.
- Status: PASS

New test SHA-256: `df022b2f4c692df71da95e92d516af5655194d5ccb3c0f6f2c9188cb4e303f60`. The pre-delta source remains an unchanged
prefix with SHA-256 `0bddc6f8840fb2cb7aa0531e9cfcb324fb3764bac720bb7a729ba6e3a7d0654f`.
No production edit, repeated run, transport/security override, external network, dependency install,
upstream execution, other test category, new role or commit occurred. The local Git fixtures are
test-owned; source/assets remain data. Account-stop checks were completed privately and remain with
the coordinator. The producer owns the shallow-history guard and subsequent verification.
