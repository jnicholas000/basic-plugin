# Candidate Confinement — Inert Existing-Route Control

Feature slug: `candidate-catalog-parity`. Status: **CONTRACT; NOT_EXECUTED**.
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
