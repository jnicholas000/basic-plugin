# Fixed npm Prerequisite Metadata Diagnostic

Current status: **OBSERVED / MISSING_PREREQUISITES**. Basis: main
`d8c193fda8c59879f8c7e419df366423e7bf8cb4` and the preserved
[first npm prerequisite stop](candidate-npm-preparation-result.md).
The prospective contract and pre-execution checkpoints below are preserved. The actual first
metadata result follows them; it neither reruns nor reclassifies the earlier npm attempt.

## Prospective Boundary

Observe which named fixed prerequisites are present on one current `quality.local` Linux runner.
Retain fourteen labeled selectors from the original npm controller: cache, completion marker,
version header, its nine runtime destination records, npm directory and npm manifest. There are
thirteen unique requested paths because the loader source serves two destination labels.

For each unique prerequisite use only `lstat` and, on success, `realpath`, once each. Retain requested
path, label, type, size, resolved path and operation-specific bounded error code. Missing inputs
are diagnostic findings. Permission denial stops further observation without retry; unattempted
selectors remain explicitly unobserved. No directory listing, prerequisite-content read/hash,
loading of prerequisite packages, target Node 24/npm invocation, subprocess, container, download, installation or security
probe is part of this diagnostic. The already selected Node 22 host controller only reads its
named owned source/evidence files and bounded public CI event JSON for admission.

The twelve scalar receipt bindings identify reviewed controller source, unchanged original
controller/first receipt, run/attempt, head/base/test-merge and allowlisted reported runner metadata.
The coordinator must separately corroborate actual checkout SHA from the pinned checkout's native
Git log and exact merge parents from GitHub Git-commit metadata. The observer does not establish
that external source binding or attest the runner image.

Use only this branch's first same-repository `pull_request.opened`, attempt 1:
`feat/npm-runtime-prerequisite-metadata-20261105`. The existing local job receives a temporary
capture/upload hook; pushes, synchronize, reopen, main and manual reruns skip it. Limit the
collector to thirty seconds and its complete LF JSON receipt to 64 KiB. Retain the first result
and retire the hook before merge. No npm-control retry is selected.

This observes metadata on a new runner, not the disposed runner that produced the original ENOENT.
Presence/type/size do not establish approved byte identity, executable availability, confinement or
npm preparation qualification. Preserve all production gates, reference-only lock, accepted
pins/output, structural adapter, throwing guard and automatic-baseline stop.

## Actual Role Ownership

The installed Starfleet 0.2.0 roles are used explicitly: Data selects this bounded diagnostic;
independent Odo freezes its tests before Scotty implements the observer/caller; Bashir reviews the
implementation and first result. LaForge coordinates source admission and external evidence.
This records explicit role use, not automatic activation or native custom-agent registration.

## Existing Pages Follow-Up

