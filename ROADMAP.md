# Basic Plugin Roadmap

> Last reviewed: 2026-09-26  
> Repository: `jnicholas000/basic-plugin`

## Purpose

Basic Plugin is Jonathan's **Copilot customization incubation and marketplace lab**.

It has two primary jobs:

1. **Marketplace and website experimentation**
   - Clone useful Awesome Copilot site and marketplace patterns.
   - Test adaptive upstream synchronization, local branding, generated catalogs, marketplace publication, and GitHub Pages behavior.
   - Keep clone-specific synchronization and migration logic in this repository.

2. **Artifact incubation**
   - Store and exercise useful skills, agents, prompts, hooks, MCP configurations, and plugin experiments that do not belong in Starfleet.
   - Provide a neutral personal proving ground for capabilities that may later be adapted for work.
   - Keep experiments portable and free of work-specific credentials, source code, or private internal data.

Basic Plugin is **not** the reusable CI engine. Reusable quality checks belong in **AI Quality Control (AQC)**.

---

## Repository Ownership Boundary

### Basic Plugin owns

- Awesome Copilot-derived website structure and local site wrapper.
- Upstream website synchronization, change classification, and clone migration behavior.
- Generated marketplace/site artifacts and publication workflows.
- Plugin packaging and materialization behavior specific to this repository.
- Runtime experiments such as capability collision warnings and trust prompts.
- Official/Experimental presentation and artifact lifecycle metadata.
- Incubating skills and agents that do not fit Starfleet.
- Personal-environment smoke tests and integration fixtures.
- Research/prototypes for enterprise transfer patterns.

### AQC owns

Anything that is a **reusable quality or governance check** and could reasonably be consumed by another repository:

- artifact structure/schema validation;
- reference/link validation;
- security and malicious-behavior checks;
- provenance and immutable-reference checks;
- ownership/lifecycle validation;
- duplicate/collision analysis used as a CI check;
- behavioral evaluation harnesses;
- Waza or other evaluation adapters;
- scheduled semantic-health evaluation primitives;
- CI/check auditing;
- reusable marketplace/plugin validation profiles.

Basic Plugin should **consume AQC**, not fork copies of AQC checks.

### Clone-specific exception

Checks that exist only to safely maintain the Awesome Copilot website clone remain in Basic Plugin, including:

- upstream website diff classification;
- structural-change detection;
- framework migration detection;
- clone-specific generated-output comparison;
- branding-wrapper compatibility;
- upstream sync PR generation and auto-merge eligibility.

If a clone check later proves generally useful beyond this repository, promote the reusable portion into AQC and keep only the Basic Plugin adapter here.

---

# Roadmap

## Mission 1: Adaptive Awesome Copilot Site Clone

**Outcome:** Basic Plugin hosts a recognizable local marketplace experience while absorbing routine upstream website changes with minimal maintenance.

### In progress

- Finish PR #7, which classifies upstream website changes as `routine`, `review`, or `architecture`.
- Keep routine changes eligible for automated validation and merge.
- Require human review for broader changes.
- Stop automated pin updates when upstream makes an architectural migration.

### Next

- Replace the current Holo prototype with the selected Awesome Copilot-derived site structure.
- Add a thin local wrapper for identity/branding instead of deeply forking upstream UI code.
- Preserve local marketplace data as the source of displayed artifacts.
- Verify the sync automation against representative historical upstream changes.
- Record which upstream files are mirrored, wrapped, ignored, or locally owned.
- Make generated-site drift detectable.
- Keep framework-migration logic local to Basic Plugin.

### Acceptance

- Routine upstream changes can land with no manual code edits when all required validation passes.
- Architecture changes create an explicit migration task instead of silently rewriting the site.
- Local branding/customization remains intact after routine syncs.
- No Awesome Copilot resource catalog is silently imported.

---

## Mission 2: Marketplace and Publication Reliability

**Outcome:** Authored artifacts produce a deterministic installable plugin, marketplace branch, and site projection.

### Work

