---
schema_version: 1
project_id: basic-plugin
project_name: Basic Plugin
repository: jnicholas000/basic-plugin
status: prototype
current_phase: Marketplace baseline personal-environment validation
last_reviewed: 2026-09-24
project_ops_file: projects/basic-plugin.md
---

# Basic Plugin

## Mission

Maintain a deliberately small personal Agent Plugins 1.0 testbed that isolates GitHub Copilot plugin,
skill, agent, hook, hosted-MCP, and marketplace-distribution behavior outside an enterprise-managed
environment.

## Work-Oriented Development Intent

Use this testbed to develop and test original, reusable capabilities for Jonathan's work needs,
then transfer those purpose-built capabilities for adaptation and validation in the work
environment. Supplied work examples inform requirements; exact copies are not the implementation
goal. The [work reference needs](docs/work-reference-needs.md) capture this direction and its
candidate capability map. This reference capture does not establish additional runtime support.

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

PR #4 merged as `28f1971e43ee7f217734747f2fde38d436e6a7e9`, adding the approved marketplace-shell experiment: generated marketplace/site artifacts, an
Awesome Copilot-inspired structural sync workflow, serialized marketplace publication, GitHub Pages
deployment, and AQC-first trusted validation. The shell is structural only and does not vendor the
Awesome Copilot agent, skill, prompt, or instruction catalog.

The merged baseline includes the Capability Sentinel work so the materialized
marketplace package includes `hooks.json` and `hooks/` rather than silently dropping that capability.
Secret-free local build and inventory checks pass in GitHub Actions. `AQC_READ_TOKEN` is now
reported as configured for this repository. Trusted same-repository heads use the private AQC job.
Fork and Dependabot heads require an exact-head, maintainer-authorized `Trusted AQC checks` run that
executes no contribution scripts and does not persist checkout credentials. Hosted results on the
current exact head remain authoritative for whether private AQC access and validation succeed.

PR #7 adds a tiered upstream website synchronization guardrail. Routine changes are eligible for
validated auto-merge, broader changes require human review, and architecture migrations preserve the
reviewed pin and create a manual migration issue. This does not replace the Holo prototype shell.

## Current Objective

Establish personal-environment runtime evidence for installation, capability discovery, advisory
collision reporting, and hosted GitHub MCP authentication against the merged plugin and marketplace
baseline. Keep the separate Pages deployment failure visible without treating it as runtime evidence.
Before replacing the prototype shell, prove the tiered upstream synchronization boundary against the
reviewed pin and candidate website architecture.

## Completed Capabilities

- Agent Plugins 1.0 manifest and portable MCP configuration.
- Pinned skill-creator and Custom Agent Foundry components with third-party notices.
- Read-only capability-collision inventory and passive Capability Sentinel hooks.
- Generated marketplace index and Holo-branded static catalog shell.
- Secret-free local build and generated-output inventory validation.
- Immutable reviewed pins for Awesome Copilot structural tracking and the private AQC engine.
- Deterministic upstream website classification with routine, review, and architecture paths.
- Fork-safe local quality checks, same-repository private AQC validation, and a maintainer-authorized exact-head AQC path for fork and Dependabot contributions.
- Serialized marketplace publication with a materialized plugin-distribution contract.
- Documented VS Code, Copilot CLI, and hosted GitHub MCP smoke paths.
- Regression coverage for the portable plugin layout and Copilot compatibility.

## Roadmap

### Now

- Run the documented personal-environment smoke protocol against the merged marketplace baseline
  and record only observed installation, discovery, sentinel, and hosted GitHub MCP results.
- Land the tiered upstream-sync guardrail after current-head quality gates and review pass.

### Next

- Dispatch the merged sync workflow once and record whether the reviewed pre-redesign pin correctly
  stops on the September 2026 website architecture rewrite; do not infer this from synthetic tests.
- Replace the Holo prototype shell with an upstream-derived website and a thin branding/adaptation
  layer only after the synchronization boundary is proven.
- Reconcile demonstrated runtime evidence into the package documentation.
- Investigate the recorded Pages setup failure and verify deployment separately; a published
  marketplace branch does not prove the site deployed.
- Use the work reference needs to select bounded capability work as concrete needs arise;
  candidate requirements do not activate implementation by themselves.

### Later / Out of Scope

- Enterprise deployment, policy inference, credential storage, automatic installation, capability
  mutation, or production marketplace claims.
- Vendoring or automatically importing Awesome Copilot agents, skills, prompts, or instructions.
- Any behavior that installs, removes, disables, renames, or blocks capabilities.

## Blockers and Risks

- Personal-environment installation, custom-agent/skill discovery, sentinel behavior, and hosted
  GitHub MCP authentication still need recorded runtime evidence on the combined baseline.
- Recorded Pages deployment run #35241623140 failed during job setup before deployment steps;
  no successful Pages deployment is established by that run.
- The successful AQC and publication runs prove their recorded baseline only, not future credential
  availability or validation of later revisions.
- Local classifier regression tests do not prove the live upstream sync, issue creation, or auto-merge path.
- Managed-environment behavior cannot be inferred from this testbed.

## Verification

- PR #4 merged the marketplace baseline as `28f1971e43ee7f217734747f2fde38d436e6a7e9`.
- Recorded [AQC quality gates](https://github.com/jnicholas000/basic-plugin/actions/runs/35241586289)
  passed both local quality and private AQC checks.
- Recorded [marketplace publication](https://github.com/jnicholas000/basic-plugin/actions/runs/35241586224)
  passed, including materialized-distribution validation and publication.
- Recorded [Pages deployment](https://github.com/jnicholas000/basic-plugin/actions/runs/35241623140)
  failed at job setup before deployment steps. This is not a deployed-site claim.
- PR #7's classifier suite passes 15 local tests, including real Git renames, critical-path moves,
  copies, structural replacement, unusual filenames, unchanged refs, and configuration edits.
  Five regression cases failed against the original parser before the repair.
- The materialized marketplace contract requires `plugin.json`, `mcp.json`, `hooks.json`,
  `hooks/`, Copilot agents, and skills.
- Fork and Dependabot contributions retain the exact-head, maintainer-authorized trusted AQC path.
- Personal runtime success remains unknown until the smoke protocol is performed.
- No personal access token or secret belongs in the repository.

## One Next Action

Run the documented personal-environment smoke protocol against the merged marketplace baseline and
record observed installation, discovery, sentinel, and hosted GitHub MCP behavior. Do not infer
unobserved results or make Pages deployment a substitute for runtime evidence.

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
- PR #4 for the merged marketplace-shell integration.
- PR #7 for the tiered upstream website sync guardrail.
- [Work reference needs](docs/work-reference-needs.md) for the supplied examples and build-to-work intent.

## Update Policy

Review this file on every pull request. Update it when the local mission, Stable V1 boundary,
objective, roadmap, blockers, verification posture, or one next action changes. Keep Project Ops as
the cross-project portfolio mirror.
