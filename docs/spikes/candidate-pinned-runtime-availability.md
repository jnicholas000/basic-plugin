# Exact pinned runtime availability — approved execution handoff

Mission slug: `candidate-catalog-parity`. Date: **2026-11-05**.
Current checkpoint: **READY FOR ONE ADMITTED OBSERVATION; ACTUAL ACTION NOT_EXECUTED**.
The initial Data/Odo/Scotty handoff below is preserved as the prospective contract; subsequent
implementation and offline verification are recorded at the end.
Source basis: `677cb492b15ecc951510407d42247ee7b28ee738`;
branch `feat/pinned-node-cache-availability-20261105`.

## Authority and unchanged basis

Owner approval recorded **2026-11-05** covers one bounded official archive acquisition,
temporary exact-cache installation, pinned-byte/runtime-closure verification and owned cleanup
in the existing CI runner. It excludes target-runtime execution and any npm-control retry.

- Original reviewed plan SHA-256:
  `aab47f287915979d88c895d3aae64037a67cfd856816e546f94cd88066dfc516`.
- Independent Bashir plan-review SHA-256:
  `4ad2fda143a454c24ab36cb99289e187e6e42129cb5c65a1dc1b6107e1c19171`.

Both historical artifacts remain unchanged, including their pre-decision wording. This dated
approval/handoff records the later authorization. Data actually loaded the installed Starfleet
0.2.0 Data role. Independent Odo freezes tests before Scotty; Bashir then reviews code and evidence,
and LaForge binds the exact reviewed source/resources before the sole actual existing-route run.

## Scope for both receiving roles

Use existing trusted host **Python standard library** for a small pure module and separate guarded
installer wrapper; no new dependency or generic execution framework. Actual action runs only in
existing `quality.local`, this same-repository branch's first `pull_request.opened`, attempt 1.
No local acquisition, extra HEAD/version research, CI run or target invocation is part of authorship.

The one anonymous HTTPS GET is exactly
`https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz`, expected SHA-256
`eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c`.
No redirect, retry, resume, mirror, fallback or credentials. HTTP 200 and numeric Content-Length
<=96 MiB precede any body read; complete body must match that length and pinned digest before
extraction. Network <=60 seconds; existing verified HTTPS behavior stays enabled.

