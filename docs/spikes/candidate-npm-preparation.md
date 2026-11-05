# Candidate npm Startup And Owned Preparation Gate

Feature slug: `candidate-catalog-parity`. State: **SPIKE_REQUIRED / NOT_EXECUTED**.
Planning basis: main `62ab1e301f152eb38e268af919ef2c3bc69f4787` (PR #24),
`PROJECT.md` One Next Action, [Node control](candidate-node-confinement.md),
[restricted-child route](candidate-confinement-inert-route.md), and
[dependency input review](candidate-node-dependency-preparation.md).
Data owns this contract; independent Odo test authorship precedes Scotty implementation.
This is a `DO_NOT_COPY` experiment, not a production preparation API.

## Goal And Critical Question

Can the existing cached npm 11.19.1 start under the fixed Node 24.22.1 in the already selected
restricted Linux child and complete one owned, dependency-free, offline `ci` while leaving its
owned manifest/lock unchanged and suppressing every declared lifecycle phase?

This answers one npm startup/preparation uncertainty. A pass qualifies only startup and an empty
package graph: no archive extraction, nonempty dependency graph or native tooling is exercised.
It does not acquire or install website packages. The public lock proposal remains reference-only; no accepted lock, pin, adapter,
throwing guard, generated output, inactive integration, or automatic-baseline stop changes.

Use the existing stack and `quality.local` Linux route only. No Mac Docker, new VM, image pull,
installer, paid service, increased spend, credential access, employer data, Simulator, security
setting change, upstream package/config/build execution, publish, or production invocation.
Historical confinement observations are reused as reached evidence, not rerun. Do not run the
old host-positive, EROFS/ENOENT, host/root-canary, interface, network or credential probes.

## Evidence And Domain Defaults

- **PROVEN_REPOSITORY:** PR #24 observed the fixed Node plus nine runtime destinations and the
  selected restricted child. Its raw JSON SHA-256 is
  `3ad4d7e4dd843b33e3c98cafb3e8b3f12a6b415f5df68aa392ac410b3616bd34`;
  archive SHA-256 is separately `33a73259efba30e375a8a225c6e822c21425a9014ccb6338d5dbc8781a11129e`.
  npm was manifest data only. Runner labels are metadata, not image attestations.
- **PROVEN_DOCUMENTATION:** package-manager preparation convention is lock-driven `ci`, explicit
  script suppression and isolated configuration. [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
  needs a matching lock and does not update manifest/lock. `ignore-scripts` does not make explicit
  `run`/`start`/`test` commands safe; none is permitted.
- **PROVEN_DOCUMENTATION:** [npm configuration](https://docs.npmjs.com/cli/v11/using-npm/config/)
  defines offline installation, zero log retention and explicit config paths. Built-in, project,
  user and global [npmrc sources](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/) all require
  control. These rolling v11 docs currently identify 11.21.2, not the fixed executable.
- Fixed [npm 11.19.1 ci source](https://github.com/npm/cli/blob/v11.19.1/lib/commands/ci.js)
  independently shows that `ignoreScripts` gates seven root lifecycle phases and that the
  operation validates the virtual/ideal lock trees before removing old module entries.
- **UNPROVEN_MISSION_CRITICAL:** npm's bundled modules, startup and empty preparation fit the
  fixed minimal rootfs and unchanged memory/time limits. This spike supplies that observation;
  failure does not authorize expansion. Production dependency preparation remains unproven.

## Fixed Runtime And npm File Closure

Require Linux x64 and the existing complete cache directory
`/opt/hostedtoolcache/node/24.22.1/x64`; never select another version or fetch missing inputs.
Require the existing version-header SHA-256
`0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad`
and npm `package.json` SHA-256
`f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6`.
Parse only bounded metadata: npm version exactly `11.19.1`, Node engine exactly
`^20.17.0 || >=22.9.0`, and npm bin entry `bin/npm-cli.js` (string or npm mapping).
Runtime bytes and destination set must equal these nine entries, total **133,239,032 bytes**.
System sources resolve only under the same `/usr/lib/x86_64-linux-gnu` directory used by PR #24;
Node resolves only to the fixed cache binary. No new ELF closure discovery is needed.

| Destination | Bytes | SHA-256 |
| --- | ---: | --- |
| `/runtime/node` | 126879696 | `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb` |
| `/lib64/ld-linux-x86-64.so.2` | 236616 | `c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da` |
| `/lib/x86_64-linux-gnu/libdl.so.2` | 14408 | `c2994527172cc23b7fb0f7d611b71e00a37da27af12c2e5e9e0dc1a742886c96` |
| `/lib/x86_64-linux-gnu/libstdc++.so.6` | 2592224 | `1fd75fe70354a416d75aef22bcae68c47bd25d20e2d0568c30b1a9838cf62f11` |
| `/lib/x86_64-linux-gnu/libm.so.6` | 952616 | `fce00b6f25f459cf4ae0b7fae4257909a1a8a86f9149e7c029a5d617baf1ccd0` |
| `/lib/x86_64-linux-gnu/libgcc_s.so.1` | 183024 | `d93224d2b0dab4247598be683adca02f5cf00586f99c187579cd7e92058fb7cb` |
| `/lib/x86_64-linux-gnu/libpthread.so.0` | 14408 | `90491a21ce44efcf3bd4b65ec82501c091d7ebe7f8d9b341dd01d721001d9ecd` |
| `/lib/x86_64-linux-gnu/libc.so.6` | 2129424 | `3a15d66867d83762c7f2f1e37359cb8f6c5743edb369c65285cb0b1c4f7498bf` |
| `/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2` | 236616 | `c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da` |

The only newly admitted executable distribution is the already installed npm tree beneath that
cache's `lib/node_modules/npm`, copied as read-only bytes to `/npm`. Allow only `package.json`,
`bin/npm-cli.js`, `lib/**`, `node_modules/**`, optional `npmrc`, and optional `LICENSE`; prune every
`.bin` subtree, documentation/man/test directories are unnecessary outside these admitted trees.
No other global module, npm/npx shell wrapper, downloaded archive, candidate file or host config.
Resolve the npm root within the fixed cache. Traverse sorted paths with lstat; reject symlinks,
special files, hard-linked files, unsafe/duplicate paths, `.node` files and ELF/PE binary payloads.
Reject any `.npmrc` within this closure. The optional root `npmrc` may contain only blank/comment
lines; retain its exact hash or explicit absence. Do not silently remove configuration content.
A standard distribution outside these constraints stops for Data review, not a wider copy.

Bound npm inventory to 8,192 regular files, 8,192 directories, depth 32, 8 MiB per file and 64 MiB
file bytes total. For each copied file retain relative path, byte length and SHA-256; deterministic
sorted JSON inventory is bounded to 4 MiB. Recheck source bytes and copied hashes before import;
record aggregate digest plus full inventory as a data-only evidence artifact. The manifest hash
alone does not attest the unobserved bundled files. Their first actual inventory is new source-bound
observation and requires independent post-run review, not a claim of prior package audit.

## Owned Functional Fixture And Invocation

Odo authors the built-in-only `/npm-probe.mjs`, the inert `/lifecycle-observer.mjs`, and fixed
manifest/lock bytes before producer code. Input contains only that manifest/lock, each <=16 KiB.
Use package name `owned-npm-preparation-control`, version `1.0.0`, `private: true`, no dependencies,
workspace, optional/dev/peer dependency, resolved URL, integrity, file/git spec, override or import.
The v3 lock has exactly the root package record and matching identity, with no dependency edge.
Declare all seven root phases (`preinstall`, `install`, `postinstall`, `prepublish`, `preprepare`,
`prepare`, `postprepare`) with the same literal inert observer command. No fixture imports npm code.

The PID1 owned probe creates `/output/project`, copies the two exact input files there, creates
one owned stale file at `node_modules/owned-stale.txt`, and uses `/output/cache` initially empty.
The observer is an owned script with fixed `/runtime/node --max-old-space-size=32` shebang, only
writes fixed marker bytes beneath `/output`, and exits 73. First invoke it directly with the
same shell-style arguments npm would pass: verify its exit and marker, then remove the marker.
This is a functional observer-positive control, not a host/security probe. If it cannot establish
that positive result, stop before npm; do not add a shell. Then run exactly two npm children:

1. `/runtime/node --max-old-space-size=32 /npm/bin/npm-cli.js <common flags> --version`;
   require successful exit and stdout exactly `11.19.1` plus its normal line ending.
2. `/runtime/node --max-old-space-size=32 /npm/bin/npm-cli.js <common flags> ci --json`;
   require successful exit, bounded JSON summary with zero added/changed/audited/funding and no
   added package records, observer marker absent, stale entry removed, exact manifest/lock bytes
   unchanged, and no installed package payload. Do not require an unobserved `removed` count.

Common flags are fixed arrays: `--offline`, `--ignore-scripts`, `--audit=false`, `--fund=false`,
`--update-notifier=false`, `--userconfig=/config/user.npmrc`,
`--globalconfig=/config/global.npmrc`, `--cache=/output/cache`, `--prefix=/output/project`,
`--global=false`, `--workspaces=false`, `--include-workspace-root=false`, `--logs-max=0`,
`--loglevel=error`, `--progress=false`, `--color=false`, `--fetch-retries=0`, `--bin-links=false`,
`--script-shell=/lifecycle-observer.mjs`. Both `/config` files are owned, empty, read-only files.
No config-list/dump, registry ping, auth lookup, npx, install, run, rebuild or arbitrary command.

Keep exact child environment values `HOME=/nonexistent`, `PATH=/usr/bin:/bin`,
`FIXTURE_VISIBLE=synthetic`, and Docker's fixed `HOSTNAME=fixture`; npm children receive only these
four. No inherited NODE_OPTIONS, NODE_PATH, npm_config, proxy, CI credential or host environment.
Npm's internal configuration reads are within this synthetic rootfs; config is isolated rather
than claiming npm performs no configuration reads.

## Container, Resource And Evidence Contract

Import only the owned rootfs without Dockerfile/base image. The entrypoint is exactly
`/runtime/node --max-old-space-size=32 /npm-probe.mjs`, with no caller-supplied command.
Preserve inspected immutable image/nonce binding, nonzero host UID/GID, read-only root,
network `none`, dropped ALL capabilities, no-new-privileges, existing default seccomp,
private PID/IPC/cgroup namespaces, 32 PIDs, 134217728 bytes and one CPU. Only `/input` read-only
and `/output` writable bind mounts are allowed. No socket, host canary or root-write control.
Pre-start inspect must match exact image, command, hostname, environment keys, namespace/resource
and mount values. Do not repeat `/proc`, filesystem-denial, network or credential probes.

Keep the **90-second** monotonic controller deadline plus **10-second** independent cleanup
allowance; commands <=10 seconds, observer <=5 seconds and each npm child <=10 seconds, with
remaining-deadline clipping. Preserve V8 old-space 32 MiB for every Node child and 128 MiB overall.
No automatic retry or memory/timeout/runtime expansion after OOM, denial or startup failure.
Outer existing-job fixture step <=2 minutes. Allow one actual initial first-attempt PR-opened run
only after independent review and fresh LaForge resource/source admission. Exact branch/head,
checkout/test-merge parents, source hashes, runtime and npm inventory digest are required.
Push, synchronize, reopen, main and manual reruns must skip; retire the temporary hook before merge.
Workflow changes/publication are later coordinator-owned work, not authorized by this Data handoff.

Output is data only: exact two project files, absent stale/observer markers, an empty node_modules
or optional `.package-lock.json` describing zero dependency packages, empty cache directories and
a bounded functional receipt. Reject output symlinks, devices, unexpected files or package payloads;
cap whole output at 128 files/directories and 1 MiB, depth 8, individual receipt <=64 KiB. An
optional hidden lock must be parsed and constrained; its mere filename is not sufficient. These
fixture output checks do not qualify general production artifact handling.

Receipt starts `INDETERMINATE`; a pass is `NPM11_OWNED_PREPARATION_CONTROL_PASSED` only after fixed
runtime/npm closure, observer positive/reset, version/ci results, exact inputs/output, tracked-source
preservation and owned cleanup checks pass. Retain stage, exit/signal/OOM information and first
bounded failure. No raw environment/config dump or unrelated path/value is evidence.
Unknown import/create outcome remains cleanup uncertainty even after empty nonce-filter scans;
cleanup only owned nonce objects and temp files, with no retries or broad discovery. Any denial,
source drift, missing prerequisite, real-data exposure, limit or cleanup uncertainty stops. Unrelated denied operations are not prerequisites for this gate and must not be retried.

## Acceptance And Verification Budget

Required; no optional reruns:

1. **MANUAL_VERIFICATION / SECURITY_PROPERTY:** independent Odo source/test ownership frozen before
   Scotty, original reviewed Node/probe/test files unchanged, exact functional API and allowlist
   rejection vectors pass without subprocess/Docker/npm execution. New policy inspect covers this
   image without representing a new security-probe qualification.
2. **QUANTITATIVE_THRESHOLD:** runtime destination set/bytes/hashes and npm closure bounds match;
   no runtime discovery, download, image pull or install. Source/fixture/inventory hashes bind receipt.
3. **STATE_TRANSITION / OBSERVABLE_OUTCOME:** observer positive writes then reset removes marker;
   npm reports 11.19.1 and dependency-free ci succeeds; marker remains absent, stale file gone,
   manifest/lock identical, no package installed, zero audit/fund activity.
4. **EXACT_ERROR_CONTRACT:** pure negative vectors reject foreign runtime/destination/hash,
   unsafe npm tree/config/symlink/native payload, modified arguments/env/mounts, script activation,
   installed output, nonzero/timeout/oversize results and cleanup uncertainty. Pure vectors are
   contract evidence only, not actual failure injection or renewed security probing.
5. **OBSERVABLE_OUTCOME / STATE_TRANSITION:** one admitted existing-route receipt plus inventory,
   source preservation and complete cleanup; independently review raw first result and classify it
   PROVEN, DISPROVEN, PARTIALLY_PROVEN or INDETERMINATE separately from readiness. Existing CI
   remains required integration evidence; review-only roles need not duplicate passing runs.

## Ordered Slices And Handoff

1. **Odo now:** freeze `fixtures/npm-preparation-probe.mjs`,
   `fixtures/npm-lifecycle-observer.mjs`, `fixtures/test-npm-preparation-control.mjs` and compact
   test ownership/evidence note; no producer implementation, containers or npm. Pure tests may be
   authored against the API below before it exists; missing-module first result is not behavioral
   evidence. Stop with hashes, expected vectors, and any contract gap for LaForge/Data.
2. **Scotty after Odo:** implement only `fixtures/run-npm-preparation-control.mjs`, preserving old
   fixtures. Run the pure owned suite only; independently review before runtime admission.
3. **LaForge later:** bind exact reviewed code/hashes and resource/source admission to one
   temporary existing-route hook, retain first result, retire hook; no automatic correction run.
   If a concrete harness defect is found, return evidence to Data/independent review for a revised
   action under the existing authority envelope before any corrective execution.
4. **Data/Bashir:** interpret reached result and readiness separately. The mission remains
   SPIKE_REQUIRED until actual evidence is reintegrated; no production handoff is implied.

Proposed producer exports, all pure and import-side-effect-free:
`validateRuntimeInventory(entries)`, `validateNpmInventory(entries, metadata)`,
`buildNpmContainerArgs(options)`, `verifyNpmPolicy(policy, options)`,
`buildNpmInvocation(mode)`, `verifyNpmObservation(observation)`.
Exact records, positive/negative vectors and evidence expectations are in the
[independent Odo contract](candidate-npm-preparation-odo-test.md). Odo owns test details.

## Decision Provenance, Limits And Exit

The fixed runtime, route, old limits and production exclusions are **SOURCE_SPECIFIED / ALIGNED**.
The empty owned lock, config paths, inert lifecycle observer and sorted bounded npm inventory are
**DERIVED_NO_ARCHITECTURE_CHANGE / ALIGNED** experiment choices. This contract updates the local
spike planning basis explicitly; it selects no production runtime/preparation architecture.
The observer/npm minimal-rootfs compatibility remains **UNPROVEN_MISSION_CRITICAL**, resolved only
by the bounded actual result. No RISK_ACCEPTED decision exists.

Defer dependency archives/extraction/native tools, accepted/public lock adoption, real installation,
upstream scripts/config/build, general output promotion, overlays/browser parity, production and
pre/post-merge candidate qualification. No npm safety audit, feed equivalence, universal credential
absence, host/kernel escape resistance, performance benefit or full Mission 9/10 acceptance follows.
Data's planning exit is a coherent plan plus Odo handoff; runtime/readiness are NOT_EXECUTED.