- Preserve `main` as authored source.
- Preserve `marketplace` as generated/materialized distribution output.
- Keep materialization deterministic and remove stale generated content.
- Validate all capabilities survive packaging, including hooks, MCP configuration, agents, and skills.
- Keep publication serialized.
- Resolve the outstanding Pages deployment problem.
- Verify Git author identity requirements for generated publication commits.
- Distinguish successful marketplace publication from successful Pages deployment.
- Add end-to-end evidence for install, package generation, marketplace publication, and Pages.

### Acceptance

- Re-running generation from the same source produces equivalent output.
- Generated content is never the canonical authored source.
- Publication cannot silently omit declared capabilities.
- Successful CI does not falsely imply that the public site deployed.

---

## Mission 3: Official and Experimental Artifact Lifecycle

**Outcome:** The repository can safely host both stable artifacts and work-in-progress contributions without pretending they have equal trust.

### Lifecycle

```text
Contribution
   ↓
Deterministic validation
   ↓
Experimental
   ↓
Usage + evaluation + health evidence
   ↓
Promotion review
   ↓
Official
```

### Work

- Define artifact lifecycle metadata shared across skills, agents, prompts, hooks, and plugins.
- Present **Official** and **Experimental** distinctly on the site.
- Require an owner for contributed artifacts.
- Treat the contributor as owner only when that is explicitly represented by repository policy/metadata.
- Add collision/duplicate checks before admission.
- Define promotion criteria from Experimental to Official.
- Define deprecation/retirement behavior.
- Ensure artifacts can remain Experimental without becoming invisible or implicitly Official.

### AQC dependency

Reusable lifecycle, schema, security, provenance, and promotion checks belong in AQC. Basic Plugin owns the metadata conventions, site presentation, workflow wiring, and experiment fixtures.

---

## Mission 4: Trust and Third-Party Capability Safety

**Outcome:** A user can experiment with third-party capabilities without confusing "I chose to trust this" with "this is enterprise approved."

### Trust states to prototype

- **Approved**: reviewed under the governing repository/process.
- **User accepted**: explicitly accepted by the user for a specific artifact identity.
- **Unverified**: discovered but not approved or accepted.
- **Blocked**: explicitly disallowed by policy or evidence.

### Work

- Bind trust to a meaningful artifact identity such as version, source ref, and/or content hash rather than display name alone.
- Prototype a user-acceptance registry that does not modify the third-party artifact.
- Extend trust handling from individual skills to installed plugins containing multiple capabilities.
- Preserve the ability for users to author normal local/workspace skills without forcing them through central publication.
- Continue the Capability Sentinel/collision work as advisory rather than mutation/blocking.
- Investigate whether current Copilot hook surfaces can reliably provide pre-use warnings.
- Keep trust warnings separate from quality certification.

### Research

- Compare artifact-level trust with complementary controls such as managed plugin settings, Artifactory-style distribution, and network/security controls.
- Treat those systems as additional layers, not replacements for artifact provenance and review.

---

## Mission 5: Artifact Health and Relevance

**Outcome:** Experimental and Official artifacts do not quietly fossilize while the surrounding ecosystem changes.

### Work

- Run a health review approximately every two weeks.
- Detect deterministic staleness such as:
  - broken links/references;
  - missing dependencies;
  - renamed/deprecated APIs;
  - invalid schemas;
  - abandoned ownership;
  - security/provenance failures.
- Add AI-assisted semantic review for questions deterministic checks cannot answer, such as:
  - Does the skill still describe the current tool?
  - Are its instructions still meaningful?
  - Has the ecosystem made the artifact redundant?
  - Does the artifact conflict with newer platform behavior?
- Record health state separately from lifecycle state.
- Flag stale artifacts for review rather than silently deleting them.

### AQC dependency

The reusable health/evaluation engine belongs in AQC. Basic Plugin owns scheduled orchestration, fixtures, displayed status, and artifact-specific remediation work.

---

## Mission 6: Behavioral Evaluations

**Outcome:** Promotion decisions rely on behavior evidence, not merely valid Markdown and optimistic vibes.

### Work