Before transfer verify the **seven unique fixed canonical system-library files**, original hashes
and lengths in the [existing nine-record contract](candidate-npm-preparation.md#fixed-runtime-and-npm-file-closure)
and approved plan. No discovery/search, library replacement or permission fallback. Preserve all
nine destination labels, including two loader labels sharing one canonical source; total original
destination bytes **133,239,032**. Node source remains the fixed cache binary. These are exact
identity requirements, not a new ELF/security probe.

Require Linux x64, ordinary nonroot host identity, real `RUNNER_TOOL_CACHE=/opt/hostedtoolcache`,
and both destination `/opt/hostedtoolcache/node/24.22.1/x64` and sibling
`/opt/hostedtoolcache/node/24.22.1/x64.complete` absent. No overwrite/repair, sudo, chmod/chown of
existing paths, other-cache inspection, PATH change, new host, security change or cache service.
Stage/archive/cache paths must be exclusively created and ownership recorded before writes.

Validate the **complete** archive entry table before member writes: exactly one top prefix
`node-v24.22.1-linux-x64/`; safe relative paths; only files/directories/internal relative symlinks;
no traversal, absolute links, hardlinks, special files, duplicate destinations, set-id modes,
dangling/cyclic links or link-following writes. Keep legitimate validated npm/bin/.bin links and
all accepted archive content. Write directories/files first and links last, then preserve ordinary
archived modes only on new owned paths. The installer must not apply archived uid/gid ownership.

Limits remain 32,768 entries, depth 32, 4,096 path bytes, 192 MiB/file, 512 MiB file bytes and
<=1.2 GiB peak total owned disk. That disk ceiling includes the archive, extraction stage and
installed copy together, including directory/link allocation and filesystem allocation overhead;
`2 * file bytes + archive bytes` alone is insufficient. Before any member write, admit the
complete validated table only if conservative rounded-allocation and directory/link/metadata
reservations for both copies, plus the archive and already owned paths, fit this same ceiling.
During staging/copying, measure owned allocations (including directories and links), retain the
conservative overhead reservation, and stop before further writes if the next bounded write
cannot fit. The accepted pure admission formula is:

`96 MiB archive + 2 * footprint_4KiB(validated table) + 16 MiB global reserve <= 1288490188 bytes`.

Each copy's `footprint_4KiB` includes rounded file allocation, implicit directories, symlink
allocation and per-entry allocation reserve. Odo owns the exact counting formula and its boundary
vectors before the producer freeze. The wrapper must confirm each relevant filesystem has
`0 < f_frsize <= 4096`; otherwise stop as unsupported, without fallback. At bounded write
checkpoints measure owned `st_blocks` allocation, retain the prescribed reservations and guard
remaining writes. This narrows eligible runtime filesystems to uphold the existing ceiling; it
does not enlarge that ceiling or change the API. Use simple bounded accounting, not a new quota
service or framework. Do not assume individually meeting archive/file-byte caps implies the
combined footprint fits. Stream bounded chunks. Verify staged and installed regular bytes at these exact cache-relative paths:

| Path | SHA-256 |
| --- | --- |
| `bin/node` | `e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb` |
| `include/node/node_version.h` | `0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad` |
| `lib/node_modules/npm/package.json` | `f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6` |

Parse only the bounded npm manifest as data to require `11.19.1` and the previously selected
Node engine. Reverify all nine runtime bindings after exclusive installation; create the empty
sibling completion marker **last**. No Node24/npm/npx/Docker, installer hook, project/package code
or upstream build executes. No production/accepted input, output, pin or baseline changes.

Controller <=180 seconds plus independent <=15-second cleanup; capture step <=4 minutes added
to ordinary existing CI. Existing approved CI budget/service is unchanged; no new dollar/free
claim or increased-spend authority. Fresh coordinator resource checkpoint is required before
actual admission; the reported 16%/66% usage and ~16.17 GiB disk are observations, not guarantees.

Receipt starts INDETERMINATE; capture first stage/error/status and any partially completed work.
Bind reviewed installer/module/test hashes, full base/head/test-merge, run/attempt, original evidence
identities and selected reported runner metadata. LaForge independently corroborates checkout and
merge parents. Hash/preserve tracked source before/after without importing or executing it.
Only `PINNED_CACHE_BYTES_VERIFIED` plus complete owned cleanup supports a passing result; a cleanup
unknown/error keeps INDETERMINATE. Receipt <=64 KiB; inert evidence <=2 MiB, seven-day artifact
retention. Upload no archive, installed code or executable cache.

Finally remove only action-owned archive/stage/cache/marker and empty version parent if created
by this action. Record successful exclusive creation, not pathname proximity, as cleanup authority.
Refuse to remove anything preexisting; any denial, unknown ownership, limit, byte drift or cleanup
uncertainty stops with the first result, no retry. Retire the temporary hook before merge.

This proves only same-job byte/layout availability if reached. Remove the cache before exit.
Any future npm gate requires fresh approved preparation/verification in its **same job** plus
separately admitted npm execution. Preserve the original ENOENT, metadata absence result and
historical Node success; this action cannot establish the disposed runner's historical cause.

## Odo — exact minimal test API and ownership

Allowed new files: `fixtures/test_pinned_runtime_availability.py` and a compact
`candidate-pinned-runtime-availability-odo-test.md` ownership/results note. Odo may use owned small
in-memory tar fixtures as test data; no actual runtime archive, real cache-path I/O or target code.
Producer files do not exist yet. Missing-module first result is loader evidence, not assertion proof.

Freeze Python module `pinned_runtime_availability.py` with these exact **pure** API names:

- `validate_acquisition_policy(policy) -> True`: exact closed dict fields
  `{url, archive_sha256, cache_path, marker_path, max_download_bytes, network_seconds,
  max_entries, max_depth, max_path_bytes, max_file_bytes, max_unpacked_bytes,
  max_peak_disk_bytes, controller_seconds, cleanup_seconds, redirects, retries, resume}`.
  Values are the approved constants above; `redirects=0`, `retries=0`, `resume=False`.
  Use 1.2 GiB as `max_peak_disk_bytes=1288490188` (floor of 1.2*1024^3), not a larger rounded ceiling.
- `validate_archive_entries(entries) -> list[dict]`: input is bounded normalized TarInfo data
  `{name, kind, size, mode, linkname}`; kind `file|directory|symlink`. Return validated stripped
  records `{path, kind, size, mode, linkname}` in directory/file-before-symlink installation order,
  omitting only the top directory record. Reject invalid input with `ValueError`. Enforce the
  accepted full-footprint formula above here, including implicit directories and allocation
  reserves. Odo freezes its exact formula/vectors without changing this API shape or return.
  Complete-table/path/link/mode/size rules also apply; no writes, filesystem or archive-code imports.
- `validate_availability_evidence(evidence) -> True`: closed record
  `{archive_sha256, cache_files, runtime_files, marker_empty, source_unchanged, cleanup}`.
  `cache_files` exactly three `{path, size, sha256}` records with the required relative identities;
  `runtime_files` exactly nine `{source, destination, size, sha256}` original records;
  `cleanup={completed, uncertain, remaining_owned_paths}` must equal true/false/empty for pass.
  Runtime records require original lengths/hashes; cache records require the three fixed hashes
  and actual nonnegative bounded sizes (Node size is 126,879,696; no unrecorded historic header/npm
  length is invented). Require exact sets/no duplicates, `marker_empty=True` and
  `source_unchanged=True`. This validator does not replace operational I/O or establish cleanup
  ownership from a boolean; the wrapper must retain its exclusive-create ownership evidence.

Validators throw `ValueError` on rejection, preserve caller data and perform no I/O at import/call.
Odo freezes any necessary record-shape clarification **before** producer implementation; return a
named gap rather than introduce a fourth framework/API or broaden the action.

Use **eight focused groups**: (1) exact policy/budget/source/no-fallback; (2) valid archive and
root stripping; (3) path/type/duplicate/set-id rejection; (4) valid npm relative links plus
escape/dangling/cycle/link-ancestor rejection; (5) entry/depth/path/file/aggregate boundaries;
(6) exact three/nine identity records and failure vectors; (7) marker-last/source/ownership/cleanup
state vectors; (8) independent wrapper review verifies one GET only after system hashes, no body before headers,
no extraction before digest/full table, exclusive-create ownership, first-failure retention and
finite deadline/cleanup order. An existing minimal injected-I/O seam may support the last group;
otherwise record it as source review, not a pure-test pass. No actual network/install or new I/O
framework is required for authorship.
Required behavioral coverage matters more than a ceremonial exact test count.

Freeze test hashes, fixture expectations and first status; then stop and hand through LaForge to
Scotty. Odo owns tests; Scotty must not edit them to fit producer behavior. No workflow, PROJECT,
Git, Ops or producer edits by Odo.

## Scotty — bounded implementation after the freeze

Allowed new producer files: `fixtures/pinned_runtime_availability.py` and
`fixtures/run_pinned_runtime_availability.py`; update only this spike's implementation evidence.
LaForge separately owns the later temporary existing-route hook and actual publication/admission.
Implement approved I/O plus the frozen pure API, run the focused frozen suite, retain first outcomes
and stop for independent Bashir review. No actual download or installation during implementation.
No new dependencies, generic command interface, secondary acquisition, runtime compatibility trial,
production edits or npm retry. Unknown archive/link behavior or unsupported host stdlib returns
through LaForge/Data, without silent content pruning or widened extraction rules.

Verification budget: frozen pure groups + source/operational review now; one separately admitted
actual availability result and independent evidence/readiness review later. Data's planning exit completed
at this coherent Odo handoff; no runtime/CI/readiness result was claimed at that checkpoint. Approval is GRANTED within
this action; implementation may proceed after Odo, actual execution remains gated on code/tests/
review and fresh source/resource admission. No unresolved planning drift or accepted-risk exception.

## Implementation and offline verification

Odo's original test ownership was committed as `16bf037d2175d9d9258c53eb3763da8f4189a6b5`
before producer creation. Its first missing-module result executed no assertions. Scotty later
passed all seven pure groups; a further static link-resolution correction was followed by a
meaningful seven-test rerun. The final pure module rejects traversal through a regular file
before `..`; no expected test values were weakened.

Independent Bashir operational review then blocked the wrapper at
`f3328007a67312d69c3286d0bac8807dc25b2928741803e513a8d0a1f27a0db2`: an interruption after
exclusive creation but before registration could leave a path unrecorded while cleanup reported
success. Odo added an independent inert regression before the correction, committed as
`94edf0a1ad1b8fcdb8fddcd86f1bc23dbce6e0b6`. Three in-memory post-mutation timeout subcases
actually reproduced the false-complete result. The unguarded temporary-root source check also
failed; two controls passed. Only an AST-extracted ownership class with fake I/O ran, not the
wrapper, network or real filesystem. The [Odo record](candidate-pinned-runtime-availability-odo-test.md)
preserves those results separately from the seven pure groups.

The corrected wrapper records pending creation before mutation, retains uncertainty until
identity acknowledgement, and never deletes an unconfirmed or preexisting path. Its temporary
root uses the same guarded creation path. The retained inert manifest's complete identity/hash
is recorded before release from cleanup, and its allocated blocks remain accounted for. The
final combined frozen suite passed **11 tests** (seven pure plus four ownership methods), zero
failures, 0.090 seconds. Earlier passing and failing results remain historical evidence, not
actual acquisition results. Both independently authored test files are unchanged by the implementer.

| Final prepared artifact | SHA-256 |
| --- | --- |
| Pure module | `cd18361c2d6683b4ed7e3214938b5cd4e7c600d782b37b6fd1b429ce6f32aa02` |
| Guarded installer | `9aecd6d7e40c969cc5fa61a53b9bd2c9af02f450fe8bd1d2ad625bc56da20cc0` |
| Original pure tests | `17227f195521585826b485866773c4abb6568ad7efc2a6344b699b0762839af1` |
| Ownership regression | `b0ebcd247d79ef218e6b3a55ee516ea59fab6a3c0a2673ef6509c47f446aa6a9` |
| Temporary workflow | `c0878345e39b3b0fd7a1962f19caf78fe05d29619905823fb2cae4e0dbe0c490` |

The temporary hook runs the two frozen suites, captures the one guarded installer under a
four-minute step and 200-second outer process limit, retains only the bounded receipt/manifest
for seven days, then enforces the original outcome. Its first-open same-repository branch fence
prevents pushes, synchronize, reopen, main or manual reruns from repeating the action. Existing
Node 22 project checks remain unchanged outside this availability action. No target Node 24 or
bundled npm is placed on PATH or invoked.

The original npm source and both previous raw receipts remain unchanged. Syntax parsing and
whitespace checks passed without executing the installer. At that implementation checkpoint, renewed independent review of the
corrected ownership logic, final source binding and prospective Project State was still required,
followed by fresh coordinator admission. No download, cache installation or actual result has
occurred at this checkpoint.

Independent Bashir renewed pre-execution review returned **PASS** against the exact final code,
tests, temporary workflow and prospective Project State. The earlier BLOCKED ownership finding
and its red-to-green correction remain recorded. No required fixes remain before fresh admission.
This is readiness for the sole approved action; no archive has been acquired, installed or run.
