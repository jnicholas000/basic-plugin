# Candidate Catalog Consumed-Field Contract

Feature slug: `candidate-catalog-parity`. Resumed slice: **local projection only**.
Base `cbf6666ed1ed82ba9935a9b884ac5842caf5a36d`; upstream shape reference
`6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`. Complete for this inert projection handoff,
not for overlay activation, upstream execution or UI parity. The execution spike stays unresolved.

## Bound Sources And Observable Outcome

Add `eng/project-local-catalog.mjs`, exporting synchronous `projectLocalCatalog({ root = cwd } = {})`.
Read the immutable local Git HEAD tree as data, never execute source, hooks, install/config/build
scripts or skill assets. Use the existing `digest`/`safePath` primitives when suitable. Do not add
packages or a generic YAML framework. Reject unknown API options/CLI arguments. CLI runs on cwd,
prints one JSON result plus LF, and on any rejection prints only `Local catalog projection failed.`
to stderr with exit 1 and no stdout. No output/ref/repository/role override and no filesystem writes.

Inputs: `plugin.json`, `marketplace/index.json`, `README.md`, immediate
`com.github.copilot/agents/*.agent.md` and all tracked files below each `skills/<id>/` with its
root `SKILL.md`. Resolve HEAD once to a full commit; read ordinary Git blobs and dates from that
commit, not working-tree edits or filesystem mtimes. Reject symlinks/submodules in consumed inputs,
unsafe paths, nested agent resources, malformed/missing metadata and empty inventory. Do not read
upstream data, other roots, credentials or untracked files. Root is the sole explicit API input for
an authorized checkout/fixture; CLI has no arguments.

Match exactly one local marketplace plugin to the manifest's name, version, description, repository
and homepage. The repository is `https://github.com/jnicholas000/basic-plugin`; manifest name is
`basic-plugin`. Require the v1 manifest/index schema and local source. Capabilities are nonnegative
safe integers: actual agent/skill counts must agree; prompts/instructions are zero for this contract.
Reject foreign/additional plugin rows, unknown capability keys and any tracked files under the
unsupported root `prompts/`, `instructions/` or `extensions/` categories. Require at least one
agent or skill overall. Missing data must fail, not masquerade as an empty category.

## Consumed Fields And Local Mapping

The pinned `site-data.ts`, list components, detail routes, `searchIndex.ts`, `detail-page.ts`,
`eng/generate-website-data.mjs` and `eng/yaml-parser.mjs` were inspected as source, not executed.

| Output / consumer | Required or consumed fields | Local source and semantics |
| --- | --- | --- |
| `agents.json`; AgentsCatalog; agent detail/loadDetailPage | id, title, description, path, filename, lastUpdated; optional model/tools; filters.models/tools | id from the immediate filename without `.agent.md`; required frontmatter name/description; path and filename from Git; optional model string or string array and tools string array from the supported header subset; absent tools is a declared empty list. Git last-change date for the agent file. Derive sorted unique facets. |
| `skills.json`; SkillsCatalog; skill detail | id, name, title, description, path, skillFile, files[path/name/size], assets, hasAssets, assetCount, lastUpdated | Folder slug equals required frontmatter name. Title deterministically title-cases hyphenated name. List all ordinary tracked files with byte sizes, sorted by path; `name` is skill-relative. Assets are skill-relative non-SKILL files excluding `bin`/`obj` directories, matching pinned asset semantics; files still includes the full inventory. Last-change date is for SKILL.md, matching upstream. |
| `plugins.json`; PluginsCatalog; direct plugin detail JSON | id, name, description, path, version, tags, itemCount, items[kind/path/title/detailUrl], readmeFile, repository/homepage/author/license, lastUpdated | Root manifest and matching generated row; id/name from manifest, `path: "."` explicitly denotes this repository-root plugin, README.md is the body reference. Keywords become tags; included items derive only from projected agents/skills and counts agree. `external: false`; do not inject upstream `ExternalSource` or reclassify local data to dodge link overlays. Missing optional author/license remain null. Last-change date for plugin.json. |
| `instructions.json`, `extensions.json` | `{items}`; instruction filters.patterns/extensions | Empty only because this declared inventory has none and capabilities confirm zero. Unsupported newly present categories reject. Include empty instruction facets; no placeholder upstream entries. |
| `search-index.json`; buildSearchIndex | type, id, title, description, path; optional lastUpdated/searchText/tags | Exactly one generated record per projected resource: current baseline is four records. Skill path points to SKILL.md; plugin path is the explicit root marker. No static page/article records, no hidden Learning Hub/contributor destinations. Original helper still adds static pages and requires the later overlay. |
| counts and provenance | five category counts; source, inputs, contentDigest; contributor/install limitations | Counts equal arrays. Source binds the repository, full HEAD commit and shape ref. Inputs list consumed Git paths/modes/sizes/SHA-256, sorted by path. No current timestamp/absolute root. Hash only deterministic payload for contentDigest. Contributor total and unverified install actions remain unknown, not invented zero/actions. |

