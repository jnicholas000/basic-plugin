# Owned npm failure evidence — independent Bashir review

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `dfcef02dc146628f938c80768a523a55c792b28e`.
Boundary: bounded offline evidence correction; no runtime observation or execution authority.

Result: **PASS for the offline implementation, subject to normal exact-head CI and explanation
checks before publication/merge**.

## Summary

Bashir reread the installed Starfleet reviewer role and canonical review rubric, and independently
reviewed Data’s contract, Odo’s frozen regressions/results, final probe/host/owner changes, source
pins and implementation evidence. The first-failed-predicate witness is bounded and actually
used by both catch paths; the original ordered ci acceptance oracle is preserved. The narrow
sanitizer consistency finding was reproduced independently before repair and is resolved.
Human comprehension is sufficient from the durable ownership/implementation records. Historical
INDETERMINATE results and the missing prior output/predicate remain unchanged.

## Required fixes

None for the approved offline scope. Exact-head normal CI remains required; no local full-suite
pass or runtime readiness is inferred from source review.

## Accepted risks

None.

## Optional improvements

None requested.

## Source and evidence review

`evaluateOwnedCiResult` preserves the original predicate order and native evaluation semantics:
status 0, empty stderr, JSON.parse, strict zero added/changed/audited/funding in that order,
safe nonnegative removed, original allowed keys, then optional add/change empty arrays via `in`.
It introduces no alternate schema, missing-counter default, coercion or funding exception.
Parsed null/primitive/array rejection, negative zero, duplicate-key parsing and numeric overflow
are covered against Odo’s literal original oracle. Success returns the original parsed summary;
failure returns null summary and fixed checkpoint/kind/detail only. Successful observation shape,
fixture/lock bytes, flags/environment, spawn bounds and later output checks remain unchanged.

Actual source advances the four witness-prefix entries only after the corresponding existing
guards succeed. Admission is appended after setup, observer-positive after its exit/marker guard,
observer-reset after unlink/reset verification, and npm-version after exact version acceptance.
Transport failure before ci evaluation keeps ci null; explicit diagnostics become the stage before
the acceptance assertion. Owned-output requires all four prior checkpoints plus ci-accepted.
A ci-accepted witness still has INDETERMINATE status and never establishes output or full-gate
success. That permitted case is explicit in Data’s contract, not a silent oracle change.

The probe catch constructs only fixed status/reason, allowlisted native code/signal and bounded
child fields plus the witness, then actually calls the shared sanitizer. Unknown native values
map to OTHER during construction. Invalid evidence falls back to a fixed generic failure without
raw forwarding. The host first bounds stderr to 65,536 bytes, JSON-parses as data, calls the same
sanitizer and retains only its valid closed result. Invalid/oversized/malformed input remains a
generic failed observation. The Python owner already retains that parsed child receipt, so no
transport implementation changed. Its 65,536-byte total receipt cap remains unchanged.

The sanitizer requires a closed 2,048-byte envelope, strict scalar/enum types, dense own ordered
prefix positions, finite stage/diagnostic consistency and child count bounds. It returns fresh
closed copies without input mutation. No raw stdout/stderr, parsed failed summary, unknown key,
string value, error message, environment/config value or arbitrary path escapes in the witness.
This is structural evidence validation and source-controlled checkpoint reporting, not an
independent authenticated execution attestation or reconstruction of historical missing values.

### Consistency finding and resolution

- Type: Missing Case
- Severity: P2
- Basis: acceptance-criterion; truthful finite diagnostic/cross-stage rejection.
- Disposition: fix-now, resolved in the reviewed candidate.
- Reopens Current Mission: yes when found; no unresolved reopening remains.
- Original gap: first sanitizer accepted non-object JSON kinds at later zero-counter checkpoints,
  although added 0 had already passed. At ci-added, parsed non-object values can only be missing
  (null wrong-type), not nonzero/other wrong-type. Separately, sparse direct-call prefix arrays
  passed Array.every because holes were skipped. JSON transport cannot encode holes; this second
  vector concerns the exported pure API contract only.
