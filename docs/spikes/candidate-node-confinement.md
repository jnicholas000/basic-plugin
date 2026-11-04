# Candidate Node Runtime Confinement

Feature slug: `candidate-catalog-parity`. Status: **PREPARED / ACTUAL ROUTE NOT EXECUTED**.
Base is `32f470cbc442be23ac019fe445007d89c3ad293f`; the upstream pin remains
`6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`. Production inputs and outputs stay unchanged.

## Reached Input Evidence

The candidate-only public lock proposal remains **reviewed reference, not adopted**.
Its SHA-256 is `af8096a63416dd247edde33d501caffe8e7abdd1e28a9fea521b9bb3fc5e5685`.
Independent comparison found exactly 56 `resolved` and 56 `integrity` changes; every other
parsed value, version, graph, engine and platform declaration is unchanged. Serialization may differ.

On 2026-11-04, a separately admitted local inert-data read fetched the 55 public archives serving
those 56 paths: 5,779,415 body bytes, one attempt per URL and no retries. Independent post-read
review rehashed every body against the frozen public SHA-512 and legacy SHA-1 witnesses. No
archive was extracted, installed or executed; no source lock was replaced. Private raw receipts
are retained with operation SHA-256
`0cb3068f3a1e6f30870a678e4fa6a87819cd2a7308a1a73e233695ec2800be6b`
and staging receipt SHA-256
`eeee0f1f958fb38078a93f81539eabf390541eb78b694a73d4ecbf9263c8dce2`.
These are owner-observed local bytes, not a claim that a public CI job acquired them.

Original-feed archive bytes remain unobserved. A matching legacy SHA-1 witness is weaker than
collision-resistant proof of equivalence to that feed. The other 495 public lock records have not
been acquired or qualified by this read. No package safety, lock adoption or build readiness follows.

## One Critical Question

Can the already observed Node 24.22.1 binary, with an explicitly inventoried existing loader and
shared-library closure, run an owned built-in-only fixture inside the
[observed restricted child](candidate-confinement-inert-route.md), preserving the selected
filesystem, environment, process and network controls?

The target is the existing Linux `quality.local` CI route. This selects no new VM, runner,
installation, image pull or production sandbox. Mac remains the accepted personal target.
The cached Node host result alone does not answer this confinement question.

## Frozen Inputs And Bounded Mechanism

Require the existing `/opt/hostedtoolcache/node/24.22.1/x64` entry and completion marker:

- Node binary SHA-256: `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb`.
- Version-header SHA-256: `0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad`.
- npm manifest SHA-256: `f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6`.
  Its npm 11.19.1 version/engine are data only; npm is not executed or copied into the child.

Use the existing [`readelf`](https://sourceware.org/binutils/docs/binutils/readelf.html) to inspect
ELF program headers and dynamic dependencies as data. Do not use `ldd`. Require ELF64 little-endian
x86-64, the fixed loader `/lib64/ld-linux-x86-64.so.2`, safe unique dependency names and no nonempty
RPATH/RUNPATH. Resolve dependencies only from the two explicit system-library directories, retain
their canonical sources and hashes, and copy regular bytes into the owned rootfs. Limit the closure
to 32 files and 256 MiB. Missing tools/files, unsupported metadata or source drift stop without fallback.

Only this runtime, its selected system files, the owned
[Node fixture](fixtures/node24-confinement-probe.mjs) and a synthetic root-write control enter the
rootfs. Import it without a Dockerfile or base image. The fixed entrypoint is
`/runtime/node --max-old-space-size=32 /probe.mjs`; the
[heap option](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib) caps V8 old space,
not total process memory. Runtime compatibility with that invocation still needs the actual result.

Keep the earlier selected policy: nonzero host UID/GID, read-only root, network `none`, all capabilities
dropped, no-new-privileges, default seccomp, private PID/IPC/cgroup namespaces, 32 PIDs, 128 MiB and one
CPU. Mount only owned input read-only and output writable. Pass only `HOME`, `PATH`, synthetic
`FIXTURE_VISIBLE` and Docker's fixed `HOSTNAME`. Inherited host environment, daemon socket, credentials,
candidate files, package archives and npm modules are not mounted.

## Required Controls And Stops

1. **OBSERVABLE_OUTCOME:** the same fixed runtime/probe first reads/writes owned host-positive
   controls successfully. Reset their bytes and remove the positive output before containment.
2. **SECURITY_PROPERTY / EXACT_ERROR_CONTRACT:** child input read and output write succeed;
   otherwise-writable input/root writes fail `EROFS` (30), and the explicitly owned unmounted
   host canary fails `ENOENT` (2). No real credential or unrelated host path is probed.
3. **MANUAL_VERIFICATION:** inspect image identity, exact entrypoint/command, selected effective
   policy and mounts before start. The child reports its own PID1, UID/GID, zero capability masks,
   no-new-privileges, seccomp, environment key names and loopback-only interface counts.
4. **STATE_TRANSITION / QUANTITATIVE_THRESHOLD:** source/control bytes and modes remain unchanged;
   trusted parsing validates output; owned image/container/temp cleanup completes. The controller
   uses a 90-second monotonic deadline plus ten seconds for cleanup and finite command limits.

The temporary existing-job hook is restricted to this same-repository branch's initial PR-opened
event and first run attempt. Push, synchronize, reopen, main and manual reruns cannot repeat it.
Retire the hook before final merge. Independent code review and fresh resource admission precede
publication that can execute it. Preserve the first outcome. At most one separately recorded
corrective execution may follow a concrete offline-reproduced harness defect and independent review;
there is no automatic retry, permission change or runtime fallback. Access denial, real-data exposure,
unknown Docker mutation/cleanup, drift or the admitted resource boundary stops execution.

## Interpretation And Remaining Boundary

Five independently authored pure tests cover ELF metadata and policy construction/rejection; they
do not execute Docker, `readelf` or the Linux probe. Actual runtime closure and containment remain
unproven until the admitted CI observation. Host image labels are metadata, not attestation.

`SOURCE_SPECIFIED / ALIGNED`: retain the fixed runtime, accepted source and historical evidence.
`IMPLEMENTATION_DETAIL / NEW_ARCHITECTURAL_DECISION`: the minimal rootfs is a controlled experiment,
not an adopted production runtime. Return its actual evidence to planning before production handoff.

No host/kernel escape resistance, universal credential absence, npm CLI/dependency/native compatibility,
candidate build/browser parity, pre/post-merge candidate execution or whole Mission 9/10 acceptance is
established here. npm startup and any package preparation remain separate reviewed gates.

## Independent Pre-execution Review

Result: PASS for controller SHA-256
`6340e068a1cc16acd9788a92892acef9c9f49ca8fdd87cf6182da1654ee70373`
and the frozen probe/test sources. The reviewer checked the fixed input hashes before execution,
ELF source/destination bounds, image/policy inspection, host-positive reset, selected child controls,
source preservation and nonce-only cleanup. Five pure groups passed after the explicit probe-hash
check was added. The reviewer launched no control.

Local Python checks passed 21 tests, but the workflow-test module was unavailable because PyYAML
was not installed; this is not a full local suite pass. The existing CI provisions its pinned parser
and runs those checks before the fixture. Actual runtime, closure and confinement remain unproven.
Fresh source/resource admission and a retained actual receipt are still required. Retire the hook
before merge and do not infer npm, package, production or whole-mission readiness from this review.