- Preserve portable evaluation scenarios and expected behavior.
- Keep manual smoke testing as a separate activity from automated behavioral evaluation.
- Use AQC as the evaluation entry point.
- Evaluate Waza as an adapter/runtime, not as the canonical storage format for our scenarios.
- Pin/checksum pre-1.0 evaluation dependencies.
- Run deeper behavioral evaluations primarily for Experimental → Official promotion and periodic health review rather than making every early contribution expensive.
- Keep evaluation evidence attached to the artifact/version tested.

### AQC dependency

Evaluation runners, scoring contracts, adapters, reusable scenarios, and CI integration belong in AQC. Basic Plugin provides artifact fixtures and consumes results.

---

## Mission 7: Customization Collision and Environment Doctor

**Outcome:** Users can understand which skills, agents, MCPs, plugins, instructions, and hooks overlap before debugging an invisible precedence problem for three hours.

### Work

- Continue `capability-collision-detection` and Capability Sentinel experiments.
- Detect exact duplicates, naming collisions, path shadowing, and likely semantic overlap.
- Surface precedence and origin where the host exposes enough evidence.
- Keep runtime warnings read-only.
- Separate:
  - reusable static CI collision checks → AQC;
  - local/runtime inventory and advisory diagnostics → Basic Plugin.
- Explore a broader "Customization Doctor" report that inventories the active customization environment.

---

## Mission 8: Incubate Skills and Agents Outside Starfleet

**Outcome:** Useful capabilities have a home even when they are not part of the Starfleet architecture.

### Candidate areas

- Jira ACLI automation guidance and safety boundaries.
- Tool-selection guidance that keeps ACLI, TWG CLI, and Rovo MCP responsibilities separate.
- Plugin companion/trust guidance.
- Marketplace/catalog maintenance helpers.
- Site/clone migration helpers.
- Artifact ownership and lifecycle helpers.
- Health/relevance review agents.
- Enterprise customization discovery/diagnostic agents.
- Other bounded capabilities that are useful for work experimentation but do not belong in Starfleet.

### Rules

- Check the existing inventory before adding another artifact.
- Extend an existing capability when that is cleaner than creating a near-duplicate.
- Use neutral examples and fixtures.
- Keep work secrets, internal source, private endpoints, and company-only data out of the personal repository.
- Do not duplicate tool-vendor skills when the installed tool already supplies the capability unless a demonstrated gap exists.

---

## Mission 9: Enterprise Portability Experiments

**Outcome:** Personal experiments can inform a work implementation without pretending the personal repo is the enterprise production system.

### Research/prototypes

- Enterprise baseline plugin plus team-specific extensions.
- Managed marketplace/plugin settings.
- MCP allowlists and policy boundaries.
- Artifactory/distribution integration patterns.
- Network/security control interaction.
- User trust versus enterprise approval.
- Automatic update behavior.
- Companion/builder experiences for producing team-specific extensions from approved foundations.

### Boundary

Basic Plugin proves portable patterns. Enterprise identity, credentials, internal registries, private URLs, proprietary data, and production policy remain work-environment concerns.

---

# Priority Order

1. **Finish PR #7 and adaptive clone guardrails.**
2. **Replace the site prototype with the upstream-derived clone and prove sync behavior.**
3. **Fix Pages and complete end-to-end marketplace/site publication evidence.**
4. **Define Official/Experimental lifecycle metadata and display it on the site.**
5. **Wire missing reusable governance checks through AQC rather than implementing them locally.**
6. **Add trust identity/user-acceptance experiments and expand collision diagnostics.**
7. **Add scheduled artifact health review using AQC evaluation primitives.**
8. **Expand the incubated skill/agent catalog only as concrete needs arise.**
9. **Use the resulting system as the proving ground for enterprise portability experiments.**

---

## Decision Rule for New Work

When a new idea arrives:

1. **Is it a reusable CI/evaluation/security/governance check?**  
   Build it in AQC and consume it here.

2. **Is it specific to cloning, synchronizing, branding, generating, or publishing this marketplace/site?**  
   Keep it in Basic Plugin.

3. **Is it a runtime skill/agent/hook/plugin experiment that does not fit Starfleet?**  
   Incubate it in Basic Plugin.

4. **Is it work-specific configuration, policy, identity, private data, or enterprise deployment?**  
   Keep the portable pattern here, but adapt and validate the real implementation at work.
