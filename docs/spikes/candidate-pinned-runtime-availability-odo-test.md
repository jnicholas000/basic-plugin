# Exact pinned runtime availability — independent Odo ownership

Feature slug: `candidate-catalog-parity`. Date: 2026-11-05.
Checkpoint: **TESTS_FROZEN / PRODUCER_NOT_STARTED**.
Basis: `677cb492b15ecc951510407d42247ee7b28ee738`.

Odo actually re-read the installed Starfleet Crew 0.2.0
`references/canon/agents/odo-behavioral-integrity-testing.agent.md`, reused its already-read core,
harness and tool contracts, and read Data's [approved handoff](candidate-pinned-runtime-availability.md).
The historical one-action plan hash matches
`aab47f287915979d88c895d3aae64037a67cfd856816e546f94cd88066dfc516`.
This bounded scope follows the approved temporary acquisition, exact-cache byte verification and
owned cleanup action; target Node/npm execution and another npm-control attempt remain excluded.

Only the independent test and this note are Odo-owned repository changes. No producer or workflow
existed for inspection. The coordinator-selected spike note location overrides the role's generic
testing-artifact location for this handoff. Bashir retains readiness judgment.

## Frozen contract and fixture

[fixtures/test_pinned_runtime_availability.py](fixtures/test_pinned_runtime_availability.py)
SHA-256: `17227f195521585826b485866773c4abb6568ad7efc2a6344b699b0762839af1`.

The suite imports only the three Data-selected pure validators from the future
`pinned_runtime_availability.py`: `validate_acquisition_policy`, `validate_archive_entries` and
`validate_availability_evidence`. Closed shapes and exact values follow Data's handoff; validators
return the specified result, preserve caller data, perform no I/O, and reject invalid input with
`ValueError`. Numeric fields require integers with booleans excluded; boolean fields require
booleans. Cache header/npm sizes are synthetic record data, not invented historical lengths;
actual byte hashes and bounded reads belong to the wrapper.

Archive fixtures are small inert dictionaries, not executable archive content. Record-only size
vectors simulate large files without allocating file bodies. The top directory accepts its exact
prefix with or without a trailing slash, only as a directory. Child paths normalize no unsafe
components; duplicate normalized destinations, foreign roots, file/link ancestors and invalid
complete-table link graphs reject. Strip one prefix, retain accepted npm/bin/.bin links, return
ancestor directories before their children and all regular entries before links. Top directory
alone is omitted. Depth32 is measured after prefix stripping; path bytes include the archive name
and must also bound stripped paths and link targets at4096 UTF-8 bytes.

Peak-disk admission additionally enforces the agreed conservative table bound without a new API:

- `D`: distinct directory paths including stripped root, explicit directories and implicit parents.
- `F`: sum over regular files of `max(4096, ceil(size/4096)*4096)`.
- `L`: symlink count. `R`: count of stripped records, including explicit directories and links.
- One copy estimate `C = F + 4096*D + 4096*L + 4096*R`.
- Peak estimate `96 MiB + 2*C + 16 MiB` must be <=`1288490188` bytes before member writes.

This accounts for archive, two tree footprints and allocation reserves. It is paired with the
wrapper's required filesystem fragment-size <=4096 admission and bounded owned `st_blocks`
measurements, not represented as a guarantee from record arithmetic alone. Unsupported filesystem
accounting stops without workaround. No fourth API or general I/O framework is introduced.

## Focused requirements and initial observations

| Group | Test case and expected result | Observed result | Status |
| --- | --- | --- | --- |
| 1 | Exact source/digest/destination and all budgets accepted; substitutions, relaxed ceilings, retries/redirects/resume, missing/extra fields and wrong scalar types reject | Authored before producer | NOT EXECUTED |
| 2 | Valid complete table strips one root, preserves all records/modes and orders owned writes before links without input mutation | Authored before producer | NOT EXECUTED |
| 3 | Traversal, unsafe/foreign names, hardlink/special types, set-id, duplicate destinations, non-directory ancestors and malformed records reject | Authored before producer | NOT EXECUTED |
| 4 | Legitimate npm and .bin internal links/chains accepted; absolute, escaping, dangling, cyclic and link-ancestor destinations reject | Authored before producer | NOT EXECUTED |
| 5 | File192MiB/depth32/aggregate512MiB record boundaries accepted where peak estimate fits; independent count/path/UTF-8/file/aggregate and combined disk-overhead excess reject | Authored before producer | NOT EXECUTED |
| 6 | Exactly three cache and nine runtime identities accepted, including both loader labels; substitutions, hash/size drift and missing/extra/duplicate records reject | Authored before producer | NOT EXECUTED |
| 7 | Marker/source/cleanup record truth required; missing, false, unknown cleanup, remaining owned paths or assumed-ownership extras reject | Authored before producer | NOT EXECUTED |
| 8 | Separate independent wrapper review must establish one GET after seven system identities, headers before body, digest and complete table before extraction, exclusive ownership, marker last, source preservation, deadlines, disk accounting and owned cleanup | Producer absent; no operational seam or wrapper exists yet | NOT EXECUTED |

Group7 tests only the final evidence predicate. It cannot establish marker-last ordering or cleanup
ownership from self-reported booleans. Group8 remains independent source/operational review, not a
pure-test pass; actual one-transfer/install evidence remains separately gated. No ceremonial eighth
pure test is substituted for those obligations.

### Initial test loader

- Requirement: keep implementation absence distinct from behavioral rejection.
- Test Case: one `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s docs/spikes/fixtures -p test_pinned_runtime_availability.py` using existing host Python.
- Expected Result: module loader stops before assertions because the producer is absent.
- Observed Result: exit1, `ModuleNotFoundError: No module named 'pinned_runtime_availability'`;
  unittest reports one loader error and zero behavioral assertions. No producer or fixture ran.
- Status: PASS

## Handoff and limits

Scotty receives the frozen tests before implementation and must not rewrite them around producer
behavior. Run the focused pure suite after implementation; independently review the wrapper's
ordered operational paths before fresh coordinator source/resource admission. A critical contract
conflict returns through Data/Odo. No runtime download/install, live cache-path I/O, target execution,
network, Docker, security probe, publication, Git mutation or production change occurred here.
Tool classes: repo-reader for actual role/plan reads; artifact-writer for owned tests/evidence;
test-runner for the single missing-module loader result. Actual action and readiness remain unproven.
