# Candidate npm Preparation — Independent Odo Test Ownership

Feature slug: `candidate-catalog-parity`. Checkpoint: **TESTS_FROZEN / PRODUCER_NOT_STARTED**.
This record covers test authorship for the owned npm 11.19.1 empty-graph spike. It is not a
runtime result, confinement requalification, production dependency qualification or readiness decision.

## Role And Authority Actually Used

Independently assigned Odo read the installed `starfleet-codex-crew` 0.2.0
`skills/starfleet-crew/SKILL.md`, `references/canon/agents/odo-behavioral-integrity-testing.agent.md`,
`foundation/core-principles.md`, `foundation/starfleet-harness.md`, and the directly relevant
`docs/reference/{tool-classes,tool-contracts,role-tool-matrix}.md` (all canon paths relative to
`references/canon` except the skill entry). These were actual reads, not package-presence claims.

Inputs read: current `PROJECT.md` One Next Action; Data's
[candidate-npm-preparation.md](candidate-npm-preparation.md), the corresponding bounded test-author
handoff, and the existing Node wrapper and pure tests.
The retained inert receipt archive SHA-256 was independently read as
`33a73259efba30e375a8a225c6e822c21425a9014ccb6338d5dbc8781a11129e`.
Its JSON member confirms the nine runtime source/destination/size/hash records, including canonical
`libstdc++.so.6.0.33`, and total 133239032 bytes. No historical probe was rerun.

