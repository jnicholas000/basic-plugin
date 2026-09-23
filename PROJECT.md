---
schema_version: 1
project_id: basic-plugin
project_name: Basic Plugin
repository: jnicholas000/basic-plugin
status: prototype
current_phase: AQC-first marketplace shell integration
last_reviewed: 2026-09-22
project_ops_file: projects/basic-plugin.md
---

# Basic Plugin

## Mission

Maintain a deliberately small personal Agent Plugins 1.0 testbed that isolates GitHub Copilot plugin,
skill, agent, hook, hosted-MCP, and marketplace-distribution behavior outside an enterprise-managed
environment.

## Stable V1

Stable V1 is reached when the plugin can be installed and exercised in a personal environment and its
bounded marketplace shell can be built and published with:

- the portable skills and Copilot custom agent discoverable;
- the hosted GitHub MCP present and authenticated by the client at use time;
- the advisory-only Capability Sentinel producing warnings only for demonstrated collisions;
- a generated marketplace package that preserves every local plugin capability, including hooks;
- secret-free local quality checks plus pinned AQC validation for trusted publication paths;
- a generated GitHub Pages catalog without copying the Awesome Copilot resource catalog;
- documented smoke evidence for the supported session surfaces; and
- no stored secrets or implied enterprise-production support.

## Current State

The repository is a small Agent Plugins 1.0 fixture with pinned upstream components, a portable
GitHub MCP configuration, a Copilot-specific custom agent, read-only collision detection, and an
advisory session-start/recheck hook.

PR #4 adds the approved marketplace-shell experiment: generated marketplace/site artifacts, an
Awesome Copilot-inspired structural sync workflow, serialized marketplace publication, GitHub Pages
deployment, and AQC-first trusted validation. The shell is structural only and does not vendor the
Awesome Copilot agent, skill, prompt, or instruction catalog.

The branch has been reconciled with the merged Capability Sentinel work so the materialized
marketplace package includes `hooks.json` and `hooks/` rather than silently dropping that capability.
Secret-free local build and inventory checks pass in GitHub Actions. `AQC_READ_TOKEN` is now
reported as configured for this repository. Trusted same-repository heads use the private AQC job.
Fork and Dependabot heads require an exact-head, maintainer-authorized `Trusted AQC checks` run that
executes no contribution scripts and does not persist checkout credentials. Hosted results on the
current exact head remain authoritative for whether private AQC access and validation succeed.

## Current Objective

Prove a low-maintenance Awesome Copilot website synchronization boundary before replacing the current
prototype shell: routine upstream website changes should be eligible for validated auto-merge, broader
changes should require review, and architecture migrations should stop automatically at the last
reviewed pin with a durable manual-migration report.

## Completed Capabilities

- Agent Plugins 1.0 manifest and portable MCP configuration.
- Pinned skill-creator and Custom Agent Foundry components with third-party notices.
- Read-only capability-collision inventory and passive Capability Sentinel hooks.
- Generated marketplace index and Holo-branded static catalog shell.
- Secret-free local build and generated-output inventory validation.
- Immutable reviewed pins for Awesome Copilot structural tracking and the private AQC engine.
- Deterministic upstream website change classification with routine, review, and architecture paths.
- Fork-safe local quality checks, same-repository private AQC validation, and a maintainer-authorized exact-head AQC path for fork and Dependabot contributions.
- Serialized marketplace publication with a materialized plugin-distribution contract.
- Documented VS Code, Copilot CLI, and hosted GitHub MCP smoke paths.
- Regression coverage for the portable plugin layout and Copilot compatibility.

## Roadmap

### Now

- Land and exercise the tiered Awesome Copilot website sync guardrail against the current reviewed pin.
- Confirm the known September 2026 Primer Brand rewrite is classified as an architecture migration and
  does not advance the pin automatically.

### Next

- Replace the current Holo prototype shell with an upstream-derived website plus a deliberately thin
  local branding/adaptation layer.
- Run the documented personal-environment smoke protocol against the merged marketplace baseline and
  record only observed results.
- Exercise marketplace publication and GitHub Pages from `main`, recording actual evidence rather
  than assuming deployment success.

### Later / Out of Scope

- Enterprise deployment, policy inference, credential storage, automatic installation, capability
  mutation, or production marketplace claims.
- Vendoring or automatically importing Awesome Copilot agents, skills, prompts, or instructions.
- Any behavior that installs, removes, disables, renames, or blocks capabilities.

## Blockers and Risks

- `AQC_READ_TOKEN` configuration is external to the repository; private AQC validation and
  publication cannot be claimed as passing until the applicable hosted workflow succeeds.
- Personal-environment installation, custom-agent/skill discovery, sentinel behavior, and hosted
  GitHub MCP authentication still need recorded runtime evidence on the combined baseline.
- Marketplace publication and Pages deployment have not yet been exercised from merged `main`.
- Managed-environment behavior cannot be inferred from this testbed.

## Verification

- PR #4 secret-free `Local quality checks` completed successfully after reconciliation with current
  `main`.
- The materialized marketplace contract now requires `plugin.json`, `mcp.json`, `hooks.json`,
  `hooks/`, Copilot agents, and skills.
- The repository secret is reported configured, but only current-head hosted workflow evidence can
  establish that private AQC access and validation pass. Fork and Dependabot heads require the
  separately recorded `Trusted AQC checks` status.
- Runtime and post-merge publication success remain intentionally unknown until exercised.
- No personal access token or secret belongs in the repository.

## One Next Action

Merge the tiered upstream-sync guardrail, then manually dispatch it once so the pinned pre-redesign
baseline is proven to stop on Awesome Copilot's September 2026 architecture rewrite.

## Evidence and Detailed Plans

- README.md for package contents, marketplace automation, install steps, and smoke protocol.
- UPSTREAM_POLICY.md for immutable upstream/AQC pinning and trust-boundary rules.
- marketplace.contract.json for generated-output and materialized-distribution requirements.
- .github/workflows/quality.yml for local and same-repository AQC gates.
- .github/workflows/trusted-aqc.yml for maintainer-authorized fork and Dependabot AQC validation.
- .github/workflows/publish.yml for serialized marketplace publication.
- THIRD_PARTY_NOTICES.md for source pins and local compatibility/security patches.
- Project Ops detail: projects/basic-plugin.md.
- PR #3 for the merged advisory collision-detection baseline.
- PR #4 for the marketplace-shell integration.

## Update Policy

Review this file on every pull request. Update it when the local mission, Stable V1 boundary,
objective, roadmap, blockers, verification posture, or one next action changes. Keep Project Ops as
the cross-project portfolio mirror.