Agent/skill/detail body references remain paths; this slice neither copies bodies into the vendored
candidate nor renders Markdown/HTML. All local source/download URLs, if emitted, use this repository
and resolved commit, never upstream defaults or untrusted protocols. Plugin-root URL is a fixed
special case, not an accepted filesystem traversal. Runtime UI still needs the planned asserted
source/install/nav overlays; the guard prevents treating these data as an integrated website.

## Supported Header Subset

Only the existing flat frontmatter representation is in scope: exact `---` delimiters, unique
single-line top-level keys, required name/description plain or single/double-quoted strings,
optional agent model string/string-array and tools string-array (inline). Quoted apostrophes and
JSON double-quote escapes must preserve values. Nonempty strings are required; reject unsupported
block/nested/anchor/tag/merge notation, malformed/duplicate fields or wrong types instead of
silently dropping semantics. Other flat keys are inert data and confer no permissions. Bodies and
assets are never evaluated. Document this as a narrow accepted subset, not a full YAML parser.

## Exact Result And Integration Boundary

Return a JSON-serializable object with:

- `status: "LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE"`, `schemaVersion: 1`;
- `source: { repository: "jnicholas000/basic-plugin", commit, upstreamShapeRef }`;
- `files` mapping the six filenames above to payloads; counts for agents/skills/plugins/instructions/extensions;
- `inputs` sorted records `{ path, mode, size, sha256 }` covering all consumed source bytes;
- `observationLimits: { contributorsTotal: null, installActions: "UNVERIFIED", integration: "NOT_ACTIVATED" }`;
- `contentDigest`, SHA-256 of JSON.stringify of the entire result before adding contentDigest.

Dates come only from `git log -1 --format=%cI <resolved-commit> -- <path>`; require a valid nonempty
value. Ordering is deterministic ASCII, not host locale. Repeated calls for the same commit match;
new commits deliberately change commit-bound provenance/URLs. Reading a dirty checkout still projects
its declared committed HEAD; this must be explicit to users, not called a snapshot of uncommitted work.

## Acceptance, Role Ownership And Stops

1. [OBSERVABLE_OUTCOME] Independent tests precede implementation: a committed synthetic fixture
   produces every supported field, correct counts/content references/dates, deterministic CLI/API
   output and hashes; the positive control must succeed before negative cases are credited.
2. [SECURITY_PROPERTY] Reject count/source/schema/path/mode/frontmatter/unsupported-category errors;
   do not execute an inert script marker or read untracked additions. No output or protected-byte mutation.
3. [OBSERVABLE_OUTCOME] One real read-only projection at the frozen consumer produces one plugin,
   one agent, two skills and four search records, all bound to actual source hashes. No web build.
4. [MANUAL_VERIFICATION] Independent readiness checks field/source coverage, first test outcomes,
   safety limits and exact protected bytes; ordinary CI runs the new focused suite via a package
   script in the existing trusted build. No workflow/dependency change.

Allowed implementation surfaces: new projector; independent `tests/local-catalog-projection.test.mjs`;
package test/build script; this field contract/nearest plan and same-scope implementation/test/review
records; material PROJECT state. Tests are test-owner-only. Accepted config/overlay/pins/generated
roots, publication workflows and installed runtimes are forbidden changes. Caller may persist stdout
outside the repository as operational evidence; projection itself writes nothing.

Use three initial role owners (independent tests, implementation, readiness), at most one correction
and one delta rereview within the fixed allocation. Stop before new role work at the resource ceiling,
source/owner drift, missing metadata, new dependency/runtime need or authority conflict. Keep first
returns and partial outcomes. This is one useful single-path delivery, without a matched normal-path
comparison, hidden input/model attestation, benefit measurement or full Mission 9/10 acceptance.

## PR-Review Provenance Clarification

After the original bounded implementation/review cycle, automatic PR review demonstrated that
a shallow checkout can return a history-boundary date for unchanged resource blobs at the same HEAD.
The original freeze and first results remain retained; this later repair is not backdated as a
predeclared control or a passing original correction-limit result.

The existing actual-date/determinism requirement therefore needs complete local Git history. Reject
a shallow repository before deriving records; do not fetch/unshallow it or invent dates. Use Git's
documented `--no-lazy-fetch` read mode so unavailable objects cannot trigger an implicit remote fetch.
The installed Git must support these controls; unsupported controls fail closed, with no automatic
upgrade or configuration change. This changes no site/host/security permission and grants no upstream
execution authority. The additional requirement control and bounded PR repair are separately
attributed in the test/implementation/review records.
