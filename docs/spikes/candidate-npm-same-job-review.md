# Owned npm same-job control — independent Bashir review

Mission slug: `candidate-catalog-parity`. Date: 2026-11-06.
Initial review boundary: readiness for one separately authorized, source-bound owned empty-graph
observation. That original pre-execution review established no actual preparation or runtime result;
the separate post-result review below addresses the subsequently recorded action.

**Current disposition: PASS for truthful evidence closeout; runtime qualification INDETERMINATE.**
The sole action is consumed and the temporary hook is retired. Historical pre-execution FAIL/PASS
judgments below remain evidence, not current authority or readiness for another action. The
post-result review at the end records reached observations and the next blocked runtime boundary.

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

The derived host controller uses existing Node 22 and imports the old pure validators. Target
Node 24/npm appear only in the unchanged restricted child. The empty fixture, observer-positive
exit 73/reset, exact version, empty offline ci, lifecycle suppression, source/input/output checks,
policy inspection and original command/controller deadlines are retained. Docker import/create
unknown outcomes remain uncertain. Filesystem cleanup requires the acknowledged private root
and parent identity rather than recursively deleting an unpinned replacement.

Before payload writes, the controller reserves the complete inventory-derived rootfs bound,
200 MiB tar allowance, bounded data/private-root allowance, Docker reserve and independent safety
reserve under the unchanged 1,288,490,188-byte ceiling. It recomputes Docker reserve before import
and records measured owned filesystem allocation separately from image logical Size. This is
not measurement of Docker’s physical backend peak or a universal quota guarantee.

The owner narrows preparation to 120 seconds and admits the next phase only with at least115
seconds remaining inside235 seconds. The original child 90/cleanup 10 and owner15-second allowances
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
Scotty’s handoff reports the final focused inert runs: eight new Python methods passed in 0.005s,
eleven original availability/ownership methods in 0.087s, and nine original npm pure tests in
91.358292ms. These predicates/source checks do not cover the newly identified operational receipt
aggregation defect. Bashir did not duplicate those runs or execute a wrapper, target, Docker,
network request, archive acquisition or cache-path operation. Review tools read source/diffs and
hashes; only this review artifact was written. No denied or uncertain operation occurred here.

## Final delta review — P1 resolved, readiness PASS

Result: **PASS — READY for one bounded first-open observation after exact coordinator admission**.
Actual runtime qualification: **NOT EXECUTED**.

Summary: the correction resolves the sole P1 without changing runtime, fixture, policy, time,
disk or retry controls. Bashir independently inspected the actual repair diff and frozen Odo
regression, checked the changed source/workflow hashes and retained the previously valid full
review. No blocking current-mission issue remains. The source and workflow are ready only for
the approved single observation; they do not establish its result or waive final CI/review gates.

Issue1 resolution: the owner now checks the entire child cleanup record before any subsequent
binding validation can throw. It requires exactly the three expected keys, strict successful
boolean values and an empty actual list of failures, and ORs the result with prior transport
uncertainty. Failed, missing, malformed or previously unknown cleanup cannot acknowledge daemon
cleanup. The owner retains its actual filesystem result separately as `outer_path_cleanup`;
aggregate cleanup remains incomplete/uncertain whenever child cleanup was not acknowledged.
The original first failure and child receipt remain available rather than being rewritten.

Independent Odo regression commit `5a22ef30e76e03f44a6475987b8da548fd82e5df` preceded the producer
correction. Its four methods AST-extract only the real uncertainty assignment into an inert
namespace. The original candidate reproduced twelve failing subcases, including known image/
container failure and malformed records, while successful acknowledgement and prior uncertainty
controls passed. This is direct in-memory behavior evidence for the repaired decision predicate,
not a claim of Docker failure injection or end-to-end daemon cleanup. The final attributed
Scotty run reports 12/12 affected methods passing in 0.007s (four regression plus eight pure methods).
The old eleven availability/ownership and nine npm pure tests were not rerun because their
source and dependencies remain unchanged. Bashir did not duplicate these runs.

Final exact identities:

