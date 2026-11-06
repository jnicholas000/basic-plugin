# Same-job owned npm control — first observed result

Date: 2026-11-06. Mission slug: `candidate-catalog-parity`.
Outcome: **INDETERMINATE / npm startup and empty offline ci NOT QUALIFIED**.
The separately authorized one-use action is consumed. No retry occurred or is selected.
The temporary hook and checkout-depth override are retired; the ordinary workflow is restored.

## Exact source and retained evidence

[PR #28](https://github.com/jnicholas000/basic-plugin/pull/28) supplied the first same-repository
PR-opened action, attempt 1, in [run 42144112796](https://github.com/jnicholas000/basic-plugin/actions/runs/42144112796),
local job 127651328909. Its reviewed head was
`3cca93ea5991ad931b5c47b55896490d14d176c9`, base
`c85869d2fd2742ad2360665f06023fb99e02a4da`, and native checkout/test-merge
`5928c1753d6e53ecd950c36f2aaf9a992062c618`. GitHub's Git-commit API independently returns those
ordered base/head parents; native checkout log agrees. Reported runner image
`ubuntu24/20261101.360.1` is metadata, not host attestation.

The [unchanged raw receipt](candidate-npm-same-job-first-receipt.json) is 15,891 bytes, SHA-256
`debb5ad9d1928acac90f463663770f9da7e1c12689bad215f3dea7742010b091`.
Artifact 13468723681 is a 226,081-byte ZIP, SHA-256
`3e2736ad5f85942fb0a728a17a49a01c6bf7bef1c0e65f2ca689450a07322d13`.
Its digest, exact three inert JSON members and individual size bounds were checked before reading.
No target code or executable archive was uploaded as evidence. The full inventories remain in the
seven-day Actions artifact; the small raw receipt is durable source evidence.

| Inert member | Bytes | SHA-256 |
| --- | ---: | --- |
| npm inventory | 321518 | `200df0fcd7713a81a653aa7d160177ce2b0dda476c85df59b6d5dbb679191599` |
| official archive manifest | 1113992 | `a51be53c3f8023e063e4cb34148a3392e9845f83e7cabb55679241f172161e62` |
| raw first receipt | 15891 | `debb5ad9d1928acac90f463663770f9da7e1c12689bad215f3dea7742010b091` |

The receipt binds the exact owner, controller, pure validators, independent tests and original
source/evidence hashes. [Data's prospective contract](candidate-npm-same-job.md),
[Odo's tests and first failing regression](candidate-npm-same-job-odo-test.md),
[Scotty's implementation record](candidate-npm-same-job-implementation.md), and
[Bashir's independent review](candidate-npm-same-job-review.md) retain their separate ownership.
Pre-execution readiness is historical; it does not authorize another actual action.

## Reached observations

- One anonymous official archive GET, zero retries, 58,290,700 bytes; exact SHA-256
  `eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c` matched. All three fixed cache
  files and nine runtime records matched before the child. The archive/stage were released first.
- Preparation recorded 53,830.612606 ms. Its source-preservation checkpoint found 148 tracked
  source files unchanged. The later post-child source-preservation checkpoint was **NOT REACHED**;
  the earlier observation must not be presented as a final whole-action check.
- The accepted npm closure contained 1,635 files, 439 directories and 9,525,769 file bytes, with
  built-in npm config absent. Independent actual-data review bound every inventoried path/size/hash
  to the pinned archive manifest. npm 11.19.1 is manifest data here, not an observed command result.
- Existing host Node 22.23.4 orchestrated the action. The image imported, and effective child policy
  matched the frozen network-none/read-only/nonroot/resource/mount contract before start.
- Docker start was attempted once. Container state reported exit 126, not running and not OOM-killed.
  Start command returned exit 1, no signal/timeout, zero stdout and 265 stderr bytes. No raw native
  start diagnostic was retained; no contained probe JSON was captured.
- The child controller reported cleanup complete, no failures and no uncertain mutation outcome.
  The outer path cleanup and aggregate cleanup likewise report complete, uncertain=false and no
  remaining owned paths. Cache, marker, archive, stage, newly created version parent and owned
  image/container/temp resources were removed according to those source-bound cleanup checks.
  No runtime persists to a later job.

No observer-positive/reset, target Node version, npm version, empty ci, lifecycle suppression,
output acceptance or post-child source/runtime recheck was observed. The receipt enum
`INVOCATION_ATTEMPTED_IN_CHILD` records the start attempt; it is not affirmative target execution.
No actual candidate dependency or upstream package/configuration/build code ran.

## Limits and CI interpretation

Total action time was 60,291.656735 ms, including cleanup. Network elapsed was not separately
recorded; the source-enforced 60-second network deadline is not the total action duration.
The pre-npm conservative admitted bound was 1,208,840,192 bytes, within the original
1,288,490,188-byte ceiling. The npm phase's admitted peak was 1,047,654,400 bytes.
Measured preparation-owned filesystem peak was 495,144,960 bytes; the child controller's owned
filesystem peak was 293,212,160 bytes, separate from the still-live cache allocation 218,984,448.
These phase measurements and reserved bounds are distinct. Docker backend physical peak was
**not measured**; logical image size 142,773,979 bytes is supplementary only.

The first local CI job passed 26 existing Python checks plus 11 availability/ownership, 8 same-job,
4 cleanup-regression methods and 9 original npm pure tests. The capture step's API conclusion
`success` under `continue-on-error` does not mean the control passed: its native exit was1,
outcome enforcement failed, later build/output checks were skipped and private AQC was skipped.
Normal final-head checks after hook retirement remain separately required before merge.

## Diagnosis and exact next boundary

Read-only source review identifies a concrete harness mode incompatibility: the workflow sets
`umask 077`; the derived controller requests 0755 recursively created rootfs directories but does
not explicitly normalize those nested directories. POSIX creation semantics yield 0700. Tar assigns
root ownership while the child runs as 1001:1001, so intended runtime parent paths cannot be traversed.
This source-derived defect is consistent with exit 126. The actual tar modes and native start
stderr were not retained, so the recorded exit's cause is **not conclusively established**.

Before proposing another actual observation, independently reproduce that mode/umask boundary
with an owned inert regression, explicitly normalize and verify only newly owned rootfs directory
modes, and retain a bounded mode manifest plus allowlisted startup-error classification. Preserve
workflow umask, nonroot child, resource limits and other restrictions. Review the correction first;
any later archive acquisition or actual npm action needs separate admission and authority. Do not
change host security settings, substitute runtimes, install persistently or rerun this attempt.

The original PR #25 prerequisite INDETERMINATE result and PR #27 availability proof remain unchanged.
This phase provides partial preparation/inventory/policy/cleanup evidence, not npm qualification,
nonempty dependency behavior, candidate site parity, production promotion or full Missions 9/10 acceptance.
