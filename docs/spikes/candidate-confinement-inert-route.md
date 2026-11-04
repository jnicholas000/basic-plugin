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