| Artifact | SHA-256 |
| --- | --- |
| Python owner, corrected | `f066e2bea2569af601a04edf6458e32ff4f49e3d2ab21a711f0a03db1e0b9bef` |
| Cleanup regression | `1d754c29bb19fad671c953d8ead2c9f227bd0bd20b5d7575a3159cdc574a9399` |
| Temporary workflow, corrected owner pin and regression invocation | `b26b286ec6208d038d829e25e2b3fa0f7a60653c816115b3355c9c77754882a3` |
| Pure module, unchanged | `4c23ee0b32cac019b4d0cf3cdbfdd23c2ef66ef1cc516ff75af1c938bda228f5` |
| JS controller, unchanged | `2b2cd774e58217afe1e39f5be43a3d93b2c957315f5f7a843b432b5967de4525` |

Required Fixes: none for this reviewed pre-execution boundary. The initial P1 is resolved,
not accepted as residual risk. Accepted Risks: none. Optional Improvements: none requested.
Risks: native execution, full actual inventories, npm observations, runtime/source preservation
and both actual cleanup outcomes remain unobserved. Coordinator fresh resource/source admission,
revision-matched Viewscreen/PR explanation review, one actual observation, independent result
review and temporary-hook retirement remain planned follow-through. Any failed or missing first
result stays failed/inconclusive and does not authorize a retry. The conservative Docker reserve
limitation described above remains explicit; no physical backend peak is claimed measured.

Bashir changed only this review artifact. No implementation, workflow, tests, Git state,
controller, archive, cache, target runtime, Docker object or credential was mutated or executed.

## Independent post-result review — sole action INDETERMINATE

Result: **PASS for the truthful bounded evidence closeout and normal final-head merge checks**.
Actual npm qualification: **INDETERMINATE / NOT QUALIFIED**.
Readiness for another actual action: **BLOCKED; no retry is authorized by this record**.

Summary: Bashir independently read the actual raw receipt, complete npm inventory and archive
manifest; validated their exact lengths/digests and every npm inventory record against the pinned
archive manifest; and compared the result note, PROJECT reconciliation, raw repository receipt
and retired workflow with those observations. The completed action reached preparation, inventory,
image import and effective policy inspection, then stopped at a failed container start. The result
is preserved honestly and is not a passing npm observation. The current increment may retain this
failed experimental code as inactive evidence; it is not approved for reuse or another execution.

### Actual evidence checked

- Run `42144112796`, local job `127651328909`, attempt1, records reviewed head
  `3cca93ea5991ad931b5c47b55896490d14d176c9`, base
  `c85869d2fd2742ad2360665f06023fb99e02a4da`, and checkout/test-merge
  `5928c1753d6e53ecd950c36f2aaf9a992062c618`. The coordinator separately corroborated native
  checkout and ordered GitHub Git-commit parents; this reviewer does not call image labels
  independent host attestation.
- Raw first receipt is 15,891 bytes, SHA-256
  `debb5ad9d1928acac90f463663770f9da7e1c12689bad215f3dea7742010b091`.
  The proposed repository receipt is byte-identical. Full npm inventory is 321,518 bytes,
  SHA-256 `200df0fcd7713a81a653aa7d160177ce2b0dda476c85df59b6d5dbb679191599`.
  Full archive manifest is 1,113,992 bytes, SHA-256
  `a51be53c3f8023e063e4cb34148a3392e9845f83e7cabb55679241f172161e62`.
- A bounded actual-data validator checked all 1,635 sorted unique npm records and their
  9,525,769 aggregate file bytes, allowed relative paths, regular-file/single-link facts and
  matching path/size/SHA-256 in the archive manifest. This checks retained evidence consistency;
  it does not execute package code or independently audit all bundled dependency behavior.
  Both nested child receipt copies are identical.
- Receipt reports one anonymous official GET, zero retries, 58,290,700 bytes and the exact
  approved archive digest. Three installed cache files and nine runtime records matched before
  the child. The accepted inventory reports 439 directories and absent built-in config.
- Preparation reports 53,830.612606 ms and 148 tracked source files unchanged before the child.
  The post-child source/runtime-preservation stage was **NOT REACHED**. That earlier source
  observation cannot be upgraded to a final whole-action preservation check.
- Effective container policy is recorded after image import and before the single start attempt:
  fixed nonroot 1001:1001, network-none/read-only/resource/namespace/mount and entrypoint values.
  The start command returned exit 1 with zero stdout, 265 stderr bytes, no signal or timeout.
  Container state is exit 126, not running, not OOM-killed. Raw native diagnostic text and a
  contained probe result are absent. `INVOCATION_ATTEMPTED_IN_CHILD` identifies only the attempt;
  it is not affirmative proof that target Node 24, the observer or npm actually ran.
