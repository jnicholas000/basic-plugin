# Fresh owned npm witness observation — implementation handoff

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Source basis: `743498a292278350294155cd9a3fd42d0a434914`.
Status: **SOURCE PREPARED; ACTUAL EXECUTION NOT ADMITTED BY THIS RECORD**.

Scotty reread the installed Starfleet Crew 0.2.0 implementation role and the
[Data contract](candidate-npm-witness-observation.md). Independent Data/Odo freeze commit
`c0cb2d1f5696d3ad156320dac260d864a878619e` preceded these producer changes. Odo's stale-branch
rejection and explicitly absent capacity-helper skip remain separate pre-implementation evidence.

## Bounded source delta

The existing pure policy, Python owner and derived JS guard now name the actual fresh branch
`feat/owned-npm-witness-observation-20261106`. Scratch roots use fresh cryptographic nonces under
`owned-npm-witness-` and `basic-npm-witness-`. Evidence names are
`basic-npm-witness-inventory.json` and `basic-npm-witness-archive-manifest.json`; coordinator
capture must use `basic-npm-witness-receipt.json`. Docker names remain `basic-npm-${nonce}`.
Existing environment key names carry actual fresh metadata; no old branch/event disguise,
cloned wrapper or runtime substitution was introduced.

New pure `validate_ci_capacity` accepts only the exact integer snapshot record, excludes bool,
checks fragment size 1..4096 and available blocks 0..2^63-1, and returns the exact integer product
only when at least 1,288,490,188 bytes are reported. It mutates no input and performs no I/O.

The owner takes one capacity snapshot for each of its already selected/pinned RUNNER_TEMP and
toolcache anchors before the first owned mkdir or GET. Existing anchor identity checks run before
and after each snapshot. The receipt contains only fixed labels runner_temp/toolcache and bounded
numeric fragment/block/byte facts. Both anchors are validated conservatively even if they share
a device; no additional path, privileged read, retry or capacity reservation is introduced.
Existing anchor fragment-size checks, aggregate prospective admission, measured owned allocation
and conservative Docker reserve remain separate and unchanged. These snapshots cannot establish
later free space, reservation, physical Docker allocation or whole-host peak guarantees.

The probe fd905605, witness test 0eb22750, mode helper 47b54420, original oracle, historical source
pins and all raw receipts remain unchanged. All other controller/phase/cleanup/time/resource and
execution rules remain unchanged. No workflow, PROJECT, Ops, Git, CI, acquisition/download/install,
target runtime, npm or container action was performed by this implementation role.

## Executed offline checks and handoff

One affected independent pure suite succeeded 9/9, zero skipped, in 0.005s after implementation.
This includes the meaningful formerly stale branch case and the new finite capacity predicates.
The derived JS syntax and Python AST checks succeeded. Static reversibility checks recover exact
base bytes after undoing only the declared branch/namespace substitutions and capacity helper/call
block. Original owner PINS dictionary is byte-value equivalent to the base; probe/helper/test
hashes were checked directly. Source ordering places capacity admission before first mkdir/GET.
No unchanged broad runtime/qualification suite was repeated.

This is pure/static evidence, not an actual CI capacity or npm result. LaForge owns the one-use
exact-head workflow, fresh shared budget/resource admission, sole action and hook retirement;
Bashir independently reviews exact source/workflow and subsequent first result. Prior outcomes
remain INDETERMINATE and no retry or new acquisition authority follows from this document.

## Frozen source identities

| Source | SHA-256 |
| --- | --- |
| `fixtures/npm_same_job.py` | `e6718ac14be5b78a289bbe8ca9bd073ca43aa3718d1bcdda1000781eacec5bc5` |
| `fixtures/run_npm_same_job.py` | `20fe119386ba01ee388042d1f840753938e46298f86379ac73ec17608c4ff1f3` |
| `fixtures/run-npm-same-job-control.mjs` | `59084d579d19478dab710c8469a78f8bed7c436a2c854c4a235d0fe6fbd30b77` |
| `fixtures/test_npm_same_job.py` | `a8b4f8e89c8c9c71a459754d650d53e00c63a891d5df47e63b9247ad91ad9008` |

Data contract SHA-256: `9024be380c8f4d83237d7f5a615022010a25799b13824c86bc93f68fee75ed25`.
