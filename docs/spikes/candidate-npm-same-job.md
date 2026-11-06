# Owned npm test with same-job pinned preparation

Mission slug: `candidate-catalog-parity`. Date: 2026-11-06.
Current state: **FIRST ACTION INDETERMINATE; HOOK RETIRED; NO RETRY**.
See the [observed result](candidate-npm-same-job-result.md). The prospective contract below
is retained as the basis of the sole action; its original freeze is commit
`ae87b4ba2b00a20edb1cd1812f7c140c471ae8f1`. It does not authorize another execution.
Source basis: `c85869d2fd2742ad2360665f06023fb99e02a4da`.
Branch: `feat/owned-npm-same-job-20261106`.

Data read the installed Starfleet Crew 0.2.0 Data role, core principles and applicable
risk-resolution/domain-pattern procedures. This is a bounded spike contract, not production
architecture. Odo owns new tests before Scotty; Bashir owns independent readiness and result review.

## Goal and basis

Can the exact Node 24.22.1/npm 11.19.1 distribution, freshly supplied in this same existing
Linux CI job, complete the already-owned startup/version and empty-graph offline `ci` control
inside the previously selected restricted child?

Owner approval on 2026-11-06 covers this separately reviewed bounded test with the verified
runtime and inert fixture. It does not authorize actual candidate dependencies, upstream package,
configuration or build code, browser work, publication, runtime substitution or automatic retry.
The [original npm contract](candidate-npm-preparation.md), its first INDETERMINATE ENOENT result,
[metadata diagnosis](candidate-npm-prerequisite-metadata.md), and subsequent separate
[availability proof](candidate-pinned-runtime-availability.md) remain historical evidence.
This new attempt is separately named and recorded; no old receipt is edited or promoted.

Existing stack only: trusted Python standard library for preparation/ownership and existing host
Node 22 for reviewed orchestration. Target Node 24/npm execute only inside the restricted child.
No installation of new host tooling, external framework, image pull, service start, credentials,
security-setting change, Simulator or other host. Mac is accepted; this experiment uses the
already selected `quality.local` Linux runner. Existing ordinary CI remains separate.

## Fixed inputs and unchanged control

Reuse the exact URL, archive SHA-256, three cache-file hashes, nine runtime records and complete
archive-table validation from the availability action. One anonymous GET, zero retries, redirects,
resume, mirrors or fallback; numeric Content-Length <=96 MiB and network <=60 seconds; body length
and SHA-256 before member writes. Cache and marker must be absent before exclusive creation.
Seven unique canonical system-library hashes/lengths must pass before transfer. Preserve both
loader destination labels. No chmod/chown of preexisting paths, sudo, PATH mutation or persistence.

Preserve these original files byte-for-byte:

- `run-npm-preparation-control.mjs` and its nine pure tests;
- `npm-preparation-probe.mjs` and `npm-lifecycle-observer.mjs`;
- `run_pinned_runtime_availability.py`, `pinned_runtime_availability.py` and existing tests;
- all original raw receipts and accepted production pins/output/throwing guard.

The prior npm probe remains the only PID1 test: observer-positive exit73/marker/reset, exact npm
11.19.1 version, then `ci --json` on the exact empty v3 lock and private manifest. Keep its literal
flags, four synthetic child environment values, empty isolated config, lifecycle suppression,
stale-entry removal, unchanged manifest/lock and no installed package payload. No arbitrary command,
registry contact, npm config dump, npx, rebuild or run/start/test script is admitted.

Reuse exact runtime/npm inventory validators and container policy. Root read-only, no network,
nonzero identity, ALL capabilities dropped, no-new-privileges, default seccomp, private namespaces,
32 PIDs, 128 MiB and one CPU; only owned input read-only/output writable mounts. Inspect effective
policy before start; no repeat host-positive/credential/network/security probes. Unknown Docker
import/create outcome remains uncertainty even after empty nonce-filter scans.

## Minimal composition and ownership

Do not execute an old main under spoofed branch/environment. Add a clearly marked derived
same-job Python owner and a derived npm host-controller module with new exact bindings. Importing
original helpers/pure validators is permitted; rewriting/evaluating old source text at runtime,
monkey-patching its admission or executing the old main is not. No generic runner API is needed.

One owner keeps exclusive creation identities and pending-mutation uncertainty through all phases:

1. Verify self/module/test/original-evidence hashes, same-repository PR-opened event, exact branch,
   attempt1, base/head/test-merge parents, source cleanliness, runner/runtime prerequisites and
   fresh resource admission. Preserve native Git bindings; no implicit fetch or old-branch spoof.
2. Perform bounded preparation, verify the three installed cache files and nine records, create
   the empty completion marker last. Release only identity-verified owned archive/stage resources
   before starting the npm phase. Any failed release stops before target execution.
