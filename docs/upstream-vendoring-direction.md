# Upstream Vendoring Direction

> Status: planned follow-up to the current Awesome Copilot structural-adapter baseline  
> Last reviewed: 2026-09-26

## Decision

Basic Plugin should evolve from a hand-authored structural adapter toward a **vendored Awesome Copilot website plus a thin, assertive local overlay**.

The current adapter remains useful evidence: it proved the architecture boundary, generated-site contract, upstream pinning, and change-classification workflow. The next implementation should use the upstream website itself as generated input instead of continuing to reproduce upstream structure by hand.

This document records the target architecture only. It does not claim the vendoring engine has been implemented yet.

## Target flow

```text
resolve candidate Awesome Copilot SHA
        ↓
read-only static preflight
(compare metadata, dependency shape, paths, rename/removal risk)
        ↓
architecture / indeterminate → stop automated candidate execution
        ↓
routine / review → credential-free validation sandbox
(vendor as data → prune → local overlay → build → smoke → clone checks)
        ↓
trusted artifact-only validation
(pinned private AQC validates sandbox-produced artifacts as data; no candidate scripts)
        ↓
final evidence classification
        ↓
write-capable orchestration consumes evidence only
(PR / issue / accepted-baseline decision)
        ↓
publish generated site only after the reviewed baseline moves
```

The trust boundary is intentional: **no upstream candidate code executes in a job that has repository
write permission, private AQC credentials, publication credentials, or other secrets.**

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
| `routine` | Only explicitly allowlisted non-executable content/assets changed; no implementation, route, config, manifest, dependency/lockfile, build-tooling, install/data, or overlay-target surface changed. | Eligible for automatic advancement only after the full artifact-promotion trust boundary exists; until then require human merge. |
| `review` | Any executable/behavioral surface changed without proving an architecture replacement, including implementation, route, config, manifest, dependency/lockfile, build tooling, install/data, overlay targets, or renames. | Open/update a PR and require human review. |
| `architecture` | Framework shape/major version or enough local integration points/consumed implementation surface changed that the adapter must be reconsidered. | Do not advance the accepted baseline; treat as a migration. |
| `indeterminate` | Evidence is incomplete, truncated, validation failed, or the overlay outcome is unknown. | Fail the automation and require a human classification. |

Classification should be a pure function of captured evidence so recorded scenarios can be replayed deterministically.

Policy belongs in configuration rather than code. Candidate policy should include:

- an explicit allowlist of non-executable paths/extensions that may qualify for `routine`;
- an explicit deny/review set for implementation, route, config, manifest, dependency/lockfile,
  build-tooling, install/data, and overlay-target surfaces;
- architecture thresholds based on implementation-file count and share of the consumed surface;
- number of lost overlay integration points;
- framework/dependency patterns; and
- explicit install/data/config surfaces.

A small diff is not sufficient to make executable upstream code `routine`. Size thresholds may help
distinguish `review` from `architecture`, but they must not downgrade executable changes into the
automatic path.

Commit subjects and release labels are context, not evidence.

## Candidate evaluation flow

A candidate upstream SHA should be resolved once and reused for every step in that evaluation.

### Phase 1: static preflight, no candidate execution

Run with read-only repository access and no private credentials.

1. Resolve the candidate SHA once.
2. Compare accepted → candidate using metadata only.
3. Fetch dependency manifests and other specifically required text/config files as data.
4. Evaluate framework/dependency changes, rename/removal risk, overlay-target/integration-point changes,
   diff truncation, and other static classifier signals.
5. Produce a content-addressed, immutable-by-convention evidence artifact for later jobs; do not require a signing key unless the implementation introduces a concrete signing mechanism.

If static evidence already establishes `architecture` or `indeterminate`, stop the automated candidate
execution path. A separate write-capable orchestration job may create/update the migration issue from
the evidence, but it must not execute candidate code.

### Phase 2: credential-free candidate validation

