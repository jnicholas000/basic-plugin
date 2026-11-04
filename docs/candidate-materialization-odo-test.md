# Candidate Materialization — Odo Test Record

## Test Summary

Independent test-author work preceded implementation against consumer base
`0dbb78e2100592ce50b8437d02ceaf18b5f661e7` and the frozen
`docs/candidate-materialization-plan.md`. Added three ordinary Node behavioral tests in the existing
`tests/vendor.test.mjs`; no production implementation, dependency, workflow or accepted input changed.
The initial focused run is RED because the planned module/command does not yet exist.
This is test-author evidence, not a scored/model trial or final readiness judgment.

## Handoff Expectation Match

The frozen API is `materializeCandidate({ repository, localRoot })`; the CLI accepts only
`UPSTREAM_REPO_DIR` and prints one JSON result. Both use a disposable localRoot and real synthetic Git
commits. Tests encode the exact copy/prune/required paths from the plan, preserve the existing throwing
overlay bytes, and require successful same-path controls before testing rejections. Missing feature
errors therefore cannot count as successful negative behavior.

This artifact follows the explicitly assigned same-slug test-record path.

## Executed Checks

### Existing focused suite

- Requirement: Existing vendor behavior remains usable before feature implementation.
- Test Case: Run `node --test tests/vendor.test.mjs` once in the disposable consumer checkout.
- Expected Result: Existing eight tests pass; new candidate controls expose the missing implementation.
- Observed Result: Exit 1; 11 tests, 8 passed, 3 failed, 0 cancelled, 0 skipped, 0 todo; duration 714.610458 ms. Tests 1–8 passed, including real Git vendoring and committed provenance checks.
- Status: PASS

### New API generation control

- Requirement: Inert deterministic candidate generation, provenance, stale replacement and accepted-state preservation.
- Test Case: Test 9 imports the actual new module, then would materialize a real synthetic Git fixture twice.
- Expected Result: `MATERIALIZED_UNVALIDATED_SITE`, candidate provenance, required retained files, unchanged local guard and protected fixture bytes, excluded catalogs, identical regeneration and no execution marker.
- Observed Result: `ERR_MODULE_NOT_FOUND` for `eng/materialize-candidate.mjs`; failure occurs before fixture generation or candidate assertions.
- Status: FAIL

### New API rejection-group control

- Requirement: Reject unsafe inputs before mutating existing candidate or accepted state.
- Test Case: Test 10 imports the actual module and requires a successful materialization before its rejection group.
- Expected Result: Positive control succeeds, then rejection behavior is observable.
- Observed Result: `ERR_MODULE_NOT_FOUND`; no rejection assertion executed or counted as successful.
- Status: FAIL

### New CLI control

- Requirement: Working CLI positive path precedes override/error rejection evidence.
- Test Case: Test 11 creates a synthetic Git fixture and invokes the actual command with `UPSTREAM_REPO_DIR`.
- Expected Result: One JSON result accepted by the same output/provenance observer as the API.
- Observed Result: Node v22.15.1 reports `MODULE_NOT_FOUND` for `eng/materialize-candidate.mjs`; the positive control fails and no CLI rejection assertion runs. Fixture cleanup completes through `finally`.
- Status: FAIL

## Manual Or Blocked Checks

### Candidate generation assertions

- Requirement: Fixed candidate status/output/role, provenance binding, exact retained/pruned content, unchanged throwing overlay and accepted bytes, deterministic replacement and execution-marker absence.
- Test Case: Complete test 9 and the positive controls of tests 10–11 after implementation.
- Expected Result: All explicit file, provenance, snapshot and marker assertions hold against real Git blobs.
- Observed Result: Not reached because the implementation is absent. Manifest install/build scripts and Astro config contain marker-writing payloads; none are intentionally executed by the test harness.
- Status: NOT EXECUTED

### API preflight rejection matrix

- Requirement: Invalid configuration/options or missing retained inputs fail before output mutation.
- Test Case: After the positive control, vary candidate repository/ref/overlay; add root catalog or public-data copy; add catalog keep; remove a prune; empty requiredPaths; supply role/output/ref/unknown options; omit repository; remove `BaseLayout.astro` in a real second Git commit with accepted and candidate config refs matching that commit.
- Expected Result: Every call rejects, preserves existing candidate and accepted snapshots, and leaves the execution marker absent.
- Observed Result: Rejection matrix not reached. For the missing-file case, the accepted config is the ref authority specified by the frozen API contract; the fixture's baseline file is protected but is not used as an alternate API ref override.
- Status: NOT EXECUTED

### CLI rejection matrix

- Requirement: CLI exposes no arguments/head override and sanitizes failures.
- Test Case: After the positive control, supply accepted-role/output arguments, `UPSTREAM_HEAD` equal to the valid fixture SHA, an empty repository, and a nonexistent repository containing a private canary string.
- Expected Result: Nonzero exit, nonempty diagnostic at most 1,024 characters, no canary/internal stack text, unchanged candidate and accepted snapshots, and absent execution marker.
- Observed Result: Rejection matrix not reached. The 1,024-character bound concretizes the plan's bounded generic diagnostic requirement without requiring exact wording.
- Status: NOT EXECUTED

## Issues Found

- Planned production module/config are absent at this prospective test stage. The missing-module RED result is retained and is not runtime safety evidence.
- New fixture/output observers and negative cases require their first post-implementation execution; they have not yet been demonstrated against a working materializer.
- Real reviewed-upstream generation, website build/browser compatibility, publication and baseline advancement are outside this test-author execution.

## Constraints And Evidence

- Exactly one focused test invocation; no repeat, install, upstream script/build, browser, credential use, publication or commit.
- Supported shared-usage and reserve checks passed before/after this role. Raw quota, reset and
  task-freeze receipts remain private with the coordinator; they are not runtime safety evidence.
- The original prospective plan/task freeze is retained separately, including exact source and
  input hashes. Publication sanitization removes only private operational paths/quota data.
- Only additions to the existing test surface plus its `lstat` import, and this evidence file, are owned by this test assignment. The pre-existing untracked plan is coordinator-owned.