- Observer-positive/reset, target/runtime version, npm version, empty ci, lifecycle suppression,
  output acceptance and final source/runtime checks are unobserved. npm 11.19.1 remains manifest
  metadata in this result. No candidate dependencies or upstream package/config/build code were
  admitted into the owned fixture.
- Child cleanup reports completed true, mutation uncertainty false and no failures. Both the
  separately retained outer-path cleanup and aggregate cleanup report completed true,
  uncertain false and no remaining owned paths. The reviewed source checks removal of its
  nonce-bound image/container/temp resources and owned cache/marker/new version parent.
  No persistent runtime follows from this same-job action.
- Total 60,291.656735 ms includes cleanup; it is not network latency. The receipt separates
  preparation-owned measured peak 495,144,960 bytes, child-owned measured filesystem peak
  293,212,160 bytes and live cache allocation218,984,448 bytes. The prospective pre-npm bound is
  1,208,840,192 bytes and npm admitted peak1,047,654,400 bytes, below the retained ceiling.
  Docker backend physical peak remains unmeasured; image logical size 142,773,979 bytes does
  not establish physical allocation. No aggregate measured-physical-peak claim is made.
- Coordinator-provided job evidence reports 26 existing Python checks plus 11 availability/
  ownership, 8 new policy, 4 cleanup-regression and 9 original npm pure tests passing. The capture
  step’s `success` API conclusion under `continue-on-error` is not a passing control: native
  exit 1 caused outcome enforcement to fail, later local build/output steps and private AQC to
  skip. New final-head ordinary checks remain required separately.
- The current workflow is byte-identical to the authoritative pre-action baseline, SHA-256
  `47fd7fc8fde1ea65d4411528a82b8ba7b9038a44353a73c1435a4fc2f5c503d0`.
  Both the temporary action hook and extra checkout depth are retired. Historical raw receipts
  and the original failed/indeterminate outcomes remain unchanged.

### Newly identified next-gate defect — rootfs directory mode inheritance

- Type: Bug
- Severity: P1 for any future runtime readiness
- Basis: acceptance-criterion; the nonroot child must be able to traverse its intended runtime.
- Disposition: defer to the explicitly named corrective gate; no active hook or reuse is approved.
- Reopens Current Mission: yes for runtime readiness; truthful failed-result closeout remains valid.
- Location: executed workflow `umask 077` and derived JS rootfs recursive directory creation.
- Description: the shell’s restrictive umask is inherited through Python and host Node 22. The
  controller asks for 0755 on nested rootfs parent creation, but does not explicitly normalize
  those new directory modes afterward. POSIX creation semantics mask them to 0700. The rootfs
  root itself is chmod 0755, but that does not fix `/runtime`, `/lib64` or nested library parents.
  The tar assigns root ownership while the child is nonroot 1001:1001, making these intended
  paths inaccessible under the source-derived modes.
- Impact: this is a concrete harness mode incompatibility consistent with exit 126. It does not
  conclusively establish the recorded exit’s cause because actual tar modes and the native start
  diagnostic were not retained. The pre-execution source review missed this interaction; its
  historical PASS must not be treated as continuing runtime readiness.
- Suggested Fix: first reproduce the boundary with an independently owned inert regression,
  then explicitly normalize and verify only newly owned rootfs directories. Preserve the workflow
  umask, nonroot policy and all other limits. Retain bounded directory-mode evidence and an
  allowlisted native startup-error classification. Independently review the corrected candidate
  before separately admitting any later acquisition/runtime action; do not rerun this attempt.

Required Fixes for evidence publication: none. This does not mark the mode defect fixed or accept
it as a runtime risk. Accepted Risks: none. Optional Improvements: none requested. The next gate
above is concrete, bounded and separate from this consumed first action. No full npm qualification,
nonempty dependency/build/site parity, production promotion or Missions9/10 completion is claimed.

Bashir used source/evidence reads and the single bounded actual-data consistency validator only;
no target, wrapper, probe, container, archive acquisition, security experiment or duplicate test
suite was executed. Only this review artifact was changed. No denied or uncertain action occurred
in this review. Normal revision-matched explanation and exact-head checks remain coordinator gates.
