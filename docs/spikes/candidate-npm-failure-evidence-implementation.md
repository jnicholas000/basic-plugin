# Owned npm failure evidence — implementation

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `dfcef02dc146628f938c80768a523a55c792b28e`.
Status: **OFFLINE IMPLEMENTATION; INDEPENDENT REVIEW IN PROGRESS; NO RUNTIME AUTHORITY**.

## Outcome and boundary

The current owned probe can report the first failed existing ci predicate and an ordered safe
checkpoint witness. This repairs the missing failure evidence seen in the
[corrected observation](candidate-npm-corrected-observation-result.md); it does not reconstruct
its lost 126-byte stdout, identify its historical failing predicate or change its INDETERMINATE
status. No acquisition, installation, container, target Node/npm or controlled attempt occurred.
Actual runtime hooks remain retired. Further acquisition/execution requires separate authority.

Data's bounded contract was frozen before producer work, SHA-256
`c8aae82f19d64341ad548b20c36fe4746fa344c37eb19dea8f45d887d424cd41`.
The installed Starfleet Data/Odo/Scotty roles were actually used; Bashir retains independent
readiness judgment. Independent [Odo ownership and results](candidate-npm-failure-evidence-odo-test.md)
record the genuine pre-fix witness loss and subsequent synthetic checks. No native automatic
crew activation or historical runtime qualification is inferred.

## Source changes

- `evaluateOwnedCiResult` preserves the original exact ordered status/stderr/JSON/counter,
  removed-count, allowed-key and optional-array oracle. Successful parsed summaries are returned
  unchanged. Rejections return only a finite checkpoint, JSON kind and detail, never the failed
  parsed object, raw stdout/stderr, unknown keys or values. Missing funding is still rejected.
- The actual probe advances `admission`, `observer-positive`, `observer-reset` and `npm-version`
  only after their existing guards succeed. Its failure catch emits a sanitized version 1 witness.
  A ci diagnostic becomes the stage before the acceptance assertion. Successful observation shape,
  owned fixture bytes, flags, environment, deadlines and lifecycle checks remain unchanged.
- `sanitizeOwnedNpmFailure` returns a fresh closed envelope or null: finite stage/code/signal
  enums, exact child fields/bounds, ordered prefix/stage binding, fixed diagnostic fields and a
  2,048-byte cap. Unknown native code/signal maps to OTHER only during construction. Invalid
  evidence remains generic failure; no raw fallback is retained. The derived host bounds stderr
  at 65,536 bytes, JSON-parses as data, and actually uses this shared sanitizer in its catch.
- Derived JS and Python source bindings pin the new current probe and independent witness test;
  the host retains exact head/test-merge file comparison. Python transport and the total
  65,536-byte receipt cap are unchanged. The historical PR25 host controller/validators/tests,
  mode helper/tests, original installer and every raw receipt remain unchanged. Historical probe
  bytes remain attributable to their original commits; the current prospective probe is versioned.
- Normal CI adds only the inert witness test command to its existing local unit-test step.
  No job, permission, trigger, target-control hook, service or persistent runtime is added.

## Verification and remaining review

Odo froze the independent test at commit `957a0d91112298edab70741780cf7cbb2709f208` before
Scotty implementation. Actual isolated probe and host catch bodies lost witness/code in two
meaningful pre-fix failures; seven absent-helper groups were explicitly skipped, not treated as
behavioral success or loader failures.

On the source identities below, the new nine-group synthetic suite succeeded 9/9 with zero
skips in 58.737708ms under Scotty, then independently 9/9 in 59.906791ms under Odo. It exercises
actual failure emission/retention, literal original-oracle parity, malicious payload privacy,
closed schema/prefixes, unknown native-code mapping and actual host 65,536/65,537-byte bounds.
Odo separately versioned only the derived eight-test current-probe hash and label; the other four
historical hash assertions remain exact. Those eight Python tests succeeded in0.005s. The original
nine npm contract tests succeeded in 81.28075ms, including unchanged fixture literals and success
validator. JS syntax, Python AST and literal owner source/test pin closure were checked.

These are synthetic/isolated-catch and static source observations only. No whole main or spawn
function was executed by this verification. Full normal CI and independent review remain required.
Preflight review identified two pending sanitizer consistency edges: sparse direct-call prefix
arrays and impossible non-object JSON kinds at later ci checkpoints. They cannot arise from the
ordinary parsed host envelope as sparse arrays, but the pure API must still reject them. Odo owns
focused regression evidence before the narrow correction; no oracle or runtime gate changes.

## Current implementation identities before the review delta

| Source | SHA-256 |
| --- | --- |
| `docs/spikes/fixtures/npm-preparation-probe.mjs` | `9a412d237ec662a1fb5671ba121afcb14b3bfeec6f4dd4e7093aafece599dda5` |
| `docs/spikes/fixtures/run-npm-same-job-control.mjs` | `6485d3a8e267e10ccb193cd07c61131236d9865b361fe417a4d002f19ffb9e24` |
| `docs/spikes/fixtures/run_npm_same_job.py` | `c5fdbf58abf03a91fac7a3690f2bea83106e19efbcd62e8b780498edd1e949e3` |
| `docs/spikes/fixtures/test-npm-failure-witness.mjs` | `a97ad364d6e2560f8fd20dce8218c9f15c9b11b909971afe5c7d78af27cbcc18` |
| `docs/spikes/fixtures/test_npm_same_job.py` | `835524606bddecc08cd8798a3decccfdc52fd5b33de5c86d457254eb445876e3` |

The original first ENOENT, availability proof, exit 126 and corrected ci stop stay separate.
After reviewed offline convergence, the next runtime question remains the existing empty-graph
npm oracle; no nonempty dependency, upstream build/browser, production parity or complete
Missions 9–10 acceptance follows from this correction.