3. With existing host Node22, run the derived controller once. Inventory/prune/copy exactly the
   old allowed npm tree and nine runtime destinations into a fresh owned rootfs; bounded full npm
   inventory is retained as data. Build only the owned tar, inspect imported image and fixed child
   policy, then invoke the unchanged probe. No target invocation on the host.
4. The child controller retains its original 90-second absolute deadline and 10-second independent
   cleanup allowance. Commands <=10 seconds, observer <=5 seconds and npm children <=10 seconds,
   each clipped to the remaining deadline. The aggregate Docker start/attach call remains <=10 seconds;
   the separate probe child caps do not grant a 25-second attachment. No timeout/memory expansion
   or corrective rerun.
5. Always run finite child-container/image/temp cleanup, then owner cache/marker/version-parent
   cleanup. Remove only acknowledged owned objects/paths; retain uncertainty. Persist bounded
   inert evidence separately. No installed runtime or temporary hook survives final merge.

The new Python owner may derive the old installer body and reuse its guarded ownership/hash/archive
helpers. The new JS controller may derive the old orchestration body and import its pure exported
validators. Source differences must be reviewable; new branch/output/admission bindings are explicit.
Scotty must repair lost creation acknowledgements if found in touched derived paths; no blanket
recursive deletion of an unpinned replacement is allowed. An acknowledged private root plus stable
identity/ancestor checks is required before removing its contents.

## Time and aggregate disk admission

Use one CI step <=4 minutes. Narrow preparation collection to <=120 seconds (inside the prior
180-second ceiling); the network remains <=60 seconds. Child90 + child cleanup10 + owner cleanup15
remain unchanged. A monotonic overall deadline <=235 seconds includes all phases and cleanup;
preparation cannot consume time reserved for those later fixed allowances. An exhausted budget
stops and cleans up, rather than starting an under-budgeted child. No idle phase handoff or PTY.
An outer watchdog preserves five seconds before the four-minute CI limit; killing a host client
alone never establishes daemon cleanup. First failure remains recorded.

The original **1,288,490,188-byte whole-action peak ceiling** is unchanged. Preparation retains its
prior complete-table bound and st_blocks accounting on supported <=4096-byte allocation units.
Before any npm rootfs writes, reserve the additional phase footprint; before import, recompute
from actual accepted inventory/tar and stop if the ceiling cannot be met. At each overlap checkpoint:

`measured live owned filesystem allocation + remaining admitted filesystem writes + Docker reserve
 + 16 MiB safety reserve <= 1,288,490,188`.

Compute rootfs file allocation as sum(max(4096, ceil(size/4096)*4096)), plus 4096 per directory and
4096 per record for allocation overhead; add the small exact owned fixture/config files. Rootfs tar
is <=200 MiB as before. Reserve at least **twice the bounded rootfs tar length plus16 MiB** for
Docker import/image storage and metadata before import; the safety16 MiB above is additional.
Count the actual tar separately. No claim that Docker image logical size equals physical allocation.
Record measured owned filesystem peak and reserved Docker allowance as different quantities.
Inspect image logical size <=tar bound only as supplementary evidence. If source/runner accounting
cannot support this conservative admitted bound, stop before import; do not read protected daemon
storage, provision another host or silently enlarge the ceiling. Releasing verified rootfs files
once the tar is complete is allowed and should reduce overlap; source/runtime tar hashes remain.

The reserve is a prospective conservative admission bound for this one empty image, not an
independently measured Docker backend physical peak or universal quota guarantee. Bashir must
review whether the implementation actually upholds the admitted bound on the available route.
No new benchmark or host qualification is implied. Missing supported accounting is a named blocker.

## Odo contract before implementation

Odo owns `fixtures/test_npm_same_job.py` and `candidate-npm-same-job-odo-test.md`; may add a small
JS pure test only if needed for an actual derived controller seam. Do not modify old fixtures/tests.
Use inert dictionaries/fake ownership and command results; no archive acquisition, cache I/O,
Docker, target Node/npm or subprocess execution by offline tests.

New pure module `fixtures/npm_same_job.py` exposes:

- `validate_same_job_policy(policy) -> True`: closed dict fields `archive_url`, `archive_sha256`,
  `branch`, `download_bytes`, `network_seconds`, `preparation_seconds`, `child_seconds`,
  `child_cleanup_seconds`, `owner_cleanup_seconds`, `overall_seconds`, `step_seconds`,
  `max_peak_bytes`, `retries`, `redirects`, `target_on_host`, `upstream_execution`.
  Exact values are the fixed source/digest/branch above; 100663296,60,120,90,10,15,235,240,
  1288490188,0,0,False,False respectively. Reject missing/extra keys, booleans-as-numbers and drift.
