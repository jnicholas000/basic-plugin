---
schema_version: 1
project_id: basic-plugin
project_name: Basic Plugin
repository: jnicholas000/basic-plugin
status: prototype
current_phase: AQC-first marketplace shell integration
last_reviewed: 2026-09-07
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
Secret-free local build and inventory checks pass in GitHub Actions. Private AQC validation is
currently blocked because `AQC_READ_TOKEN` is not configured for this repository.

## Current Objective

Finish PR #4 with a clean review and trusted AQC evidence, then resume the personal-environment
runtime smoke protocol against the combined plugin and marketplace baseline.

## Completed Capabilities

- Agent Plugins 1.0 manifest and portable MCP configuration.
- Pinned skill-creator and Custom Agent Foundry components with third-party notices.
- Read-only capability-collision inventory and passive Capability Sentinel hooks.
- Generated marketplace index and Holo-branded static catalog shell.
- Secret-free local build and generated-output inventory validation.
- Immutable reviewed pins for Awesome Copilot structural tracking and the private AQC engine.
- Fork-safe local quality checks and same-repository private AQC validation boundary.
- Serialized marketplace publication with a materialized plugin-distribution contract.
- Documented VS Code, Copilot CLI, and hosted GitHub MCP smoke paths.
- Regression coverage for the portable plugin layout and Copilot compatibility.

## Roadmap

### Now

- Configure the repository `AQC_READ_TOKEN` with read-only access to
  `jnicholas000/ai-quality-control` and rerun PR #4's private AQC checks.
- Merge PR #4 only after review remains clean and trusted AQC validation passes.

### Next

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

- `AQC_READ_TOKEN` is not currently available to PR #4's trusted AQC job, so private AQC validation
  and publication cannot yet be claimed as passing.
- Personal-environment installation, custom-agent/skill discovery, sentinel behavior, and hosted
  GitHub MCP authentication still need recorded runtime evidence on the combined baseline.
- Marketplace publication and Pages deployment have not yet been exercised from merged `main`.
- Managed-environment behavior cannot be inferred from this testbed.

## Verification

- PR #4 secret-free `Local quality checks` completed successfully after reconciliation with current
  `main`.
- The materialized marketplace contract now requires `plugin.json`, `mcp.json`, `hooks.json`,
  `hooks/`, Copilot agents, and skills.
- Private AQC checks are blocked by missing repository credential configuration, not reported as
  passed.
- Runtime and post-merge publication success remain intentionally unknown until exercised.
- No personal access token or secret belongs in the repository.

## One Next Action

Configure `AQC_READ_TOKEN` for read-only AQC checkout and rerun PR #4's private quality gate.

## Evidence and Detailed Plans

- README.md for package contents, marketplace automation, install steps, and smoke protocol.
- UPSTREAM_POLICY.md for immutable upstream/AQC pinning and trust-boundary rules.
- marketplace.contract.json for generated-output and materialized-distribution requirements.
- .github/workflows/quality.yml for local and trusted AQC gates.
- .github/workflows/publish.yml for serialized marketplace publication.
- THIRD_PARTY_NOTICES.md for source pins and local compatibility/security patches.
- Project Ops detail: projects/basic-plugin.md.
- PR #3 for the merged advisory collision-detection baseline.
- PR #4 for the marketplace-shell integration.

## Update Policy

Review this file on every pull request. Update it when the local mission, Stable V1 boundary,
objective, roadmap, blockers, verification posture, or one next action changes. Keep Project Ops as
the cross-project portfolio mirror.
