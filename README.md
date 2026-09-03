# basic-plugin

A deliberately small GitHub Copilot plugin for testing plugin and MCP behavior outside an enterprise-managed environment.

It contains exactly one top-level skill, one custom agent, and one MCP server configuration:

- `skill-creator`: Anthropic's skill authoring and evaluation workflow.
- `Custom Agent Foundry`: an Awesome Copilot helper for designing custom agents.
- `github`: GitHub's hosted MCP server, authenticated by OAuth at use time.

The imported components are pinned, unmodified upstream copies. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source commits and licenses.

## Install

Install directly from GitHub with Copilot CLI:

```shell
copilot plugin install jnicholas000/basic-plugin
```

For testing an unmerged branch, clone that branch and install the local directory:

```shell
git clone --branch feat/github-copilot-plugin https://github.com/jnicholas000/basic-plugin.git
cd basic-plugin
copilot plugin install .
```

## Smoke test

1. Run `copilot plugin list` and confirm `basic-plugin` is enabled.
2. Start Copilot CLI, run `/agent`, and select **Custom Agent Foundry**.
3. Ask it to draft a minimal read-only repository-review agent and confirm it produces a complete `.agent.md` file.
4. Start a fresh session and ask Copilot to create a tiny reusable skill; confirm the `skill-creator` workflow is selected.
5. Open `/mcp`, enable `github`, complete the OAuth prompt, and ask Copilot to inspect a repository you can access.

No personal access token or secret belongs in this repository.

## Expected diagnostic value

If the plugin, agent, skill, and GitHub MCP all work in a personal environment but not in a managed work environment, compare the work environment's Copilot CLI policy, MCP policy, OAuth restrictions, and allowed plugin marketplaces. That isolates policy or authentication as the likely difference without dragging a full production plugin into the experiment.