- `validate_phase_admission(phase) -> True`: closed dict fields `cache_verified`, `archive_released`,
  `stage_released`, `ownership_uncertain`, `filesystem_live_bytes`, `filesystem_remaining_bytes`,
  `tar_bytes`, `docker_reserve_bytes`, `remaining_ms`. The first three must be True and uncertainty
  False. Nonnegative integer byte fields (not booleans); tar<=209715200; docker reserve>=2*tar+16777216;
  sum(live,remaining,docker_reserve,16777216)<=1288490188. `remaining_ms` must be an integer>=115000
  before entering npm phase (90+10+15 seconds). This is a decision predicate, not measured I/O proof.
- `validate_same_job_evidence(evidence) -> True`: closed dict fields `preparation_verified`,
  `npm_verified`, `source_unchanged`, `target_only_in_child`, `network_gets`, `retries`,
  `peak_admitted_bytes`, `cleanup`. The four facts True, gets1/retries0, integer admitted peak
  <=1288490188, `cleanup` exactly `{completed: True, uncertain: False, remaining_owned_paths: []}`.
  The wrapper may supply these facts only after original pure validators and actual checks pass.

All three functions preserve inputs, are import-side-effect-free and throw ValueError on rejection.
Odo freezes accepting/independent failing vectors before producer. Add a narrow fake-I/O or AST
regression for phase ordering and interruption-before-ownership-acknowledgement if the derived
controller exposes such a seam. Static ordering/source checks must be labelled static, not runtime
proof. New policy/evidence predicates alone do not prove acquisition order or actual cleanup.

## Acceptance, evidence and verification budget

- [SECURITY_PROPERTY / MANUAL_VERIFICATION] New adapters retain all original restrictions and
  explicit honest source/branch bindings; unchanged original hashes/probes/tests verified before
  launch. Independent Bashir source review covers operational ordering and cleanup uncertainty.
- [QUANTITATIVE_THRESHOLD] All pinned archive/cache/runtime records match; npm inventory within
  original bounds; source-bound byte/time/disk admission passes with one GET and zero retries.
- [STATE_TRANSITION / OBSERVABLE_OUTCOME] One actual child observation reaches observer positive
  and reset, exact version and successful empty offline ci with unchanged input and no lifecycle
  marker/package payload; do not call unobserved stages passed.
- [EXACT_ERROR_CONTRACT] Odo rejection vectors cover changed budgets/identities, pre-phase release,
  aggregate overlap/deadline insufficiency, false cleanup and uncertainty. Reuse original nine npm
  tests and existing eleven availability/ownership tests without rewriting them; execute relevant
  focused suites after final implementation, not repeated ceremonial broad runs.
- [OBSERVABLE_OUTCOME / MANUAL_VERIFICATION] Bounded raw receipt/full npm inventory/artifact binds
  reviewed code/tests, original evidence, full base/head/test-merge and run attempt. Independent
  post-run result review checks actual observations and complete cleanup before interpretation.

Any preparation-only `target_executed: false` describes that phase only; the composite must
record the actual target invocation when it occurs. Receipt starts INDETERMINATE; only verified preparation, original npm observation validation,
source preservation and both complete cleanups permit `NPM11_SAME_JOB_OWNED_CONTROL_PASSED`.
Keep first failure/stage/exit/signal/OOM/timeout and unknown daemon mutations; no retry. Receipt
<=64 KiB; existing full npm inventory<=4 MiB and archive manifest<=2 MiB are inert retained data,
seven-day retention. Upload no archive, installed code or executable cache. Preserve old evidence.

## Handoff, decision provenance and exit

LaForge routes Odo freeze, then Scotty implementation of only the new pure module and two derived
wrappers, then focused offline tests and independent Bashir review. Coordinator alone adds the
one-use exact-event CI hook after admission and retires it after first result before merge.
Update PROJECT and this record with reached evidence; Basic Plugin-only Ops mirror follows source.
No production preparation API or actual package/build execution follows from this gate.

The fixed route/runtime/fixtures/limits and newly approved owned npm execution are
SOURCE_SPECIFIED / ALIGNED. Explicit same-job ownership and staged release are
DERIVED_NO_ARCHITECTURE_CHANGE / ALIGNED. Exact local helper organization is IMPLEMENTATION_DETAIL /
ALIGNED. No new adopted architecture is selected. Risk gate remains SPIKE_REQUIRED for candidate
execution; this artifact is the separately authorized bounded spike, not a claim that risk is clear.

Stop for byte/source drift, absent prerequisites, denial, real-data exposure, unsupported accounting,
limit, child failure or cleanup uncertainty. A successful observation qualifies only this owned
empty graph on its recorded route. Nonempty dependencies, upstream code, browser/site parity,
pre/post-merge production handling and full Missions9/10 remain outside its evidence.
