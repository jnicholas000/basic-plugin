# Owned npm same-job control — independent Bashir review

Mission slug: `candidate-catalog-parity`. Date: 2026-11-06.
Review boundary: readiness for one separately authorized, source-bound owned empty-graph
observation. No actual preparation, target execution or runtime result is established here.

Result: **FAIL — one aggregate cleanup evidence defect blocks execution admission**.

## Summary

Bashir actually read the installed Starfleet Crew 0.2.0 reviewer role, review-rubric procedure
and core principles, then independently inspected Data’s frozen handoff, Odo’s source/test
ownership record, all new producer code, its operational differences from the historical
wrappers, the temporary workflow and the prospective PROJECT reconciliation. The composition
otherwise preserves the approved scope and prior restrictions. Its first source candidate can
misreport completed aggregate cleanup after the child explicitly reports failed daemon cleanup.
No runtime action is admitted while this finding remains unresolved.

## Required fixes

### Issue 1 — incomplete child cleanup can be reported as complete by the outer receipt

- Type: Bug
- Severity: P1
- Basis: acceptance-criterion; complete and truthful aggregate cleanup is required.
- Disposition: fix-now
- Reopens Current Mission: yes
- Location: `fixtures/run_npm_same_job.py`, child receipt handling and final cleanup aggregation.
- Description: the owner sets `child_uncertain` from the child’s
  `cleanup.mutationOutcomeUncertain` only. A well-formed child receipt can report
  `completed: false`, `mutationOutcomeUncertain: false`, and `failures: ["image"]` after a
  known image-removal failure. The npm acceptance check rejects that result, but the owner can
  subsequently report top-level `cleanup.completed: true` and `uncertain: false` after removing
  only its filesystem paths. A nested child failure does not make that aggregate claim true.
- Impact: composite PASS is prevented, but the top-level receipt can falsely claim complete
  cleanup while an owned image or container remains. This violates the approved cleanup contract.
- Suggested Fix: retain separate owner-path and child cleanup facts and aggregate incomplete,
  failed or uncertain child cleanup conservatively. Freeze a focused independent inert regression
  before the correction; preserve the first failure rather than replacing it with a later one.

## Accepted risks

None. Docker storage admission is an explicitly bounded conservative model, not an accepted
exception or claim of independently measured backend physical allocation.

## Optional improvements

None requested.

## Risks and verified boundaries

The three pure predicates are import-side-effect-free and enforce the declared closed record
contracts. The new owner uses hash-checked historical helper definitions without calling or
rewriting an old main. All named original controllers, probes, tests and raw receipts were
compared byte-for-byte with the authoritative source basis and remain unchanged.

Preparation retains one anonymous GET, zero redirects/retries, the exact official digest,
length/time bounds, full archive-table validation before member writes, exclusive cache creation,
three fixed cache-file and nine runtime checks, and completion marker last. The archive/stage
are identity-verified and released before the child phase. The installed runtime remains under
one owner through final cleanup.

The derived host controller uses existing Node22 and imports the old pure validators. Target
Node24/npm appear only in the unchanged restricted child. The empty fixture, observer-positive
exit73/reset, exact version, empty offline ci, lifecycle suppression, source/input/output checks,
policy inspection and original command/controller deadlines are retained. Docker import/create
unknown outcomes remain uncertain. Filesystem cleanup requires the acknowledged private root
and parent identity rather than recursively deleting an unpinned replacement.

Before payload writes, the controller reserves the complete inventory-derived rootfs bound,
200 MiB tar allowance, bounded data/private-root allowance, Docker reserve and independent safety
reserve under the unchanged 1,288,490,188-byte ceiling. It recomputes Docker reserve before import
and records measured owned filesystem allocation separately from image logical Size. This is
not measurement of Docker’s physical backend peak or a universal quota guarantee.

The owner narrows preparation to120 seconds and admits the next phase only with at least115
seconds remaining inside235 seconds. The original child90/cleanup10 and owner15-second allowances
are clipped to absolute deadlines. The workflow’s234-second TERM plus one-second KILL guard is
finite; a killed client cannot establish daemon cleanup. Missing or failed recording remains a
failed observation, never a basis for retry or a successful-cleanup claim.

The temporary workflow is restricted to the same-repository branch’s initial PR-opened event,
attempt1; push/synchronize/reopen/main/manual reruns skip. Temporary depth2 supplies the parent
objects required by the retained head-file/test-merge comparison. Pinned checkout credentials
remain nonpersistent; no new credential, service, paid API or security configuration is introduced.
Retire the hook and temporary depth after the first observation before merge.

Human comprehension is sufficient: the plan, test note and implementation handoff identify the
one useful question, limits, ownership, recovery and unqualified later work without requiring
private coordination history. Historical INDETERMINATE and availability records are preserved;
a successful new observation could qualify only the owned empty graph on its recorded route.

## Candidate identities and verification attribution

| Artifact | SHA-256 |
| --- | --- |
| Data contract | `fed48ffb04b65f5062849e841578b1b5c56f73376f077893f01d80848ea86cc1` |
| New Odo test | `9bdc9d9543039ab34a00f0a082710c871cb70cf90096d1b2e5c01db5ab51649d` |
| Pure module | `4c23ee0b32cac019b4d0cf3cdbfdd23c2ef66ef1cc516ff75af1c938bda228f5` |
| Python owner, original reviewed candidate | `f07b511fdf66a00b03e591119525aed5e5cf99427a74d26f4a891f5cd02f663b` |
| JS controller | `2b2cd774e58217afe1e39f5be43a3d93b2c957315f5f7a843b432b5967de4525` |
| Temporary workflow, original reviewed candidate | `06d3dd07e3bfdbc8d1b22ddb3dcc34f2ee0ca1f1904d78a8229fa4ab4d0a1e57` |

Odo freeze commit `ae87b4ba2b00a20edb1cd1812f7c140c471ae8f1` preceded producer implementation.
Scotty’s handoff reports the final focused inert runs: eight new Python methods passed in0.005s,
eleven original availability/ownership methods in0.087s, and nine original npm pure tests in
91.358292ms. These predicates/source checks do not cover the newly identified operational receipt
aggregation defect. Bashir did not duplicate those runs or execute a wrapper, target, Docker,
network request, archive acquisition or cache-path operation. Review tools read source/diffs and
hashes; only this review artifact was written. No denied or uncertain operation occurred here.
