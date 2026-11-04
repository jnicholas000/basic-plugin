# Candidate Materialization Implementation

Slice: `candidate-materialization`, based on consumer `0dbb78e` and the frozen
[plan](candidate-materialization-plan.md).

The opt-in `eng/materialize-candidate.mjs` entry point exports
`materializeCandidate({ repository, localRoot })`, with `localRoot` defaulting to cwd.
It binds the candidate repository, accepted SHA and overlay to the accepted configuration,
enforces the fixed copy/prune/required-file lists and empty keep list, and checks ordinary,
nonempty required Git blobs before invoking the existing `vendor()` implementation.
Configuration reads and the fixed output stay below the owned local root. Unknown API
options, CLI arguments and `UPSTREAM_HEAD` are rejected. CLI errors are bounded generic text.

```sh
UPSTREAM_REPO_DIR=/approved/read-only/git node eng/materialize-candidate.mjs
```

The command prints one JSON result with status `MATERIALIZED_UNVALIDATED_SITE` and ordinary
vendor provenance. Output is always the ignored `website/vendor-candidate/`, with candidate
role and the accepted immutable ref. It reuses the accepted overlay and existing throwing
catalog guard without modifying the accepted generator, configuration or defaults.

## Implementation verification

- One implementor run of `node --test tests/vendor.test.mjs` completed with 11 tests successful.
  The prewritten positive and negative candidate controls exercise deterministic replacement,
  required-input loss, configuration disagreement, overrides, exclusions, inert source copying
  and sanitized CLI errors. This run is implementation evidence, not an independent testing verdict.
- One real generation from `github/awesome-copilot` at
  `6c4d33b9cfca967a28bb2962ef4d55e4a384c88c` produced 121 inventoried files and one provenance file.
  All 12 required inputs were present and nonempty; every inventoried file matched its recorded
  hash and byte count. Content digest:
  `c734249d8b2f41de284962a0dee1082a1544450af27f5becd09146f31e3feeb9`.
- All 91 preexisting tracked files were byte-identical before and after, including the accepted
  config, overlay, generated seed, baseline and production adapter. The copied catalog guard
  exactly matched its local source.
- Root agents, prompts, instructions and skills catalogs were absent, as were upstream public
  data, source content, learning-hub pages and learning-hub images. Generated candidate state
  remains ignored. Full stdout, provenance and byte-comparison receipts are retained separately.

The handoff supplied sufficient API, source and verification boundaries. No dependency installation,
upstream script/config execution, browser run or publication was needed. No implementation blocker
remains. Build compatibility, browser behavior, local catalog integration and site parity remain
unvalidated; this materialization does not advance the accepted baseline or establish a website pass.
The slice is ready for the separately owned testing and review handoff.
