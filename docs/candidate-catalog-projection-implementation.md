# Candidate Catalog Projection Implementation

Slice: inert local projection for `candidate-catalog-parity`, following the
[consumed-field contract](candidate-catalog-field-contract.md). The handoff supplied sufficient
source, field, ownership and verification boundaries.

`eng/project-local-catalog.mjs` exports synchronous `projectLocalCatalog({ root })`, defaulting
to cwd. It resolves Git HEAD once and reads only the declared manifest, marketplace index, README,
immediate agents and complete skill inventories as immutable blobs. Literal Git pathspecs bind
resource dates to exact paths and that same commit. Working-tree edits and untracked additions
are deliberately excluded; this is a projection of committed HEAD.

The projector validates the single matching local plugin, capability totals, ordinary Git modes,
safe resource paths and required metadata. Its header parser accepts only flat strings and inline
string arrays, including single-quoted apostrophes and JSON double-quote escapes. It rejects
unsupported header structures instead of interpreting general YAML. Agent model/tool facets,
skill file sizes/assets, plugin items and search records derive from the same inventory. Source
paths, modes, byte sizes, hashes and Git dates bind the deterministic JSON result to its inputs.
Plugin authors normalize a supported string to `{ name: value }`, preserve a supported object
with a nonempty string name and optional nonempty string URL, and remain null when absent.

```sh
node eng/project-local-catalog.mjs
npm run test:local-catalog-projection
```

The CLI takes no arguments and prints one JSON result plus LF. Rejections produce only the fixed
generic stderr diagnostic and exit 1. Projection writes no files and executes no source bodies,
assets, skill scripts or upstream code. The package test script is included in the existing trusted
build; workflows and other build commands are unchanged.

## Implementation verification

- The first implementor focused run returned 0/3 successful because date validation rejected the
  Git implementation's valid UTC `Z` form. That first result was retained. The bounded repair accepts
  `Z` or numeric offsets while preserving the original Git date; the subsequent focused run completed
  with 3/3 successful. No independent tests or test-owner record were edited, and no unrelated suite
  was rerun. This is implementation verification, not an independent testing or readiness verdict.
- Independent review found that an accepted string author was emitted as a string although the
  pinned consumer requires an author object. The test owner added an append-only control: before
  correction, 3/4 tests succeeded and the string-author assertion failed after the absent/object
  controls succeeded. The reserved correction normalizes string authors to `{ name: value }` and
  checks the optional object URL's string type. One subsequent focused run completed with 4/4
  successful; the independent test source and record were not changed by the implementor.
- One real read-only CLI projection used actual input HEAD
  `cbf6666ed1ed82ba9935a9b884ac5842caf5a36d`, producing one agent, two skills, one plugin, no
  instructions/extensions and four search records from 24 consumed inputs. Recorded byte sizes and
  hashes matched the committed blobs. Result digest:
  `2c5feb2193c266c2f28ce5232ba740855c7073b393ba00210a9ee8ae9fee662c`.
  One corrective read-only projection retained that same HEAD, digest and byte-identical stdout:
  the real manifest already has a supported object author. Earlier raw results remain retained.
- All 97 protected files remained byte-identical, including the throwing catalog guard, accepted
  configuration/output, pins, workflows and production adapter. Independent tests retained their
  test-owner hashes during each implementation run. Raw projection, test runs, code hashes and
  protected-byte evidence are held separately, including separate corrective receipts.

No implementation blocker remains. The result is `LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE`;
contributor total remains unknown, install actions remain unverified and integration is not activated.
No upstream build, dependency installation, browser parity, overlay activation or publication was
performed. The unresolved execution spike and future candidate integration remain separate gates.
Next handoff is independent source/projection review.