- Evidence: after first implementation commit `7007f75870f478fe74b09228f715605fb684cdd0`, Odo
  froze one additional finite group at `7aeeb5dcf69fbf9d0aff33cf8baa9e9e37341a43`. The actual
  sanitizer accepted all 22 invalid records, producing nine passing groups and one failed group.
  This is real pure-function behavior, not a loader or hypothetical host attack result.
- Resolution: dense own prefix checks now reject holes. Later counters require object kind;
  ci-added null requires wrong-type and other parsed non-object kinds require missing. Original
  ci acceptance and explicitly allowed ci-accepted witness semantics are unchanged. Final ten
  groups reject all 22 invalid records; the original nine groups remain unchanged.

## Ownership, tests and preservation

Odo freeze commit `957a0d91112298edab70741780cf7cbb2709f208` preceded producer work. Its actual
source-extracted probe and host catch regressions first failed because witness/code were dropped;
seven future-helper cases were explicitly skipped. No missing export was called behavioral proof.
The first nine-group implementation then passed under Scotty and independently Odo. The targeted
consistency regression above was frozen before its repair.

Final evidence is attributed, not duplicated by Bashir: Scotty ten groups passed, zero skipped,
in 82.784917 ms; Odo independently passed ten groups, zero skipped, in 71.489167 ms. Odo’s final
source-versioned eight-method Python suite passed in 0.007s. Only its current-probe hash and honest
method label changed; the other four historical pin assertions remain. The original nine npm
contract tests passed in 81.28075 ms before the sanitizer-only delta; their fixture/validator basis
is unchanged. Syntax, owner AST and exact literal-pin checks were recorded. These are synthetic
pure/isolated-catch observations, not npm or container execution.

The coordinator’s one local full Python attempt ran 21 methods successfully but had a workflow
module loader error, `ModuleNotFoundError: yaml`; it did not pass the complete suite. No local
installation or retry was performed. Existing CI already has pinned PyYAML 6.0.3 setup and must
supply its own current-head full check. This is a recorded verification gap, not authority to
claim a pass or invent a new installation prerequisite for publication.

Bashir independently confirmed all five historical raw receipts and six preserved source
boundaries byte-identical to the basis: original PR #25 controller/validator/test, lifecycle observer,
original installer and mode helper/test. Historical probe bytes remain attributable to immutable
commits; only the current prospective probe was explicitly versioned. Python owner function ASTs
are unchanged; only fixed source/test PINS changed and match actual bytes. Those pins execute
before future archive transfer/host import. The derived host also retains head/test-merge source
comparison and exact new probe/test hashes. No branch, time/resource/cleanup policy or target
execution surface changes. CI adds only an inert witness-unit command to the existing local step;
no runtime hook, job, trigger, service, permission or persistent installation is added.

| Final artifact | SHA-256 |
| --- | --- |
| Current probe | `fd905605bd8d9b80c1f493d1726f9aad9e876eadb6ee57b41f8b93bbe1298cb3` |
| Derived host controller | `97b3b84788fde67fbe5b5c03050e61c43b661891ed40683403d41daff492e418` |
| Python owner | `005a3ccc2f984de41b1096efb12f10a7a3d200310a2ee9c45d3104f1615458f5` |
| Independent ten-group witness fixture | `0eb22750fa7f09e0a1928981c177e3383575db2fcf1b107fa0b0dd2e468f3e4c` |
| Derived eight-method exact-version test | `0c6839d21cf722eb4a15aa218630b0b058c2ec83bf1e4adc81e02529da780d6d` |
| Ordinary workflow with inert unit addition | `28b0216ae8bfbe757c2021d194909e4a9e591841b952612fa6d558bfe37cb847` |

## Risks and handback

No private chat, credential, employer material or coordination path is included in the new public
implementation/test records. The prior 126-byte output and failing predicate remain unknown;
no retrospective witness, successful npm result, dependency/build/site parity or full Missions 9/10
acceptance is claimed. This correction is ready for normal publication checks, not a new runtime
attempt. Any acquisition/target/container observation still needs separate reviewed authority and
fresh admission. No broader diagnostic framework or testing program is selected.

Bashir used read-only source/diff/hash/AST inspection and wrote only this review artifact. No
behavioral suite, probe/main, runtime, acquisition, container, credential/security experiment,
subagent, Git mutation or publication was executed. No denied or uncertain action occurred.