The previous main deployment run [42098453313](https://github.com/jnicholas000/basic-plugin/actions/runs/42098453313)
failed after polling `updating_pages`; its action canceled deployment. A read-only API follow-up
confirmed `deployment_cancelled`. The [existing public index](https://jnicholas000.github.io/basic-plugin/)
returned HTTP 200 with a 7,411-byte
index, SHA-256 `b73b7c13efa53f21b9513436e8fd7e8caa5fb0735f59e81db7bbaba3ba8741e7`,
exactly matching `site/index.html` on the basis above. This establishes index availability and
byte equality only, not a successful new deployment, browser/asset coverage or candidate parity.
No retry, Pages setting change or publication was performed by this follow-up.

## Implementation And Offline Verification

Independent Odo's test ownership was committed as
`8378e2260bf3e0b10e2253e6495f4463aa1461ed` before either producer existed. Its initial run stopped
at `ERR_MODULE_NOT_FOUND` without executing assertions; this is loader evidence only. Scotty's
subsequent single frozen-suite run passed six groups with injected inert metadata and owned-source
reads. No actual prerequisite was observed by those tests. The later caller-only adjustment to
retain bounded admission errors on stdout did not alter the tested pure module.

| Prepared source | SHA-256 |
| --- | --- |
| `fixtures/npm-prerequisite-metadata.mjs` | `a13e9643b05f1fbe50aa6aa2d4c88889149eda27767a8860ad0d48c7af97109d` |
| `fixtures/run-npm-prerequisite-metadata.mjs` | `7cddcbd6e0a7460b268cff56559e2d31db444bf88d74576bfc27d0f201551570` |
| `fixtures/test-npm-prerequisite-metadata.mjs` | `49bf2aea4b9a4aae10ecfeaa79e23f0aa2187b8109bf2df1a876de6d0144a63d` |
| Temporary `quality.yml` | `4ee9beee2b8fc1accc2c3029f440ab71fc846af0f53d7d65dac4348bd12feddc` |

The caller checks the original npm controller SHA-256
`efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7` and unchanged first receipt
`eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e` before observing metadata.
Its reviewed source transitively pins the pure module. The temporary shell limits the caller to
thirty seconds and retains complete bounded JSON before enforcing the original outcome. Missing
prerequisites are a completed diagnostic, not an npm pass. Admission, permission and other errors
stop without retry. Independent readiness review, source/resource admission and actual observation
remain pending at this checkpoint.

Independent Bashir pre-execution review returned **PASS / READY** against the exact source pins
above and the frozen six-test result. No required fixes were identified, no tests were repeated
and no actual prerequisites were read during review. This is readiness for the one admitted
metadata observation, not a result or npm qualification.

## 2026-11-05 — First Metadata Observation

The sole observation completed in [run 42103887134](https://github.com/jnicholas000/basic-plugin/actions/runs/42103887134),
[local job 127513527017](https://github.com/jnicholas000/basic-plugin/actions/runs/42103887134/job/127513527017),
attempt 1 for [PR #26](https://github.com/jnicholas000/basic-plugin/pull/26). The reviewed head was
`5716cb99b4f6c521c17b22718a59f8a08777e629`, base
`d8c193fda8c59879f8c7e419df366423e7bf8cb4`; actual checkout
`637a68127d200a3e2802f01f76ba6d62efdbcb08` was corroborated by the pinned checkout's native
`git log -1 --format=%H` output. The supported GitHub Git-commit API independently returned those
ordered base/head parents for that test-merge commit. This supplies the planned external source
corroboration; the observer did not obtain it itself.

The receipt reports image `ubuntu24`, version `20261101.360.1`, matching the job setup metadata.
All fourteen labels are recorded, with thirteen unique paths. Six selectors returned `ENOENT`
at `lstat`:

| Selector | Missing requested path |
| --- | --- |
| cache | `/opt/hostedtoolcache/node/24.22.1/x64` |
| cache-complete | `/opt/hostedtoolcache/node/24.22.1/x64.complete` |
| node-header | `/opt/hostedtoolcache/node/24.22.1/x64/include/node/node_version.h` |
| runtime:/runtime/node | `/opt/hostedtoolcache/node/24.22.1/x64/bin/node` |
| npm-root | `/opt/hostedtoolcache/node/24.22.1/x64/lib/node_modules/npm` |
| npm-manifest | `/opt/hostedtoolcache/node/24.22.1/x64/lib/node_modules/npm/package.json` |

The other eight runtime labels, representing seven unique system-library paths, were observed
as regular files with resolved paths. No permission/error stop or unobserved row occurred. Their
reported sizes match the earlier inventory; no library content was read or hashed, so this does
not establish approved byte identity. The diagnostic status is `MISSING_PREREQUISITES`, a complete
observation rather than a successful npm gate.

Artifact `13450632583`, `npm-prerequisite-metadata-637a68127d200a3e2802f01f76ba6d62efdbcb08`,
is a 1,058-byte ZIP with GitHub SHA-256
`cb9fb725a1af25580d5c2a91429785fe5060d583e4c8326a9bf0513ab0c63586`.
The downloaded ZIP matched that length/digest before its sole named JSON member was read as data.
The [unchanged raw receipt](candidate-npm-prerequisite-metadata-receipt.json) is 3,943 bytes,
SHA-256 `98a50ed171e884f20384c31fc6928c4cd07a4bc29b9d28fcd81a41dec7cfd2cc`.
Its twelve scalar bindings match the admitted controller, preserved original evidence, source,
run and reported image. The six frozen tests and existing 26 Python tests passed before capture;
capture, retention and diagnostic enforcement all passed. No Node 24, npm or Docker operation ran.

The current pinned cache is demonstrably absent. This is consistent with the [image
manifest](https://github.com/actions/runner-images/blob/ubuntu24/20261101.360/images/ubuntu/Ubuntu2404-Readme.md)
listing Node 24.22.2 instead of 24.22.1, but it does not identify the exact path that
caused the original disposed runner's ENOENT. The earlier raw result remains INDETERMINATE.
No alternative runtime/cache path was inspected or selected.

The temporary metadata hook is retired. `quality.yml` again matches the basis byte-for-byte,
SHA-256 `47fd7fc8fde1ea65d4411528a82b8ba7b9038a44353a73c1435a4fc2f5c503d0`.
The reviewed observer/caller/tests and original npm source/first receipt are unchanged. Normal
PR/main checks cannot repeat this diagnostic or the npm control.

Before a future npm gate, a separately reviewed availability step must supply the exact pinned
Node/npm cache and verify its approved bytes plus the full runtime closure. Installing that cache
or selecting a different runtime is outside this diagnostic's authority. No installation,
substitution, new host, security change or npm retry is selected here. Metadata diagnosis is
complete; npm preparation and broader candidate/Missions 9–10 acceptance remain open.

Independent Bashir post-result review returned **PASS** after checking the ZIP/raw receipt,
fixed schema, current-run classification, external source corroboration, Project State precision
and hook retirement. No required fixes remain in this diagnostic increment. The existing Node 22
host ran the collector; the target Node 24 and npm did not run. Normal exact-head merge checks
remain separate from this review and cannot convert metadata into runtime qualification.
