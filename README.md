# basic-plugin

A deliberately small **Agent Plugins 1.0** package for testing GitHub Copilot plugin and MCP behavior outside an enterprise-managed environment.

It contains two portable skills, one Copilot-specific custom agent, and one portable MCP server configuration:

- `skill-creator`: Anthropic's skill authoring and evaluation workflow.
- `capability-collision-detection`: a read-only inventory and duplicate-capability report for plugin, skill, agent, and MCP definitions.
- `Custom Agent Foundry`: an Awesome Copilot helper for designing custom agents.
- GitHub's hosted MCP server, authenticated by the client at use time.

It also includes a passive **Capability Sentinel** hook for GitHub Copilot CLI and cloud-agent sessions. At session start it checks the current project plus Copilot's standard capability locations. It supplies a concise warning to the agent only when it finds a collision. When an agent uses a capability-related search or read and receives multiple matching definitions, a narrow follow-up hook rechecks the inventory and supplies the same warning when warranted. It never installs, removes, disables, renames, or blocks anything.

The imported components are pinned to exact upstream commits. The custom agent remains unmodified; the skill contains small documented compatibility and security patches for GitHub Copilot. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source commits, local changes, and licenses.

## Agent Plugins 1.0 layout

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
└── com.github.copilot/
    └── agents/
        └── custom-agent-foundry.agent.md
```

- `plugin.json` declares the Agent Plugins 1.0 schema.
- `skills/` and `mcp.json` are portable Agent Plugins components.
- `com.github.copilot/` contains GitHub Copilot-specific components such as custom agents.
- The legacy Copilot-format `agents/` and `.mcp.json` paths are intentionally not used.

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
5. Ask Copilot to check this plugin for duplicate capabilities; confirm the `capability-collision-detection` workflow is selected and returns a report without changing files.
6. Start a new Copilot CLI session with intentionally colliding test capabilities installed. Confirm the **Capability Sentinel** adds a concise collision warning to the agent context without blocking the session.
7. Open the MCP server list, confirm GitHub's hosted server is present, complete authentication if prompted, and ask Copilot to inspect a repository you can access.

The sentinel runs in Copilot CLI and cloud-agent hook environments. It does not have a post-install lifecycle event, and VS Code does not currently expose this hook surface for plugins. A newly installed plugin is therefore checked at the next supported agent session, not at the instant of installation.

No personal access token or secret belongs in this repository.

## Expected diagnostic value

If this Agent Plugins 1.0 package, its custom agent, skill, and GitHub MCP all work in a personal environment but not in a managed work environment, compare the managed environment's Copilot policy, MCP policy, authentication restrictions, allowed MCP servers, and plugin marketplace/source policy. That isolates environment policy or authentication as the likely difference without dragging a full production plugin into the experiment.
