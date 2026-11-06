# Owned npm empty-remove contract v2 — offline plan

Feature slug: `candidate-catalog-parity`; date: 2026-11-06.
Base: `8ea6328e177a4b75f758cbd854b1428230254698`.
Branch: `feat/owned-npm-empty-remove-contract-20261106`.
Status: **OWNER-APPROVED OFFLINE AMENDMENT; NO LIVE GRANT**.

Data reread the installed Starfleet 0.2.0 role, PROJECT, original probe/host oracle,
read-only source comparison and independent Bashir PASS. Seven exact shipped-byte matches at
npm/cli commit 3acf9a784798094a5feb43c2e1898429dd667cb6 establish a producer remove array omitted
by v1. PR #32's actual extra keys/body remain unknown; all prior INDETERMINATE outcomes stand.

## Exact approved delta

V2 permits optional `remove` only when Array.isArray(summary.remove) and length===0.
Objects omitting it remain eligible, including safe removed>0. Keep removed a safe nonnegative
integer, NOT forced zero. The producer couples REMOVE increments to records; rejecting nonempty
remove metadata is an explicit conservative condition, not universal removal compatibility.

Keep every other predicate/order/required observation field/default, runtime/invocation,
resource/deadline/security/output/source/cleanup gate. No generic extra fields, coercion,
raw-body retention, actual dependencies, hook, acquisition, npm/container/runtime or CI action
is part of this planning/implementation slice.

## Minimal source and exact APIs

1. Keep v1 `fixtures/npm-preparation-probe.mjs` byte-immutable at
   `fd905605bd8d9b80c1f493d1726f9aad9e876eadb6ee57b41f8b93bbe1298cb3`, original PR25
   `run-npm-preparation-control.mjs`/validators/tests immutable at their existing pins, and all
   six raw historical receipts unchanged.
2. Add controlled copy `fixtures/npm-preparation-probe-v2.mjs`, with the same built-in-only
   imports, main/fixture bytes and exact invocation. Export the same pure API names
   `evaluateOwnedCiResult(ci)` and `sanitizeOwnedNpmFailure(value)`, plus constant
   `npmContractVersion='owned-empty-ci/v2'`. The copy is justified because v1 main is private;
   do not copy the full derived host controller or Python owner.
3. V2 evaluator differs only by adding remove to the key allowlist and appending its optional
   array/empty check AFTER existing add/change checks. New failure checkpoint `ci-remove`,
   jsonKind object, detail not-array/nonempty-array. Exit/stderr/parse/counters/removed/other-key/
   add/change failures keep exact original ordering. If another unknown key exists, ci-keys
   still fails first. Successful summary retains remove unstripped; all other success fields
   remain identical. No defaults, added required fields or broader JSON kinds.
4. V2 failure envelope retains v1 closed shape/2048-byte/privacy/prefix rules, but witness.version
   is exactly 2; reject v1 witnesses in the v2 sanitizer. Add only the ci-remove diagnostic pair
   above. Source/outer receipts identify owned-empty-ci/v2; this does not add a required field
   to the original success observation. V1 and its witness behavior stay unchanged.
5. Add small `fixtures/npm-observation-v2.mjs` exporting `verifyNpmObservationV2(observation)`:
   true or Error, input preserved. Derive only the short original complete-observation validator;
   same exact field set/truth values and original order, summary keys extended by remove, its
   optional-empty validation appended after add/change. No prevalidation that reorders earlier
   observation failures; no silent stripping before an old validator call.
6. Current retired `run-npm-same-job-control.mjs` imports v2 sanitizer and v2 validator, copies the
   v2 source to unchanged child destination `/npm-probe.mjs`, records explicit contract version
   and new source hash. `run_npm_same_job.py` adds exact v2 probe/validator/new-test pins before
   spawning any host that imports them. Retain v1/original pins too. Update prospective source
   bindings only; branch guards, retired workflow and runtime admission remain closed/unchanged.

## Odo → Scotty → Bashir

Odo first freezes `fixtures/test-npm-empty-remove-v2.mjs` plus a compact ownership note. Use
synthetic ci/observation/error records, no main/spawn. Cover absent/empty remove acceptance,
nonempty/null/string/object/number/bool rejection, unchanged safe removed>0, missing zero fields,
malformed JSON/types, unknown audit/unreviewedScripts/error/arbitrary keys and add/change-before-
remove ordering. Compare v1/v2 on all cases outside the approved delta. V1 must still reject
remove; a missing future module is only loader evidence, not a behavioral pass.

Test complete v2 host observation acceptance/rejection and actual derived-host finalization/
catch integration with an inert extraction or import-safe seam; testing only a detached helper
is insufficient. Verify v2 sanitizer rejects v1 version, retains only new closed diagnostic and
leaks no strings. Freeze tests before Scotty; Scotty owns source changes but not Odo tests.

Bashir independently reviews exact diff, controlled-copy parity, both consumer call sites,
pre-import pin closure and privacy/size limits. Run affected synthetic suites after final changes;
no live hook or criterion-driven rerun. Coordinator owns PROJECT/Basic-only Ops/normal publication
follow-through separately; this Data task edits only this plan.

[OBSERVABLE_OUTCOME] Probe and actual derived host agree on the one approved schema delta.
[EXACT_ERROR_CONTRACT] Other failures/order remain unchanged; new ci-remove rejection is finite.
[SECURITY_PROPERTY] History/v1 immutable; closed witnesses and all safety/output gates retained.
[MANUAL_VERIFICATION] Explicit v2 pins/version before future runtime imports, no hook activation.
The previous full gate stays INDETERMINATE and later gates may still fail. Any future controlled
observation needs separate finite authority and fresh admission; current 27%/66% usage and 16.78 GB
are planning observations only. Decisions SOURCE_SPECIFIED/ALIGNED; implementation detail is
DERIVED_NO_ARCHITECTURE_CHANGE/ALIGNED. Candidate execution remains SPIKE_REQUIRED.

## Frozen metadata/call-site clarification

Use field `npmContractVersion` on the derived JS outer result and Python outer receipt, exactly
`'owned-empty-ci/v2'`. JS obtains the value from the v2 probe export; Python uses the fixed
source-pinned literal. It identifies the selected prospective contract even if target execution
is not reached, not a success claim. Do not add it to the successful child observation, policy or
admission record, and never relabel historical receipts. The actual derived finalizer calls
`verifyNpmObservationV2`; its probe copy tuple is `npm-preparation-probe-v2.mjs` to the unchanged
rootfs destination `npm-probe.mjs` (child path `/npm-probe.mjs`). All other logic/gates stay unchanged.
