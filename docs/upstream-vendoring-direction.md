# Upstream Vendoring Direction

> Status: planned follow-up to the current Awesome Copilot structural-adapter baseline  
> Last reviewed: 2026-09-26

## Decision

Basic Plugin should evolve from a hand-authored structural adapter toward a **vendored Awesome Copilot website plus a thin, assertive local overlay**.

The current adapter remains useful evidence: it proved the architecture boundary, generated-site contract, upstream pinning, and change-classification workflow. The next implementation should use the upstream website itself as generated input instead of continuing to reproduce upstream structure by hand.

This document records the target architecture only. It does not claim the vendoring engine has been implemented yet.

## Target flow

```text
reviewed Awesome Copilot SHA
        ↓
vendor selected upstream website/tooling
        ↓
prune content Basic Plugin does not publish
        ↓
apply assertive local overlay
        ↓
inject Basic Plugin catalog data
        ↓
build + browser smoke + clone checks + AQC
        ↓
publish generated site
```

The Awesome Copilot **resource catalog is never an implicit input**. Basic Plugin's own authored artifacts and generated marketplace data remain authoritative for what the site publishes.

## Vendoring contract

The follow-up implementation should introduce one reviewed configuration describing:

- upstream repository and full accepted commit SHA;
- paths copied from upstream;
- paths deliberately pruned;
- narrow `keep` exceptions for assets still required by retained pages; and
- the local overlay entry point.

The vendored tree is generated state:

- never hand-edit vendored files;
- replace owned vendored roots wholesale on every sync so deleted upstream files cannot survive locally;
- record the exact upstream SHA used;
- record whether the tree represents the accepted baseline or a candidate;
- record copy/prune/keep inputs and overlay rule count; and
- record a deterministic content digest and file count so rebuild drift is visible.

The personal repository must not copy work-only registry URLs, internal hosts, enterprise identities, or other private configuration.

## Assertive overlay

Local site changes should live in one small overlay layer rather than a fork of upstream implementation.

An overlay rule should identify:

- the file or bounded directory it targets;
- the intent of the change;
- the expected text/pattern or whole-file replacement; and
- whether failure to match is allowed.

Default behavior is **fail closed**: if a required rule cannot find its upstream target, vendoring fails. An upstream refactor must therefore become an explicit migration problem instead of silently producing a partially customized site.

Whole-file replacement should be reserved for places Basic Plugin intentionally owns. Normal customization should prefer narrow replacements.

## Integration points

The classifier should derive named architecture/integration points from the overlay rules themselves.

A separate manually maintained list of "critical files" should not be the primary source of truth because it can drift away from the customization layer. Static baseline metadata may still describe the reviewed architecture, but the executable overlay should define what local behavior actually depends on.

Directory-wide sweep rules should not automatically make every file in that directory an integration point.

## Candidate classification

The target classifier has four outcomes:

| Class | Meaning | Default action |
| --- | --- | --- |
| `routine` | Only low-risk consumed content/assets or small implementation edits changed; overlay and validation still pass. | Candidate may advance automatically only after every required gate passes. |
| `review` | A consumed implementation/config/install surface, dependency shape, overlay target, or rename changed without proving an architecture replacement. | Open/update a PR and require human review. |
| `architecture` | Framework shape/major version or enough local integration points/consumed implementation surface changed that the adapter must be reconsidered. | Do not advance the accepted baseline; treat as a migration. |
| `indeterminate` | Evidence is incomplete, truncated, validation failed, or the overlay outcome is unknown. | Fail the automation and require a human classification. |

Classification should be a pure function of captured evidence so recorded scenarios can be replayed deterministically.

Numeric policy belongs in configuration rather than code. Candidate thresholds include:

- maximum implementation files/changed lines for routine handling;
- architecture thresholds based on implementation-file count and share of the consumed surface;
- number of lost overlay integration points;
- framework/dependency patterns; and
- explicit install/data/config surfaces.

Commit subjects and release labels are context, not evidence.

## Candidate evaluation flow

A candidate upstream SHA should be resolved once and reused for every step in that evaluation:

1. vendor the candidate without changing the accepted baseline;
2. apply the overlay;
3. build the site;
4. run deterministic clone validation;
5. run browser smoke coverage;
6. run AQC;
7. classify the same candidate from captured evidence; and
8. only then decide whether the accepted baseline may move.

A routine result is not sufficient by itself. Every required gate must also be green.

## Browser smoke direction

The follow-up site implementation should add browser-level validation over the production build, focused on behavior that static generation checks cannot prove:

- home and catalog routes load;
- expected resource/detail routes resolve;
- local status labels render;
- search returns local artifacts;
- mobile layout does not overflow;
- artifact/download/install links point where expected;
- browser console errors fail the test; and
- unexpected external network requests fail the test.

This remains clone-specific Basic Plugin validation. Reusable security/governance checks still belong in AQC.

## Official / Experimental lifecycle direction

Use a central repository-path registry for Experimental artifact metadata rather than adding Basic Plugin-specific frontmatter fields to every artifact format.

Candidate metadata:

- owner;
- lifecycle status;
- added date;
- optional review date; and
- notes.

The registry is metadata, not policy enforcement.

**No automatic meaning is assigned to `reviewBy` yet.** Reaching that date must not silently remove, block, promote, or deprecate an artifact until a lifecycle policy is explicitly decided.

Official and Experimental presentation remains a Basic Plugin/site concern. Reusable lifecycle validation belongs in AQC.

## Behavioral evaluation direction

Keep evaluation scenarios and evidence runner-neutral.

Waza is the likely long-term evaluation runtime if/when its maturity is sufficient for the repository's needs. Do not build a permanent custom Copilot CLI evaluation framework merely to avoid a temporary pre-1.0 limitation.

Until a durable runner is selected:

- preserve portable scenarios;
- keep manual smoke evidence distinct from behavioral evals;
- attach results to the artifact/version tested; and
- keep AQC as the intended reusable evaluation entry point.

## Explicitly not copied from work

Portable engineering patterns may inform Basic Plugin, but the following stay outside this repository unless independently required for a personal environment:

- company branding or internal URLs;
- private package registries and network routing;
- enterprise credentials or machine identities;
- internal artifact-hosting workarounds;
- enterprise deployment topology;
- company-specific approval semantics; and
- work-only governance policy.

## Migration sequence

1. Finish the current structural-adapter PR and preserve it as the proven baseline.
2. Add neutral vendoring configuration, sync tooling, provenance manifest, and assertive overlay.
3. Vendor the current reviewed Awesome Copilot SHA and reproduce the required Basic Plugin site behavior.
4. Compare the vendored output with the current adapter and remove the hand-authored site implementation only after parity is established.
5. Replace the current three-state classifier with the evidence-based four-state model.
6. Derive integration points from overlay rules and add recorded classifier fixtures.
7. Add production-build browser smoke coverage.
8. Enable routine baseline advancement only after the full candidate path has demonstrated safe behavior.

This sequence intentionally keeps the migration reversible and prevents the design lesson from becoming an overnight rewrite.
