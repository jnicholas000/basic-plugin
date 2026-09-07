---
schema_version: 1
project_id: basic-plugin
project_name: Basic Plugin
repository: jnicholas000/basic-plugin
status: prototype
current_phase: Agent Plugins 1.0 personal-environment validation
last_reviewed: 2026-09-07
project_ops_file: projects/basic-plugin.md
---

# Basic Plugin

## Mission

Maintain a deliberately small personal Agent Plugins 1.0 testbed that isolates GitHub Copilot plugin,
skill, agent, hook, and hosted-MCP behavior outside an enterprise-managed environment.

## Stable V1

Stable V1 is reached when the plugin can be installed and exercised in a personal environment with:

- the portable skills and Copilot custom agent discoverable;
- the hosted GitHub MCP present and authenticated by the client at use time;
- the advisory-only Capability Sentinel producing warnings only for demonstrated collisions;
- documented smoke evidence for the supported session surfaces; and
- no stored secrets or implied enterprise-production support.

## Current State

The merged package is a small Agent Plugins 1.0 fixture. It includes pinned upstream components, a
portable GitHub MCP configuration, a Copilot-specific custom agent, read-only collision detection,
and an advisory session-start/recheck hook. It has static layout and compatibility coverage.

The marketplace-shell work in PR #4 is unmerged evidence only. It does not define this repository's
mission, Stable V1, roadmap, or verification posture.

## Current Objective

Establish personal-environment runtime evidence for installation, capability discovery, advisory
collision reporting, and hosted GitHub MCP authentication without importing enterprise policy or
credentials.

## Completed Capabilities

- Agent Plugins 1.0 manifest and portable MCP configuration.
- Pinned skill-creator and Custom Agent Foundry components with third-party notices.
- Read-only capability-collision inventory and passive Capability Sentinel hooks.
- Documented VS Code, Copilot CLI, and hosted GitHub MCP smoke paths.
- Regression coverage for the portable plugin layout and Copilot compatibility.

## Roadmap

### Now

- Run the documented personal-environment smoke protocol and record only observed results.

### Next

- Reconcile demonstrated runtime evidence into the package documentation.
- Evaluate marketplace or catalog work only through a separately reviewed proposal.

### Later / Out of Scope

- Enterprise deployment, policy inference, credential storage, automatic installation, capability
  mutation, or production marketplace claims.
- Any behavior that installs, removes, disables, renames, or blocks capabilities.

## Blockers and Risks

- Personal-environment installation, custom-agent/skill discovery, sentinel behavior, and hosted
  GitHub MCP authentication have not yet been recorded as runtime evidence.
- Managed-environment behavior cannot be inferred from this testbed.
- PR #4 has unresolved review and AQC validation findings; it is not current authority.

## Verification

- Merged repository history documents portable-layout regression coverage and compatibility checks.
- Runtime success is intentionally unknown until the documented smoke protocol is performed.
- No personal access token or secret belongs in the repository.

## One Next Action

Run the documented personal-environment smoke protocol and record observed installation, discovery,
sentinel, and hosted GitHub MCP behavior. Do not infer any unobserved result.

## Evidence and Detailed Plans

- README.md for the package contents, install steps, smoke protocol, and expected diagnostic value.
- THIRD_PARTY_NOTICES.md for source pins and local compatibility/security patches.
- Project Ops detail: projects/basic-plugin.md.
- PR #3 for the merged advisory collision-detection baseline.

## Update Policy

Review this file on every pull request. Update it when the local mission, Stable V1 boundary,
objective, roadmap, blockers, verification posture, or one next action changes. Keep Project Ops as
the cross-project portfolio mirror.
