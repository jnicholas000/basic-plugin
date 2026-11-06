# Owned npm empty-remove contract v2 — implementation

Feature slug: `candidate-catalog-parity`; date: 2026-11-06.
Basis: `8ea6328e177a4b75f758cbd854b1428230254698`.
Status: **PROSPECTIVE OFFLINE CONTRACT V2; NO RUNTIME AUTHORITY OR RESULT**.

The owner-approved [Data contract](candidate-npm-empty-remove-v2-plan.md) permits optional
`remove` only as an empty array. This is an explicit new contract, not an exception applied to
old results. Safe nonnegative `removed` counts remain eligible, including values above zero.
Nonempty removal metadata remains deliberately rejected. The comparison of shipped npm source
motivated this amendment; PR #32's actual unretained extra key names/body remain unknown.

## Minimal versioned source

`npm-preparation-probe-v2.mjs` is a controlled copy because the immutable v1 main is private.
It keeps the same built-in-only imports, fixture exports, invocation and all existing gates.
Its only semantic delta is the optional empty `remove` key/check after add/change, finite
`ci-remove` diagnostic, witness version 2 and exported `owned-empty-ci/v2` contract label.
Successful summaries retain `remove` unstripped. Unknown audit/unreviewedScripts/error/other
keys still fail `ci-keys` first. No other counter, required field, predicate order or default changes.

The short `npm-observation-v2.mjs` derives only the original full-observation validator. It
preserves exact required fields/truth values and validation order, extending the summary keys
and appending the same optional empty-array check. It does not strip metadata before delegating
to v1 or prevalidate summary fields ahead of earlier observation gates.

The existing derived host selects v2 imports, actually calls its validator in finalization and
its sanitizer in the failure catch, reads the v2 fixture literals, and copies that source to
the unchanged child destination `/npm-probe.mjs`. There is no duplicated full host/controller.
JS outer result and Python outer receipt record `npmContractVersion=owned-empty-ci/v2`; this
identifies the selected prospective contract even before target execution, not successful use.
The original child success observation/policy/admission shapes are unchanged.

The owner retains every v1/original pin and adds exact v2 probe/validator/test identities before
any host import. The host keeps actual head/test-merge file comparisons for both old and new
source bindings. Branch guards, resource limits, capacity admission, output/source/cleanup logic,
archive identity and retired hooks are unchanged. Normal CI adds only the inert v2 test command
to its existing local unit step; no job, trigger, permission or target-runtime action is added.

## Independent ownership and observed verification

Installed Starfleet Data/Odo/Scotty roles were used. Odo's [frozen evidence](candidate-npm-empty-remove-v2-odo-test.md)
precedes producer changes at commit `6374df0ee40bc5d2ab215ae5a17bb0a3c1420464`; Data plan SHA-256
is `2d46c057292e979200493e545c46f42b7622fb7ec7a956aec9d3d8c84e3958b6`.
The genuine pre-implementation result was one passing historical-preservation group, two v1
empty-remove rejection failures and seven explicitly absent-v2 skips. No loader failure was
used as behavioral evidence, and Odo's tests were not edited by Scotty.

The first implementation run returned nine passed groups and one structural pin-extraction
failure because the existing Python PINS closing brace was on its last entry line. Giving the
expanded dictionary a conventional separate closing-brace line changed no value or behavior.
On the final source, all ten synthetic groups passed, zero skipped, in 87.292083ms. Tests cover
optional absent/empty remove, nonempty/wrong types, unchanged removed counts, predicate order,
outside-delta parity, every required host observation gate, v2-only closed witnesses, actual
selected host imports/finalizer/catch, source-copy tuple and pre-import pin closure.

The unchanged legacy witness suite also passed ten groups in 47.678917ms. That suite injects
its v1 sanitizer into an isolated catch body: it supplies v1/body-unit evidence, not proof of
the newly selected v2 import. Current-route v2 integration evidence comes from the new suite's
actual import resolver and actual finalizer/catch blocks. Nine existing pure policy/capacity/
preservation methods passed in 0.005s. No whole main, spawn or target runtime ran in these checks.

JS syntax and Python AST checks succeeded. Undoing only the approved v2 changes recovers the
exact v1 probe text and original short validator body. Python function ASTs equal the base except
for the selected outer metadata keyword; old PINS remain unchanged and the three new pins match
actual bytes. All six raw historical receipts, v1 probe fd905605, original host/oracle efeebb36,
old tests, observer and mode helpers remain unchanged. These are bounded synthetic/static
observations, not an actual npm pass or a reconstruction of old output.

## Source identities

| Source | SHA-256 |
| --- | --- |
| `docs/spikes/fixtures/npm-preparation-probe-v2.mjs` | `2fe35ef9ae647b0cc506e615596a07dddc8b403a7900c4ba8c219aea4e8c0c68` |
| `docs/spikes/fixtures/npm-observation-v2.mjs` | `f85c038d6d188a6fc3d03bc3f34beab99ad679bbf093e2793d24223b9c20d385` |
| `docs/spikes/fixtures/run-npm-same-job-control.mjs` | `8eb8c1df036b5c762c9481f54bbb671bafb5049b65fbf77a290643dd0a4bffb6` |
| `docs/spikes/fixtures/run_npm_same_job.py` | `c498100727a2b7206ea82af4eac1ab3606ff1719e7551cc6cb87ee8f8f1c0126` |
| `docs/spikes/fixtures/test-npm-empty-remove-v2.mjs` | `be6b8f15560cd5716866573b4dd395e4448c9646d973fd98c470bb57c7155398` |

Independent Bashir source/review and normal exact-head checks remain required. Any future
controlled observation needs a separate finite grant and fresh admission; it may still fail a
later gate. No new acquisition/install, container, target Node/npm, dependency/build/browser,
credential/security action, successful historical reclassification or full Mission acceptance
occurred. Candidate execution remains SPIKE_REQUIRED.