Only candidates that pass the static preflight into the `routine` or `review` validation path may
be prepared automatically.

Run this phase in a job/container with:

- no repository write permission;
- no private AQC token or publication credential;
- no persisted checkout credential; and
- no secrets exposed to candidate-controlled build code.

Then:

1. vendor the candidate as data without changing the accepted baseline;
2. apply the locally trusted overlay;
3. build the site in the sandbox;
4. run deterministic clone validation;
5. run browser smoke coverage; and
6. run only validation that is safe in the credential-free environment.

Because an Astro/config/build pipeline can execute repository JavaScript, this entire phase is treated
as untrusted code execution even when the static preflight class looked routine.

### Phase 3: trusted artifact-only validation

Private AQC currently requires trusted repository access. Keep that credential out of the candidate
sandbox.

A separate trusted job may:

1. checkout the immutable-pinned AQC engine with the minimum read credential;
2. download the sandbox-produced source/catalog/site artifacts into an isolated data directory;
3. run AQC validations that treat those artifacts as data; and
4. publish only validation results/evidence for orchestration.

It must not run candidate package scripts, Astro builds, repository hooks, or other candidate-controlled
executables. If a future AQC check requires executing candidate code, that check belongs back in the
credential-free sandbox or needs a separate explicitly sandboxed design.

### Phase 4: final classification and orchestration

Combine static evidence with overlay/build/smoke and trusted artifact-validation outcomes and run the final pure classifier.

- `routine`: a later write-capable job may create/update the sync PR and enable the configured merge
  path, but must consume prepared evidence/artifacts rather than execute candidate code.
- `review`: create/update a PR for human review; no automatic baseline advancement.
- `architecture`: leave the accepted baseline unchanged and create/update a migration task.
- `indeterminate`: fail closed and require human classification.

A routine result is not sufficient by itself. Every required gate must also be green, and the accepted
baseline moves only through the explicitly authorized orchestration path.

### Post-merge execution boundary

The trust boundary continues **after merge**.

Once the site build can execute vendored upstream JavaScript, no credential-bearing push-to-`main`
workflow may rebuild that site from source. In particular, publication and private-quality jobs must not
run a build command that transitively executes vendored upstream code while holding repository write
permission, `AQC_READ_TOKEN`, publication credentials, or other secrets.

Before automatic routine merges are enabled at all, choose and prove one of these post-merge patterns:

1. **Artifact promotion:** the credential-free candidate sandbox produces immutable/content-addressed
   site and marketplace outputs. Trusted AQC validates those outputs as data. After merge, credentialed
   publication promotes the already-validated outputs without rebuilding them.
2. **Equivalent isolation:** redesign post-merge workflows so every vendored-code execution still occurs
   in a credential-free job, and only resulting validated artifacts/evidence cross into credentialed
   publication jobs.

Even after that boundary is implemented, automatic merge is limited to the configured non-executable
allowlist. Any change that can alter executable vendored website/build behavior requires human review.

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

1. Preserve merged PR #10 as the proven structural-adapter baseline.
2. Add neutral vendoring configuration, read-only preflight classification, sync tooling, provenance manifest, and assertive overlay.
3. Add the credential-free candidate sandbox and separate trusted artifact-only AQC validation boundary.
4. Vendor the current reviewed Awesome Copilot SHA and reproduce the required Basic Plugin site behavior.
5. Compare the vendored output with the current adapter and remove the hand-authored site implementation only after parity is established.
6. Replace the current three-state classifier with the evidence-based four-state model.
7. Derive integration points from overlay rules and add recorded classifier fixtures.
8. Add production-build browser smoke coverage.
9. Convert post-merge quality/publication to artifact promotion or an equivalent no-reexecution trust boundary.
10. Enable routine automatic baseline advancement only for the explicit non-executable allowlist and only after the full preflight/sandbox/trusted-validation/post-merge path has demonstrated safe behavior.

This sequence intentionally keeps the migration reversible and prevents the design lesson from becoming an overnight rewrite.
