# Corrected owned npm observation — independent Odo test freeze

Mission slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `8cc32148b66c57d419110ff78e634b6f78594f95` and coordinator's newly approved,
separately named bounded corrected observation. This record does not promote earlier results.

Odo reread the installed Starfleet Crew 0.2.0 behavioral-integrity role. Before any producer
update, changed exactly one literal in [fixtures/test_npm_same_job.py](fixtures/test_npm_same_job.py):
the expected branch is now `feat/owned-npm-corrected-observation-20261106`.
All eight methods, source/hash vectors and quantitative limits remain unchanged. Frozen test:
9,427 bytes, SHA-256 `f8fb4bc2022e6eab30b21bee2f0ba38368416daae3cf3e61bece2cb06ac0eb7b`.

## Executed binding regression

- Requirement: the new authorized action must use its own exact branch binding rather than
  spoof or reuse the old action's admission identity.
- Test Case: one `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s docs/spikes/fixtures
  -p test_npm_same_job.py` against unchanged pure module SHA-256
  `4c23ee0b32cac019b4d0cf3cdbfdd23c2ef66ef1cc516ff75af1c938bda228f5`.
- Expected Result: the fresh exact policy must become admissible after the narrowly owned
  producer update; the old module should reject the new branch before that update.
- Observed Result: exit 1, eight methods in 0.004 seconds, seven passed and one errored with the
  actual `ValueError('owned-npm-same-job-requirement')` from policy validation at the fresh-policy
  acceptance assertion. This is a real stale-binding rejection, not an import/loader error.
  Later drift subcases within that one method were not reached; earlier historical coverage
  is preserved and is not relabeled as a new execution.
- Status: FAIL

## Preserved basis and next verification

The corrected mode helper remains SHA-256
`47b544208400dcf72ab38a74f8b335061c7e51e3f17aa51b88dc5aaa9362dc4b`;
its ten-group fixture remains SHA-256
`7fb1e1be8f5f67c2f7a3b1fa241593e4ab24678bc64c0c1dced67249ae7efe5d`.
No old raw receipt, mode fixture, original npm fixture/controller/test or producer was changed by
Odo. The old test version remains in the immutable base/history; its previous observations stand.

Scotty owns the fresh policy/guard/evidence-namespace update. Run this frozen focused suite after
that update, then obtain independent Bashir review before coordinator admission. Workflow/native
event guarding and actual runtime behavior are separate review/action obligations, not established
by this branch predicate. No extra static checklist or duplicate broad suite was introduced.
No archive acquisition, installation, wrapper/main, target Node24/npm, container, external command,
credential probe or live retry occurred in this Odo task. Actual corrected observation remains
NOT EXECUTED here; normal readiness judgment stays with Bashir.
