# Candidate Confinement — Inert Existing-Route Control

Feature slug: `candidate-catalog-parity`. Current result: **PROVEN for the declared inert controls**.
The original contract below preceded execution. The broader candidate-execution gate remains
PARTIALLY_PROVEN / UNRESOLVED.
This follows the partial [boundary assessment](candidate-catalog-parity-credential-free-execution.md).
It grants no upstream package/config/build execution or production candidate-runtime authority.

## One Question And Route

Can a reviewed restricted child on the existing `quality.local` GitHub-hosted Linux route enforce
the declared synthetic filesystem, environment, process and network-namespace controls, while
leaving trusted source/output and real credentials untouched?

Base: `16162352db6fef48571fb5957aa1dca354f4e518`. Existing job 126466018194 records
`ubuntu-24.04`, image `20261101.360.1`, with declared `contents: read`. The selector remains
`ubuntu-latest`; actual image/tool identities must be recorded before the probe. Source evidence
for preinstalled Docker/compiler tools is the runner's linked
[software manifest](https://github.com/actions/runner-images/blob/ubuntu24/20261101.360/images/ubuntu/Ubuntu2404-Readme.md).
Missing capabilities stop the control without installation, image pull, service start, privilege
escalation, host substitution or fallback. No new personal VM or runner is selected.

## Threat Model And Mutation Envelope

Future candidate scripts could attempt to read environment/runner state, alter source or outputs,
contact services, or obtain broader authority. Only a reviewed inert fixture runs here. It may
access explicitly created synthetic input/output/root-write controls and an owned host canary.
Do not probe real credential stores, real tokens, other process environments, protected sessions,
host sockets or unrelated workspaces. The host wrapper uses the existing Docker daemon; the child
receives no daemon socket, other host service mount or inherited host environment.

Compile only the test owner's small C fixture with the existing compiler and static libraries.
Import a rootfs tar containing only that executable and an otherwise-writable synthetic control
file. No base image, Dockerfile execution, network download or third-party package is involved.
Bind source, compiler observations, executable/tar hashes and returned immutable image ID in evidence.

The child uses nonzero host UID/GID, read-only rootfs, all capabilities dropped, no-new-privileges,
default seccomp, private PID/IPC/cgroup namespaces, no network, two exact private bind mounts
(input read-only; output writable), fixed synthetic/default environment keys, and bounded CPU,
memory, PIDs and elapsed time. Inspect effective selected configuration before starting it.
These container-scoped reductions do not change runner, daemon or repository security settings.

Allowed source edits: this evidence record, owned C/control/offline-test files, a temporary fixture
hook in the existing local CI job, and material Project State/Ops reconciliation. Existing runtime
permissions, secrets, AQC/publication routing, accepted pins/output and production remain unchanged.
The temporary hook is retired after evidence capture; it must not activate a production sandbox.

## Controls And Required Evidence

1. [OBSERVABLE_OUTCOME] First run the same inert executable as a host-positive control on owned
   paths. Input/output and synthetic host/root/input write observations must actually succeed.
2. [SECURITY_PROPERTY / EXACT_ERROR_CONTRACT] In the child, permitted input read/output write
   succeed. Otherwise-writable input and root-control writes fail with `EROFS`; attempts on the
   explicitly owned unmounted host canary fail with `ENOENT`. Permission denial alone is insufficient
   evidence for a read-only mount. Preserve host canary/input bytes and modes after reset.
3. [SECURITY_PROPERTY / MANUAL_VERIFICATION] Check actual image, identity, exact mount/command,
   environment-key, privilege, resource and namespace configuration before start. Check own child
   PID/capability/no-new-privileges/seccomp metadata and loopback-only interface counts. No external
   connection is attempted; namespace observations are not a universal network/escape guarantee.
4. [OBSERVABLE_OUTCOME] Trusted host code parses the bounded JSON result as data, verifies output
   bytes and source binding, then removes only its owned container/image and temporary paths.
   Cleanup failure or unknown outcome prevents a passing result. No artifact is executed afterward.

An outer deadline bounds commands; cleanup has its own finite allowance. Killing a Docker CLI
alone is insufficient. The CI fixture step has a two-minute limit and is scoped to this experiment's
PR event and first run attempt. Push/main and manual reruns cannot duplicate it. Code/workflow
review precedes publication that could execute the control.

## Ownership, Allocation And Stops

LaForge owns admission; Odo authors the inert probe and offline rejection controls before producer
implementation. The existing executor implements only the control wrapper. Independent review
inspects source, actual evidence and interpretation. No model/scored trial is part of this slice.

At most one initial actual-route execution and one explicitly recorded corrective execution for a
concrete harness defect, after offline verification, are allowed. Preserve first outcomes. There
is no automatic retry or fallback. An access denial, unexpected authority/real-data exposure, missing
runtime prerequisite, cleanup uncertainty, source drift or resource ceiling stops new execution.
The private admission binds the shared allocation and exact source/test/runtime selectors.

## Interpretation And Reintegration

Classify the reached result PROVEN, DISPROVEN, PARTIALLY_PROVEN or INDETERMINATE, separately from
readiness. Retain this fixture as `DO_NOT_COPY` evidence, not a generic candidate executor.
Selecting this limited inert mechanism is a reviewed experiment decision; production runtime,
Node/dependency compatibility, post-merge candidate confinement and actual upstream execution
remain separate unproven decisions. No host/kernel escape resistance, secret absence, website
parity, measured benefit or whole Mission 9/10 acceptance follows from a passing control.


## Preparation Evidence — Actual Route Still Pending

Odo froze the C probe and four offline contract tests before producer implementation. The first
producer offline run passed 4/4; the final pre-route run also passed 4/4 after main-path cleanup
and image-metadata preparation. These tests execute no compiler, Docker or network operation.
They check real argument construction plus accepting and rejecting policy/observation vectors;
they are not Linux compilation or confinement evidence.

The wrapper inspects only selected Docker metadata and environment key names. It distinguishes
three explicit configured keys from Docker's runtime `HOSTNAME` default, whose source is the
inspected fixed hostname; the actual child must independently report the four expected keys.
This follows [Docker's versioned environment construction](https://github.com/moby/moby/blob/v28.0.4/container/container.go).
The image rootfs contains only the owned binary and synthetic control; import applies known
metadata without running a Dockerfile. See [image import](https://docs.docker.com/reference/cli/docker/image/import/)
and [none networking](https://docs.docker.com/engine/network/drivers/none/).

A source-bound JSON receipt and its hash are retained in the actual job log and artifact. Failed
commands and cleanup uncertainty retain a failing step; receipt publication cannot turn them into
passes. The hook is temporary and retired before final merge after evidence capture. The reference
control has no user-supplied command or upstream execution interface.

## Independent Pre-Execution Review

Pre-execution readiness: FAIL — one bounded required correction. No actual-route compilation,
Docker control, hosted confinement result or upstream execution is established by this review.
Reviewed source candidate: `7783c835302eb5ea6f03827ac2b0a9532c061bd4`.

### Required correction — uncertain daemon operation is not completed cleanup

- Type: Risk / evidence correctness
- Severity: P2
- Basis: acceptance-criterion; cleanup uncertainty must remain explicit
- Disposition: fix-now
- Reopens Current Mission: yes
- Location: `run-inert-confinement-control.mjs`, import/create calls and final cleanup accounting
- Description: A timed-out import/create client can leave daemon-side completion unresolved.
  Nonce-filter scans may then find no objects before that operation finishes. The current cleanup
  block nevertheless sets `cleanup.completed: true` when those scans/removals return successfully.
  Killing the CLI and observing an empty list do not establish that an in-flight daemon operation
  cannot subsequently finish.
- Impact: The overall receipt correctly remains `INDETERMINATE`, but its cleanup-completion field
  can overstate object absence after an uncertain mutating operation.
- Required fix: Track uncertain outcomes of import/create separately. Preserve that uncertainty
  in cleanup evidence and keep the result failing even if bounded nonce scans find nothing.
  Do not add retries, broad Docker discovery, unbounded waits or unrelated object cleanup.

The reviewed C probe and independent offline controls match their pre-producer recorded hashes.
The retained first/final producer offline runs each passed 4/4; no tests were rerun by this reviewer.
Argument construction fixes the inert command/image, nonzero identity, exact owned mounts and
resource/security settings. The wrapper checks selected effective policy before start and uses
positive/read-only/absent-canary controls with exact errors, source/output binding and finite cleanup.
The C source is consistent with the stated Linux probe; actual compiler/static-library support,
Docker metadata behavior and runtime observations remain unproven until the admitted route runs.
The temporary PR-only hook and failing receipt/artifact handling introduce no upstream executor.
Retire that hook before final merge and retain all first outcomes. No broader host, kernel escape,
secret-absence or production-runtime claim follows from source or offline validation.

### Pre-execution cleanup delta and final readiness

Final pre-execution readiness: PASS for `8fafa431f0f8e4a7dc619b65ab91c78a4100f0ea` only.
The original FAIL/P2 above remains the initial finding. Intermediate candidate
`8a398265507cb81f63189ee8006b9d5785b4ee11` fixed Node timeout/signal/buffer errors but left nonzero integer
Docker exits outside its uncertainty flag. A lost daemon response/connection can also make the
Docker client exit nonzero, so that candidate did not fully resolve the finding and is not passed.

The final one-line correction conservatively marks every failed import/create call uncertain,
except a positively known failure to start the client itself (`ENOENT`/`EACCES`). This flag survives
empty nonce scans, adds the explicit unknown-outcome cleanup failure and keeps `cleanup.completed`
false and the overall result `INDETERMINATE`. No retry, extra probe, unbounded wait or broader
cleanup was added. The P2 is resolved in this final source.

Reviewed wrapper SHA-256: `96641999b796c8d2cb14385b6db523747dc08291e5e3bc372a18a1d4abafa158`.
The independently authored C probe and offline tests retain their original hashes. The retained
post-correction offline run passed 4/4; these helper tests are not daemon-failure or Linux runtime
observations. This reviewer inspected code and logs without rerunning them. The earlier source
review remains applicable outside this narrow delta; no blocking pre-execution finding remains.

This PASS covers preparation for the admitted owned inert control, not successful compilation,
Docker policy behavior, actual confinement, credential absence or upstream execution. Actual-route
results must retain their first failure/unknown and exact source/runtime bindings. Preserve the
bounded admission and temporary-hook retirement requirements above; no production candidate
runtime or upstream execution is authorized by this review. Before publication, bind the final
source revision after adding this review and preserve the reviewed wrapper/probe/test/workflow
hashes. All earlier candidate-specific judgments remain attributed to their named revisions.


## Actual Existing-Route Result — 2026-11-04

Result: **PROVEN**, limited to the controls below on this observed runtime. Independent readiness
review is separate from runtime evidence. No upstream package/config/build code was admitted.

- Source head: `b8d42e0ea137cd8ef113b56ed2b705b0277ea258`; actual checkout/test-merge commit:
  `f642b1b5719e9337416c3e8d8670c88f6eb1623f`.
- Actual job: [41803007186 / Local quality checks](https://github.com/jnicholas000/basic-plugin/actions/runs/41803007186/job/126483108990),
  first attempt. Its inert step and receipt upload passed. The same-head push run
  [41802963122](https://github.com/jnicholas000/basic-plugin/actions/runs/41802963122) skipped both
  fixture steps. One host-positive and one contained process ran; no corrective actual-route run.
- Actual runtime: `ubuntu24`, image `20261026.354.1`, Node `v22.23.4`, Ubuntu GCC `13.3.0`,
  Docker client/server `28.0.4`. This differs from the earlier orientation job's image version.
  The contract admitted the existing selector and resolved actual metadata before the probe;
  no same-image, cross-host or comparative-runtime qualification is claimed.

| Observation | Host positive | Restricted child |
| --- | --- | --- |
| Allowed input read and output write/readback | Succeeded | Succeeded |
| Input and root-control write | Succeeded before reset | Both `EROFS` (30) |
| Owned host canary read and write | Succeeded before reset | Both `ENOENT` (2) |
| UID/GID | 1001 / 1001 | 1001 / 1001 |
| PID / capability sets | Host process; metadata retained | PID 1; effective/permitted/inheritable all zero |
| No-new-privileges / seccomp mode | 0 / 0 | 1 / 2 |
| Synthetic host environment key | Present | Absent; only four expected runtime key names |
| Interfaces / non-loopback count | 4 / 3 | 1 / 0; no external connection attempted |

Before start, selected effective metadata matched the immutable owned image, fixed inert command,
nonzero identity, read-only root, exact input/output bind mounts, private namespaces, no network,
all dropped capabilities, no-new-privileges and the fixed resource bounds. Three explicitly
configured environment keys plus the inspected hostname's Docker default corresponded to the
four keys actually observed by the child. No environment secret value was read or logged.

Trusted host verification observed the exact output bytes, unchanged synthetic input/canary
content and modes after reset, and all 110 tracked source files unchanged. The receipt reports
owned container/image/files cleanup complete, no mutation uncertainty and no cleanup failure.
The control took 1,965 ms; this is an operational duration, not a benefit/performance metric.
The compiler, binary, tar, image ID, source and wrapper bindings are in the retained receipt.
No image pull, software installation, new host, security-setting change or real credential probe
was performed by the fixture.

The exact log-carried JSON plus LF matches the CI file checksum:
`33aad7eff991f79f998d7f1b27d06ddeeec4a4d465f61819fcf3e3dca3ef3f41`.
It binds the frozen probe SHA-256
`0e00828bc4a3c1424bba6fd512393b93bf5369526139766947bfc2e5b78cd592` and reviewed wrapper
`96641999b796c8d2cb14385b6db523747dc08291e5e3bc372a18a1d4abafa158`.
Artifact `inert-confinement-f642b1b5719e9337416c3e8d8670c88f6eb1623f` has ID `13308950515`;
its archive digest is separately
`08d257deced5f23139b6dae355751d0ccf0be7e1c0ed1fb81afde7453e0b5c23`.
The archive was not downloaded for this assessment; receipt content came from the supported job
log, checked against the separate raw-file checksum. These two digests are not interchangeable.

### Disposition And Remaining Boundary

Retain the control as `DO_NOT_COPY` evidence. The temporary hook is retired before further
publication; final CI must validate that later revision without repeating the inert execution.
The original cleanup-review FAIL and its pre-execution corrections remain retained.

`SOURCE_SPECIFIED / ALIGNED`: the selected inert restrictions are supported by reached actual-route
observations, with separate producer, test-author and reviewer attribution. The observations do not
prove universal credential absence, shared-kernel escape resistance or adversarial host isolation.

`IMPLEMENTATION_DETAIL / NEW_ARCHITECTURAL_DECISION`: a production candidate runtime and dependency
preparation strategy remain unselected. Review the Node/dependency inputs, allowed outputs and
post-merge use of the same boundary before any upstream execution. The static probe is not that
runtime, and its successful control cannot authorize arbitrary commands or install scripts.
The broader execution spike stays PARTIALLY_PROVEN / UNRESOLVED. Production, the throwing guard,
accepted pins/output, inactive candidate integration and disabled baseline advancement remain intact.
No website parity, measured benefit or whole Mission 9/10 acceptance follows.

### Independent post-execution readiness review

Result: PASS for evidence candidate `758b3722354c6d302854eadcf4445be6caa6b14e` and its
bounded interpretation. The earlier pre-execution FAILs and candidate-specific corrections remain
unchanged. The initial NOT_EXECUTED contract describes the pre-execution state; the dated actual
result above establishes only the reached inert controls.

Independently checked the saved raw JSON checksum, probe/wrapper/test source bindings, actual
head/test-merge references, positive and precise denied controls, output hash and cleanup fields.
The raw-file checksum agrees with the supported-log checksum supplied by the coordinator; artifact
archive metadata is separate and no archive download or new CI query was performed by this reviewer.
Actual execution/attempt and push-step exclusion evidence comes from the retained coordinator
verification and trusted handoff. No independent rerun or broader execution-count attestation is
claimed. The actual runtime differs from orientation and is correctly identified without parity claims.

The final workflow matches the original pre-hook bytes, so later publication does not repeat the
control. Reviewed control sources remain unchanged and all 104 existing files outside the two
intended state/evidence edits retain their baseline hashes. Source and conditional Ops explanations
preserve history, portfolio settings and the distinction between limited reached observations and
production qualification. Ops candidate `5a8026b72cdec6090665fe0f22944de508b88a92` may publish
only after actual clean source merge, passing main checks and matching linked source facts.

No blocking finding remains. The aggregate production execution gate remains PARTIALLY_PROVEN /
UNRESOLVED: Node/dependency preparation, allowed-output handling, post-merge candidate execution
and website parity are not qualified. No credential-absence, kernel-escape, measured-benefit or full
Mission 9/10 claim follows. This reviewer launched no tests, compiler, containers, models or hosted
jobs. Bind the final source revision after this review-only addition before publication.
