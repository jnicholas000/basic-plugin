# Candidate Materialization Plan

## Bounded Outcome

Feature slug: `candidate-materialization`. Prepare an opt-in inert source bundle from the existing
reviewed Awesome Copilot ref. Reuse `vendor()`; keep the structural adapter as production and the
existing throwing local-catalog overlay intact. Result is `MATERIALIZED_UNVALIDATED_SITE`, never
website build, browser parity, accepted-baseline advancement or release acceptance.

Consumer base: `0dbb78e2100592ce50b8437d02ceaf18b5f661e7`.
Upstream: `github/awesome-copilot` at `6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`.
The upstream bare Git object store is read-only input. No package/config/build script is executed.

## Source Contract And Authority

`PROJECT.md`, `UPSTREAM_POLICY.md`, `docs/upstream-vendoring-direction.md` and `docs/vendor-slice.md`
retain authority. This slice owns only the new candidate config/helper, bounded existing vendor
tests and same-slug evidence plus material Project State reconciliation. It does not change
accepted config/overlay/generated roots, dependency pins, workflows, permissions or publication.
No dependencies, browsers or host services are installed. No external agents are contacted.

The initial proposed candidate-only adapter is unnecessary here: reuse the existing guard rather
than weaken it or replace the local catalog before the separately reviewed parity migration.

## Frozen Command Contract

- New `website/candidate-materialization.config.json` uses the existing vendor config shape plus
  nonempty `requiredPaths`. Its repository/acceptedSha/overlay must match accepted config.
- Exact copy roots: `.all-contributorsrc`, `LICENSE`, `website/package.json`,
  `website/package-lock.json`, `website/astro.config.mjs`, `website/tsconfig.json`, `website/src`,
  `website/public/fonts`, `website/public/images`.
- Prune `website/public/data`, `website/src/content`, `website/src/pages/learning-hub`, and
  `website/public/images/learning-hub`; keep is empty. No upstream root resource catalog is copied.
- Required retained files: `.all-contributorsrc`, `LICENSE`, `website/package.json`,
  `website/package-lock.json`, `website/astro.config.mjs`, `website/tsconfig.json`,
  `website/src/pages/index.astro`, `website/src/lib/site-data.ts`,
  `website/src/integrations/pagefind-resources.ts`, `website/src/layouts/BaseLayout.astro`,
  `website/src/components/brand/HomePage.tsx`, `website/src/components/brand/PageShell.tsx`.
- `eng/materialize-candidate.mjs` exports `materializeCandidate({ repository, localRoot })`.
  `localRoot` defaults to cwd. Reject unknown options, missing repository and unsafe config.
- CLI: `UPSTREAM_REPO_DIR=/approved/read-only/git node eng/materialize-candidate.mjs`.
  No CLI arguments or `UPSTREAM_HEAD` override. Fail with a nonzero exit and bounded generic error;
  do not print supplied values or exception payloads.
- Resolve the exact consumer accepted ref; reject candidate repo/ref/overlay disagreement.
  Validate the fixed allowlist/prunes/empty keep and required retained inputs against Git before
  writing. Do not publish an incomplete candidate or remove an existing candidate on preflight fail.
- Call existing `vendor()` with role `candidate`, fixed output `website/vendor-candidate` below
  the disposable localRoot, and accepted ref. Expose no accepted-role/output/ref override.
- Return `{ status: 'MATERIALIZED_UNVALIDATED_SITE', provenance }`; CLI prints that JSON once.
  Preserve ordinary vendor provenance; no separate generator/schema/framework or provider added.

## Acceptance And Verification

1. [OBSERVABLE_OUTCOME] One real pinned generation contains the declared required inputs and a
   provenance inventory bound to config/overlay/source hashes; role is candidate.
2. [SECURITY_PROPERTY] Accepted files/outputs are byte-identical before/after; the existing throwing
   catalog guard is copied unchanged. No upstream `public/data`, agents, prompts, instructions or
   skills catalog enters the bundle. Declared unused learning content/assets are pruned.
3. [OBSERVABLE_OUTCOME] An independent focused test owner writes same-path positive and negative
   controls before implementation. Positive fixture must succeed; missing required inputs, changed
   ref/repo, attempted accepted-output/role overrides and catalog reintroduction must fail before
   output mutation. Module absence cannot satisfy a negative test without the positive path.
4. [OBSERVABLE_OUTCOME] Existing focused vendor suite remains green, generation is deterministic
   and stale candidate files are replaced by existing semantics. A script/config execution marker
   remains absent. No browser or upstream build is run.
5. [MANUAL_VERIFICATION] Independent review checks the exact delta and first results; retain
   unresolved build/browser compatibility and any missing source/runtime evidence explicitly.

This is a single real implementation path. Test ownership is predeclared; there is no matched
normal-path comparison or causal efficiency claim. Partial prospective M9/M10 evidence is not full
TDD/scheduler/benefit qualification. No artificial pause/failure or Doctor receipt is manufactured.

## Budget And Stop

This task is assigned to the Starfleet coordinator under a fixed owner-approved slice allocation.
The original source/task freeze, account meter and reserve receipts remain private. Check supported
usage before new role work and at completion; concurrent work can exhaust the allocation early.
This is a between-task guard, not a guaranteed in-progress hard spending cap. At most three initial
role owners (test, implementation, readiness), one correction and one delta rereview are allowed
within that allocation. Stop on budget, scope, source or owner conflict, new install/execution need,
or missing critical evidence; preserve partial outcomes. Existing CI authorization does not itself
authorize a new website deployment or accepted-baseline movement.

## Assumptions And Decision Provenance

- PROVEN_REPOSITORY: current seed has three files; vendor() accepts explicit config, role and
  owned output, and performs Git/blob copying without upstream execution.
- PROVEN_REPOSITORY: the reviewed upstream ref contains the lockfile, contributor manifest,
  declared routes/integration and assets. The current overlay intentionally throws.
- DERIVED_NO_ARCHITECTURE_CHANGE: a separate opt-in config and thin caller prevent default-pipeline
  drift; existing vendor/provenance logic is reused.
- Risk gate NOT_REQUIRED for inert copying. Build/browser/credential-free candidate execution
  remains outside scope and unproven; no successful runtime assumption is carried into acceptance.
