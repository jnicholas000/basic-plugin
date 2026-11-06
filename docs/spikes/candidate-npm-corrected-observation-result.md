# Fresh corrected npm observation — first result

Date: 2026-11-06. Feature slug: `candidate-catalog-parity`.
Outcome: **INDETERMINATE; complete startup/empty-ci gate NOT PASSED**.
The single fresh grant is consumed. No retry occurred or is selected. The one-use hook and
checkout-depth override are retired; the workflow is restored to the mode-corrected main baseline.

## Source and immutable evidence

[PR #30](https://github.com/jnicholas000/basic-plugin/pull/30), initial same-repository PR-opened,
attempt 1, ran [42152688374](https://github.com/jnicholas000/basic-plugin/actions/runs/42152688374),
local job 127679411240. Reviewed head:
`c6cce523a913a9555d3071a93b56d4a677c0587c`; base:
`8cc32148b66c57d419110ff78e634b6f78594f95`; native checkout/test-merge:
`ce6ec802b99b98bca8de6625dec04a1018d006a7`. GitHub's Git-commit API independently corroborates
those ordered base/head parents. Reported runner image `ubuntu24/20261101.360.1` is metadata,
not host attestation.

The [unchanged first receipt](candidate-npm-corrected-observation-first-receipt.json) is 17,841
bytes, SHA-256 `b0d7603d59816ccd333576b83bcf82a74b1b53f31ef0773ebd524891d4f67229`.
Artifact 13473865565 is a 226,400-byte ZIP with SHA-256
`92ac168e5a07586f94a77e455cbbe37cae51c4ef7a3737ff364add2a6b63540e`.
Its digest, exact three inert JSON members and size bounds were checked before parsing. No
executable archive or installed runtime was uploaded; the full data inventories have seven-day
Actions retention, while the small first receipt is durable source evidence.

| Inert JSON member | Bytes | SHA-256 |
| --- | ---: | --- |
| corrected receipt | 17841 | `b0d7603d59816ccd333576b83bcf82a74b1b53f31ef0773ebd524891d4f67229` |
| npm inventory | 321518 | `200df0fcd7713a81a653aa7d160177ce2b0dda476c85df59b6d5dbb679191599` |
| archive manifest | 1113992 | `a51be53c3f8023e063e4cb34148a3392e9845f83e7cabb55679241f172161e62` |

[Data's preregistration](candidate-npm-corrected-observation.md),
[Odo's independent binding test](candidate-npm-corrected-observation-odo-test.md),
[Scotty's literal-only implementation](candidate-npm-corrected-observation-implementation.md) and
[Bashir's review](candidate-npm-corrected-observation-review.md) retain separate ownership.
The receipt binds the reviewed owner/controller/policy/test hashes and fixed original inputs.
All previous raw receipts, the availability proof and the mode-correction evidence remain unchanged.

## Directly recorded observations

- One official archive GET, zero retries, 58,290,700 bytes; SHA-256
  `eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c` matched. Three cache files
  and nine runtime records verified. Archive/staging resources were released before the child.
- npm inventory: 1,635 files, 439 recorded source directories and 9,525,769 file bytes; built-in
  config absent. Independent data review matched every file path, size and hash to the pinned
  archive manifest. Host orchestration used existing Node 22; target runtime stayed in the child.
- The corrected helper reported 446 rootfs directories at 0755, including all eight critical
  paths, plus the two exact empty config files at 0444. Directory-record digest:
  `f29d72c4f03df983ee233342ddea8d529822168e1585d95682bcf8c76f1fbe10`.
  Independent reconstruction from the accepted inventory/runtime/fixture table matches that count
  and digest. This is retained data consistency, not an independent physical tar-mode inspection.
- The owned probe executed and returned a structured failure at stage `npm-ci`. Its last child
  exited **0**, with no signal or timeout, **126 stdout bytes** and **0 stderr bytes**. The raw
  output body was not retained. The container later exited 1, was not running and was not OOM-killed.
- The controller's Docker-attach command exited 1 because the probe failed. Its classification
  `UNCLASSIFIED` supplies no affirmative native-exec error or diagnosis. It must not be treated
  as a repeat of the earlier native startup failure.
- Child cleanup reported complete, no failures and no uncertain mutation. Outer path cleanup and
  aggregate cleanup reported complete, uncertain=false and no remaining owned paths. The cache,
  marker, created version parent, archive/stage, owned image/container and temporary fixture were
  removed according to those source-bound checks; no installed runtime persists.

## Source-flow evidence and unobserved acceptance

The bound probe advances to `npm-ci` only after its fixed Node/platform/argv and input checks,
observer exit-73/marker/reset checks, and exact npm 11.19.1 version guard have passed. Thus the
recorded stage supports **partial source-flow evidence** for those preceding guards. The catch
path did not retain their individual values or raw version output; no complete observation object
exists. Do not invent or fill that object, or call the complete npm oracle successful.

The ci child's successful exit and empty stderr precede JSON parsing and strict summary checks.
A parse/summary acceptance predicate failed before `owned-output`, but the exact predicate and
126-byte body are unavailable. No output JSON is reconstructed from its length, no summary schema
is assumed, and no acceptance rule is relaxed.

Post-ci observer absence, stale-entry removal, unchanged output manifest/lock, absence of package
payload, output acceptance, final source/runtime preservation and a full successful observation
were **NOT REACHED**. The recorded 160 unchanged tracked files belong only to preparation before
the child; they do not establish the unreached post-child source checkpoint. The new progress
does not prove the historical exit-126 cause or upgrade either earlier INDETERMINATE result.

## Resource and CI interpretation

Preparation elapsed 50,781.927475 ms; total action elapsed 59,113.436306 ms including cleanup.
The network deadline remained 60 seconds; network elapsed was not separately recorded.
The pre-npm conservative admitted bound was 1,208,840,192 bytes; the npm phase bound was
1,047,654,400 bytes, within the retained 1,288,490,188-byte ceiling. Preparation-owned measured
filesystem peak was 495,144,960 bytes. The child controller's own filesystem peak was 293,212,160
bytes, separate from live cache allocation 218,984,448 bytes. Docker physical peak was not measured;
logical image size and conservative storage reserves are separate quantities, not a physical quota
attestation. All original time, resource and no-retry limits remain unchanged.

Initial PR CI passed 26 existing Python checks, ten owned mode groups and eight fresh policy methods
before capture. Native capture exited 1; `continue-on-error` makes its API step conclusion look
successful, but the original outcome enforcement failed. Later build/output checks and private
AQC were skipped. Normal exact-head checks after retirement are separate publication evidence;
they cannot convert this controlled result to PASS.

## Exact next gate

Prepare an offline, independently tested bounded failure witness that retains safe partial
checkpoints and a predicate-specific failure stage while preserving the existing oracle and
original evidence. Retain enough allowlisted ci parse/summary data to explain the failed check;
do not dump arbitrary environment/configuration or infer missing stdout. Review that source before
proposing any new actual observation. The consumed fresh attempt is not retried. Any later runtime
archive acquisition or target/container execution needs separate authority and fresh admission.

This phase partially supports corrected preparation, owned probe startup and earlier guarded
checkpoints. It does not qualify complete empty offline ci, nonempty dependencies, upstream
package/config/build code, candidate-site parity, production promotion or full Missions 9/10.
