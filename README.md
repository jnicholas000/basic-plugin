# basic-plugin

A **Copilot customization incubation and marketplace lab** built on Agent Plugins 1.0. It is the personal proving ground for an Awesome Copilot-derived site/marketplace clone, runtime customization experiments, and useful skills or agents that do not belong in Starfleet. Reusable CI, evaluation, security, and governance checks belong in **AI Quality Control (AQC)**; clone-specific synchronization and publication logic stays here.

It contains two portable skills, one Copilot-specific custom agent, one portable MCP server configuration, and a passive capability-collision hook:

- `skill-creator`: Anthropic's skill authoring and evaluation workflow.
- `capability-collision-detection`: a read-only inventory and duplicate-capability report for plugin, skill, agent, and MCP definitions.
- `Custom Agent Foundry`: an Awesome Copilot helper for designing custom agents.
- GitHub's hosted MCP server, authenticated by the client at use time.
- `Capability Sentinel`: a passive hook that warns the agent when overlapping capability definitions are detected.

The imported components are pinned to exact upstream commits. The custom agent remains unmodified; the skill contains small documented compatibility and security patches for GitHub Copilot. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source commits, local changes, and licenses.

AQC is authoritative for trusted marketplace quality validation. Same-repository pull requests run its `awesome-copilot-repository` profile. Fork and Dependabot pull requests run public local build and inventory checks without receiving private AQC credentials. A maintainer can apply the `aqc-trusted-validation` label to an exact untrusted head to run the pinned private engine from the trusted base workflow. That job treats the contribution as data, executes no contribution scripts, persists no checkout credentials, and publishes a `Trusted AQC checks` status on the exact head. The Awesome Copilot resource catalog is not copied here.

See [ROADMAP.md](ROADMAP.md) for the project ownership boundary, Official/Experimental lifecycle plan, trust model, health/evaluation work, adaptive website-clone roadmap, and artifact-incubation backlog.

## Layout

```text
basic-plugin/
├── plugin.json
├── mcp.json
├── hooks.json
├── hooks/
│   └── capability_sentinel.py
├── skills/
│   ├── capability-collision-detection/
│   └── skill-creator/
├── com.github.copilot/
│   └── agents/
│       └── custom-agent-foundry.agent.md
├── website/                    # branded Holo source wrapper
├── site/                       # generated static site
├── marketplace/               # generated catalog
├── eng/                        # generation and validation scripts
└── .github/workflows/          # quality, sync, publication, and Pages jobs
```

- `plugin.json` declares the Agent Plugins 1.0 schema.
- `skills/` and `mcp.json` are portable Agent Plugins components.
- `com.github.copilot/` contains GitHub Copilot-specific components such as custom agents.
- `hooks.json` wires the passive Capability Sentinel for supported Copilot agent sessions.
- The legacy Copilot-format `agents/` and `.mcp.json` paths are intentionally not used.

## Capability Sentinel

At session start, the sentinel checks the current project plus Copilot's standard capability locations. It supplies a concise warning only when it finds a collision. When an agent performs a capability-related search or read and receives multiple matching definitions, a narrow follow-up hook rechecks the inventory and supplies the same warning when warranted.

It never installs, removes, disables, renames, or blocks anything. It does not have a post-install lifecycle event, and VS Code does not currently expose this hook surface for plugins. A newly installed plugin is therefore checked at the next supported Copilot CLI or cloud-agent session, not at the instant of installation.

## Marketplace automation

Set the `AQC_READ_TOKEN` repository secret to a read-only token that can checkout `jnicholas000/ai-quality-control`.

- Trusted pull requests run `npm run build`, inventory validation, and the immutable-pinned AQC engine.
- Fork and Dependabot pull requests run secret-free local checks. For each exact head, a maintainer must remove and reapply `aqc-trusted-validation` to authorize the separate `Trusted AQC checks` path before merge.
- A push to `main` publishes the generated `marketplace` branch. Publication is serialized, and manual dispatches are restricted to `main`.
- GitHub Pages deploys the generated `site/` artifact.
- A weekly/manual sync job compares the reviewed Awesome Copilot pin with current upstream website structure before advancing it. Routine changes can auto-merge after local and AQC validation, broader changes require a reviewed PR, and architecture rewrites stop the sync and open/refresh a manual migration issue. Upstream resources are never imported automatically.

See [UPSTREAM_POLICY.md](UPSTREAM_POLICY.md) for the immutable upstream and AQC pinning contract.

## Install

### VS Code

Open the **Plugins** view, choose **Install Plugin from Source**, and enter:

```text
https://github.com/jnicholas000/basic-plugin
```

### Copilot CLI

Install directly from GitHub:

```shell
copilot plugin install jnicholas000/basic-plugin
```

For testing an unmerged branch, clone that branch and install the local directory:

```shell
git clone --branch <branch-name> https://github.com/jnicholas000/basic-plugin.git
cd basic-plugin
copilot plugin install .
```

## Smoke test

1. Confirm `basic-plugin` is installed and enabled.
2. Confirm **Custom Agent Foundry** appears in the custom-agent picker.
3. Ask the agent to draft a minimal read-only repository-review agent and confirm it produces a complete `.agent.md` file.
4. Start a fresh session and ask Copilot to create a tiny reusable skill; confirm the `skill-creator` workflow is selected.
5. Ask Copilot to check this plugin for duplicate capabilities; confirm the `capability-collision-detection` workflow returns a report without changing files.
6. Start a supported Copilot agent session with intentionally colliding test capabilities installed. Confirm the **Capability Sentinel** adds a concise warning without blocking the session.
7. Open the MCP server list, confirm GitHub's hosted server is present, complete authentication if prompted, and ask Copilot to inspect a repository you can access.
8. Run `npm run build` and `npm run validate` to confirm the marketplace/site inventory contract locally.

No personal access token or secret belongs in this repository.

## Diagnostic value

This is a small, reviewable testbed for plugin behavior and marketplace automation. If the package works in a personal environment but not in a managed work environment, compare Copilot policy, MCP policy, authentication restrictions, allowed MCP servers, and plugin marketplace/source policy. It is intentionally not a mirror of Awesome Copilot's agents, skills, prompts, or instructions.