LaForge's task explicitly permits these four new test/fixture artifacts before implementation;
it selects this spike evidence path instead of the role's generic `docs/testing/<slug>` path.
No producer implementation existed or was inspected. Odo wrote no implementation, workflow,
production input, Project State, Ops or roadmap and performed no Git mutation/publication.
The authoring context was an isolated checkout of main basis
`62ab1e301f152eb38e268af919ef2c3bc69f4787` (PR #24).

## Frozen Ownership

| Owned artifact | SHA-256 |
| --- | --- |
| `fixtures/npm-preparation-probe.mjs` | `18800d03a5f86171c2eb96631a54e7a3b4e1aaa1f65f25d5d402067ec96ebb5c` |
| `fixtures/npm-lifecycle-observer.mjs` | `a3059404cb6f0cfcc861d00a53a471e8f7dc90632d5e8b9b02f68d88b7f9fcb9` |
| `fixtures/test-npm-preparation-control.mjs` | `5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972` |

The built-in literal manifest is 417 bytes, SHA-256
`2f7fd9cadad92c0af5e113c0ad0140023608312db9ea83050e8bef56ced745eb`.
The built-in literal lock is 253 bytes, SHA-256
`465eac71e5d2ba4a43c47a546ee9280d7d518c320abae0d0d6a7c03e175e7dbe`.
Both have trailing LF. The lock is v3, with exactly its matching root package record and
`hasInstallScript:true`; `requires:true` adds no dependency edge. Each of the seven root lifecycle
phases uses the literal `/lifecycle-observer.mjs` command.

The owned observer's shebang is `#!/runtime/node --max-old-space-size=32`. It accepts exactly
`['-c','/lifecycle-observer.mjs']` after the script path, writes only fixed marker bytes at
`/output/lifecycle-observed.txt`, then exits 73. The positive control passes `-c` after the script
path under fixed Node, verifies the marker/exit and resets it before either npm invocation.
The probe has inert exports and a direct-execution guard. It has not been imported or executed here.

## API Agreement Before Producer

LaForge explicitly accepted the refinements below before this freeze. No seventh producer export
is required. Every rejection throws `Error`; accepted validators return `true`; builders are pure,
deterministic, do not mutate inputs, and return fresh mutable results. Producer module import must
perform no I/O, subprocess, admission or invocation. The six named exports are:

1. `validateRuntimeInventory(entries)`: exact nine prior-receipt `{source,destination,bytes,sha256}`
   records, source/destination bindings and byte total; order independent. Optional immutable
   `needed` arrays are ignored without mutation. This is equality to retained data, no ELF discovery.
2. `validateNpmInventory(entries, metadata)`: sorted, unique `{relativePath,bytes,sha256,kind,nlink,magicHex}`
   file records; fixed admitted prefixes/root files and required manifest/CLI/lib/bundled-module
   presence. `metadata` has `{version,nodeEngine,manifestSha256,builtinConfig,directoryCount}`.
   Directory count is the count below the npm root, excluding root, a required nonnegative safe
   integer <=8192; actual traversal must also bound empty directories and directory depth.
   Relative paths have at most 32 components. Builtin config is absent or hash-bound comments-only
   root `npmrc`. Every `.npmrc`, `.node`, `.bin` component, native magic, unsafe type/link/path,
   length/hash/size/count/depth/byte/JSON cap breach rejects. File magic is exact lowercase hex of
   the first min(4,size) bytes. Host traversal derives and rechecks records from bounded real bytes;
   synthetic records alone do not attest source truth or comments-only content.
3. `buildNpmContainerArgs(options)`: only `{imageId,name,uid,gid,input,output,nonce}`;
   old identity/path validation, nonoverlapping mounts, same exact selected create policy,
   three configured env keys, `--pull never`, and **empty command tail** after image ID.
4. `verifyNpmPolicy(policy, options)`: existing selected metadata shape, exact entrypoint
   `['/runtime/node','--max-old-space-size=32','/npm-probe.mjs']`, `cmd:[]` (Docker null may normalize
   to empty only), and old selected namespace/resource/env-key/mount bindings. Hostname/configured
   env values must additionally be derived/checked in controller inspection; the key-only shape
   is not proof of values.
5. `buildNpmInvocation(mode)`: exactly one argument, `version` or `ci`; returns
   `{file:'/runtime/node',args,cwd:'/output/project',env,timeoutMs:10000,maxBuffer:65536}`.
   `args` is fixed Node heap + npm CLI + exact common flag array from Data + `--version` or
   `ci --json`. `env` is exactly HOME=/nonexistent, PATH=/usr/bin:/bin,
   FIXTURE_VISIBLE=synthetic, HOSTNAME=fixture. Extra options and arbitrary npm modes reject.
6. `verifyNpmObservation(observation)`: strict exact keys defined by `observation()` in the owned
   pure test. Contained fields are `node`, `npmVersion`, `observerPositiveExit`,
   `observerPositiveMarker`, `observerReset`, `versionExit`, `versionSignal`, `versionTimedOut`,
   `versionStdoutBytes`, `ciExit`, `ciSignal`, `ciTimedOut`, `ciStdoutBytes`, `ciSummary`,
   `observerAfterCi`, `staleAfterCi`, `manifestUnchanged`, `lockUnchanged`,
   `installedPackageCount`, `outputAccepted`. Controller adds `cleanupComplete:true`,
   `mutationOutcomeUncertain:false`, `sourcePreserved:true` after independent mounted-output,
   tracked-source and owned-cleanup checks. Missing/unknown fields reject. Successful child signals
   are null, timeouts false, byte counts nonnegative safe integers <=65536, exits zero.
   `ciSummary` allows only numeric zero added/changed/audited/funding, nonnegative safe-integer
   removed, and optional empty `add`/`change` arrays. No exact removed count is guessed.

The probe returns contained JSON on stdout only; it cannot assert controller cleanup/source facts.
The controller must retain first bounded failure, stage/exit/signal/OOM and uncertainty, preserve
90s monotonic controller +10s cleanup and <=2min fixture step, perform independent output checks
including hidden-lock content, and never promote unknown mutation outcomes after an empty scan.
The probe's own monotonic window is 85s within that outer budget; each npm child <=10s, observer
<=5s, 65536 bytes per stream, fixed V8 old-space 32MiB. Existing 128MiB/32PID/1CPU limits remain.
Owned output permits only exact project files, absent markers/stale payload, empty module tree or
bounded hidden lock with no packages, empty cache directories, and the host's bounded functional
receipt. Probe checks are duplicated independently by the host, not trusted as booleans alone.

## Requirement Vectors And Initial Evidence

### R1 — Fixed Runtime Identity
- Requirement: reuse exactly prior Node/runtime bytes without substitution or new discovery.
- Test Case: positive nine-record inventory, reverse order, ignored immutable needed arrays;
  negatives wrong canonical source, source alias, destination, hash/case, size, same-total size
  drift, missing/duplicate/extra record.
- Expected Result: exact records accepted; every mutation throws.
- Observed Result: vectors authored; producer absent at initial load.
- Status: NOT EXECUTED

### R2 — Bounded npm Closure
- Requirement: fixed manifest/version/engine, safe admitted bytes and isolated builtin config.
- Test Case: minimal sorted tree and comments-only hash-bound config; negative path/escape,
  native magic/type/hardlink/config, required-file absence, duplicate/order, file size >8MiB,
  total >64MiB, 8193 files/directories, >32 components and inventory JSON >4MiB.
- Expected Result: admitted record sets accepted; drift rejected without fallback.
- Observed Result: vectors authored; host actual traversal/raw metadata remains future work.
- Status: NOT EXECUTED

### R3 — Container Arguments And Selected Policy
- Requirement: fixed entrypoint, empty command, exact policy, four effective env keys/two mounts.
- Test Case: exact create array and selected-policy positives; synthetic image/nonce/identity,
  path overlap, arbitrary command, heap, env, resource, namespace and mount drift negatives.
- Expected Result: exact values only; no input mutation.
- Observed Result: pure vectors authored; no Docker or policy runtime invocation.
- Status: NOT EXECUTED

### R4 — npm Command Contract
- Requirement: only version and empty offline script-suppressed ci with explicit owned config.
- Test Case: exact flags/env/cwd/buffers/deadline values and fresh results; reject arbitrary modes
  and extra per-call options.
- Expected Result: deterministic exact commands; no inherited env or executable selection.
- Observed Result: vectors authored; no npm command ran.
- Status: NOT EXECUTED

### R5 — Owned Fixture And Lifecycle Observability
- Requirement: immutable empty graph and positive/reset observer before script-suppressed ci.
- Test Case: source-only literal/digest/phase/flag/order controls; later actual fixed child must
  produce exit73+marker, reset it, report npm11.19.1, remove stale entry and leave marker absent.
- Expected Result: both manifest/lock unchanged, zero installed packages, bounded permitted output.
- Observed Result: source authored and manually read; literal bytes/hash computed with standard
  host hashing only. The probe and observer have not run; automated source assertions did not load.
- Status: NOT EXECUTED

### R6 — Observation And Finalization
- Requirement: no acceptance without all functional evidence and complete cleanup/source checks.
- Test Case: positive record (removed may be 0 or 1); remove every key; mutate failure/timeout,
  signal/oversize/summary, observer, manifest/lock/output, cleanup certainty and source fields.
- Expected Result: all drift rejects; cleanup uncertainty can never be a passing receipt.
- Observed Result: pure vectors authored; no real contained result or cleanup result exists yet.
- Status: NOT EXECUTED

### Initial Pure Test Loader
- Requirement: distinguish missing implementation from behavioral rejection evidence.
- Test Case: `node --test docs/spikes/fixtures/test-npm-preparation-control.mjs` on producer-absent
  checkout, using existing host Node v22.15.1. No authored probe was imported or executed.
- Expected Result: missing producer module before any assertion.
- Observed Result: exit1, `ERR_MODULE_NOT_FOUND` for `run-npm-preparation-control.mjs`; TAP reports
  one failed file, zero passing tests. This is **loader evidence, not a behavioral red test**.
  Additional source-only flag/env assertions were added before final freeze; there was no rerun.
- Status: PASS

## Handoff, Constraints And Tool Record

Scotty receives these frozen tests first and implements only the new producer. Run the pure suite
once after implementation, then independent review before LaForge admits one actual quality.local
run. Source drift or a critical contract conflict returns to Data/Odo; do not silently rewrite
frozen tests around implementation. LaForge will preserve authorship ordering in separate commits.

Tool classes used: repo-reader/content-source-reader for named actual role/contract/source/receipt
reads (no state mutation); artifact-writer for exactly these four authorized files (repo-only);
test-runner for the single missing-module loader result (no producer/probe execution). Evidence is
this record, source bytes and hashes. Common limitation: a load failure executes no test cases;
authored vectors and historical runtime receipt cannot prove this new npm closure or behavior.

No npm, Docker, controller, upstream package/config/build, install, Simulator, security setting,
credential/network/proc/host-canary or historical security probe executed. No new runtime, budget
relaxation, retry/fallback or architecture choice is authorized. The npm closure compatibility and
first actual result remain unproven. Runtime/CI/production/readiness are NOT_EXECUTED.

## Independent Odo Validation Of Final Producer — 2026-11-05

The final producer reviewed here has SHA-256
`af7d21ff6cfc464ed389c6a72fec1b0c7e369f7cf2f2668b56e20302369f98cd`.
The coordinator requested one independent pure-suite run after Scotty's final host admission and
attach-state refinements. Odo read that final controller and its implementation note, without
calling its direct-execution entrypoint. The three frozen Odo source hashes still exactly match
the ownership table above; no probe, observer or test code was changed. A read-only diff against
main `62ab1e301f152eb38e268af919ef2c3bc69f4787`, excluding the four new npm fixture files, returned
exit0 and no differences for the existing fixture directory: the prior Node/C sources are unchanged.
Coordinator publication sanitization affected prose only and did not alter frozen executable bytes.

### Final Pure Contract Suite
- Requirement: R1–R6 frozen pre-producer contract, including all nine concrete test groups.
- Test Case: one execution of `node --test docs/spikes/fixtures/test-npm-preparation-control.mjs`
  against the final producer above, using existing host Node; no subprocess-producing function
  or authored probe was called by the tests.
- Expected Result: all exact positive records accepted; every listed negative record rejected;
  frozen fixture source/literal/phase/order controls accepted.
- Observed Result: exit0; TAP 9 tests, 9 passing, 0 failing/cancelled/skipped/todo, duration95.908ms.
  R1 exact runtime, R2 closure records/bounds, R3 builder/policy, R4 invocation, R5 source controls
  and R6 final observation predicates all executed successfully. This supersedes no historical
  evidence: the earlier producer-absent load still executed no behavioral assertions.
- Status: PASS

### Final Controller Source And Host Derivation Review
- Requirement: host evidence independently establishes output/source/cleanup facts and retains
  fixed admission, runtime, closure and resource constraints before any actual observation.
- Test Case: read final controller's admission, source binding, runtime/closure traversal/copy,
  config creation, image/container inspection, attach-state handling, mounted-output validation,
  tracked-source preservation and finalization/cleanup path.
- Expected Result: no caller command/runtime/env substitution or raw child boolean alone can
  satisfy final success; first failure and uncertainty remain material; limits remain fixed.
- Observed Result: source binds the first-open same-repository test-merge route, branch/head/base,
  ordered parents and four reviewed source hashes. It checks canonical fixed runtime bytes,
  bounded lstat-derived npm inventory and comments-only builtin config, source/copied hashes and
  retained inventory digest. The two empty owned config files and executable observer are copied
  with fixed modes. Selected image/container metadata checks exact entrypoint, empty command,
  configured env values plus fixture hostname, two mounts and existing resource policy.
  Host output traversal separately rejects marker/stale/package payload and unexpected files,
  validates exact manifest/lock and optional zero-package hidden lock, and bounds cache/output.
  Tracked source is snapshotted again before finalization. Controller-owned fields from a child
  are rejected; cleanup completeness and mutation certainty are added only by the host and passed
  through the strict sixth validator. Cleanup retains unknown import/create outcomes despite an
  empty owned-object scan. Attach failure retains the first command failure while recording
  selected exit/OOM state when available. No in-scope source defect was found in this bounded read.
- Status: PASS

### Actual npm Runtime And Hosted Observation
- Requirement: observer positive/reset, fixed npm startup and empty offline ci under the selected
  child, with independently reviewed actual closure/result and complete owned cleanup.
- Test Case: the single coordinator-admitted actual existing-route observation, after independent
  readiness review and fresh resource/source admission.
- Expected Result: retained first outcome under unchanged limits, with no retry or relaxation.
- Observed Result: not performed in this Odo validation. Pure records and source review cannot
  establish npm startup, minimal-rootfs compatibility, lifecycle execution/suppression, real output
  or cleanup behavior. No npm, Docker, controller, probe or observer ran here.
- Status: NOT EXECUTED

Tool Class: test-runner; Purpose: independent final-source frozen contract validation; Evidence:
the nine-test TAP result summarized above; Outcome: all nine concrete pure checks passed.
Tool Class: repo-reader; Purpose: final source and ownership/baseline verification; Evidence:
producer/fixture hashes and baseline diff; Outcome: the final controller was read, frozen Odo and
prior Node/C sources are unchanged. Tool Class: artifact-writer; Purpose: append this evidence;
mutation footprint: repo-only, this note only. Bashir retains readiness judgment; no runtime or
production qualification follows from these checks.
