# Candidate Local-Catalog Parity Plan

Feature slug: `candidate-catalog-parity`. Status: **reviewable design; not an
implementation-ready or runnable-site claim**. The production structural adapter and throwing
catalog guard remain active. No dependency, workflow, pin or generated output changes in this phase.

## Outcome And Basis

Prepare the next useful integration after candidate materialization: let a future candidate consume
Basic Plugin's local catalog while preserving the reviewed upstream presentation and truthful links.
This phase delivers the migration contract and one unresolved execution-boundary spike contract.
It does not implement an adapter, activate the overlay, install dependencies or execute upstream code.

Basis: consumer `9ef6e8854d3847621fcd69005b705b48d8028be5`, upstream
`6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`, `UPSTREAM_POLICY.md`,
[vendoring direction](upstream-vendoring-direction.md), and
[materialization contract](candidate-materialization-plan.md). This is an interface-adapter migration,
using the existing vendor/overlay/provenance and artifact-promotion paths rather than another site,
registry or framework. Existing repository policy supplies the isolation requirement; it is not waived.

## Verified Integration Gaps

| Frozen source | Observed contract or gap | Required future treatment |
| --- | --- | --- |
| `eng/generate-marketplace.mjs`, `marketplace/index.json` | Locally generated plugin metadata and capability counts; not complete agent/skill/detail records. | Reuse this authority; derive any additional records from declared local artifacts, with source paths and no invented dates, owners or contents. Counts alone cannot stand in for records. |
| Upstream `website/src/lib/site-data.ts` | Imports five `{items}` catalogs plus generated search records; exports arrays, counts, contributor total and built search index. | Preserve the consumed interface using local data. Empty unsupported categories must be truthful; do not copy upstream data to fill them. |
| Upstream `website/src/components/brand/PluginsCatalog.tsx` | `PluginItem` requires id/name/description/path/itemCount; source links otherwise use the hard-coded Awesome Copilot tree. | Bind catalog and source links to Basic Plugin. Do not label local resources external merely to make the fallback URL work. |
| Upstream `website/src/pages/plugin/[id].astro` | Reads `plugins.json` directly, optional resource Markdown, and hard-codes `@awesome-copilot` installation plus source/branding. | A site-data replacement alone is insufficient. Bind direct JSON and detail bodies to the same local inventory; replace installation/source/branding intentionally and verify documented installation syntax before exposing an action. |
| Upstream `website/src/components/brand/searchIndex.ts` | Adds static Learning Hub/contributor destinations as well as resource results. | Search/navigation may advertise only retained valid routes. Pruned Learning Hub must not leave dead links or imported article data. |
| `website/overlay.json`, `website/overlay/local-site-data.ts` | One required whole-file catalog replacement deliberately throws. | Keep it until the complete candidate-only integration and execution gate are reviewed. Add only bounded asserted overlay targets; never hand-edit generated source. |

The remaining agent/skill/detail consumed-field coverage must be recorded from these same pinned
upstream interfaces before an implementation handoff. This document does not pretend those schemas,
empty-category presentation or all install actions have already been validated.

## Local Data And Parity Contract

- Basic Plugin's `plugin.json`, declared local artifacts and generated marketplace index are the
  authority. Imported third-party artifacts already declared locally retain attribution; the upstream
  resource catalog is not an input. MCP/hooks remain the existing overview capabilities, not invented
  upstream resource categories.
- Local records need stable IDs, verified paths, descriptions and source/installation destinations.
  Plugin contents/counts and search/detail records must agree with the same inventory. Reject missing,
  duplicate, foreign or unsafe records; do not manufacture zero counts to mask failed discovery.
- Preserve Home/local catalog, truthful capability totals, local status labels, repository/download
  links and mobile behavior from the current structural adapter. A smaller initial candidate may
  omit unsupported sections only by an explicit reviewed parity decision, never as a silent pass.
- Asserted overlays must cover direct catalog imports, branded source/install actions and retained
  navigation/search as well as site-data. Do not create a broad text sweep that rewrites arbitrary
  URLs, accept missing targets or use copied output as new authority.
- Keep production generation, accepted pins/output, default guard and automatic advancement unchanged
  throughout candidate work. Publish an upstream-derived site only through the existing validated-byte
  promotion boundary after actual parity evidence and accepted-baseline review.

## Ordered Future Slices And Gates

1. **Complete the data contract, no upstream execution.** Inventory required list/detail/search fields
   from the pinned components/routes and map them to actual local sources. Declare exact allowed files,
   missing-data behavior and independent positive/faulty controls before implementation. Add a thin
   deterministic local projection only after that handoff is complete. Reuse existing generation;
   avoid an independent catalog owner or general parser framework.
2. **Prove the execution boundary.** Resolve the
   [single credential-free execution question](spikes/candidate-catalog-parity-credential-free-execution.md)
   before any candidate-controlled package/config/build code runs. Existing `quality.local` is the
   first route to assess: read-only permission, checkout credentials not persisted, and private AQC in
   another job. Its trusted structural-adapter success does not prove safe upstream execution.
   No extra personal VM is required by this plan; no new host/job/service is selected or provisioned.
3. **Integrate only the candidate.** After both gates clear, prepare bounded asserted overlays and
   local generated data, then build/smoke in the proven credential-free route. Stop on unresolved
   targets, source/ref drift, unexpected egress, unavailable evidence or authority changes. Failure
   must preserve the production adapter and original first return; no automatic model/build retry.
4. **Review real parity before promotion.** Check Home/catalog/detail and local search links, empty
   sections, counts, installation actions, mobile overflow, console failures and unexpected requests.
   Keep artifact-only AQC independent of candidate execution. Baseline movement/publication remains a
   separate reviewed decision; do not turn a design or successful build into parity acceptance.

## Acceptance And Verification Budget

Current design phase:

1. [MANUAL_VERIFICATION] Source-backed review confirms the gaps and smallest ordered boundary;
   known contracts and missing field coverage remain distinguishable.
2. [SECURITY_PROPERTY] Only this plan, the spike contract and material Project State change;
   runtime/config/overlay/generated bytes remain unchanged.
3. [MANUAL_VERIFICATION] Independent review and changed-document/whitespace checks pass; ordinary
   existing CI governs any publication. No application test/build/browser result is invented.

Future execution must freeze its own inputs, success/rejection criteria, resource/stop limits and
independent test/review ownership before dispatch. A single useful path supplies only its actual
scope: no matched normal-path comparison, deterministic scheduler, independent-oracle calibration,
review-effort improvement or full Mission 9/10 acceptance is claimed here. Orientation preceded
this phase's drafting/review freeze; it is not backdated as a prospective observation.

## Assumptions And Handoff

- PROVEN_REPOSITORY: the materializer copies the declared pinned source, preserves the throwing
  guard, and the current production path uses the structural adapter.
- PROVEN_REPOSITORY: direct JSON/detail consumers and hard-coded upstream destinations make a
  one-file site-data swap insufficient.
- UNPROVEN_MISSION_CRITICAL: the selected runtime route satisfies the credential-free candidate
  execution policy in practice. Gate **SPIKE_REQUIRED**; no risk acceptance or implementation handoff.
- SOURCE_SPECIFIED / ALIGNED: local catalog authority, Mac starting point, inert candidate preparation,
  existing artifact promotion and preserved production. No architecture choice is silently adopted.

LaForge retains this design checkpoint. Next is the bounded consumed-field/local-source contract,
then the execution spike through existing owners with actual scope and budget. Scotty receives no
upstream execution authority from this plan. Stop at missing source, scope/owner conflict, a new
host/credential/security need or the active resource limit; preserve incomplete evidence.
