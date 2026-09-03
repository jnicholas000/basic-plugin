# Third-party notices

The following components are vendored from commit-pinned upstream sources. Local changes are identified below so attribution remains accurate instead of doing that charming open-source thing where modified code is labeled “unmodified.”

## Anthropic skill-creator

- Source: <https://github.com/anthropics/skills/tree/53048666b05b4799081517d00e09e0a2dd688678/skills/skill-creator>
- Upstream commit: `53048666b05b4799081517d00e09e0a2dd688678`
- Local path: `skills/skill-creator/`
- License: Apache License 2.0, included at `skills/skill-creator/LICENSE.txt`
- Local changes:
  - document the `run-N` directory level required by the included benchmark aggregator;
  - escape HTML-significant characters in JSON embedded by the evaluation viewer;
  - prefer GitHub Copilot CLI for description-trigger evaluation and optimization, with Claude Code retained as a fallback;
  - surface CLI or telemetry failures instead of counting them as negative trigger results.
- Copyright and attribution remain as supplied by Anthropic. The local modifications remain distributed under Apache-2.0.

## Awesome Copilot Custom Agent Foundry

- Source: <https://github.com/github/awesome-copilot/blob/2ba72cd14253500bbb747b5f01e72dd03fbafcb0/agents/custom-agent-foundry.agent.md>
- Upstream commit: `2ba72cd14253500bbb747b5f01e72dd03fbafcb0`
- Local path: `agents/custom-agent-foundry.agent.md`
- License: MIT, included at `licenses/awesome-copilot-MIT.txt`
- Copyright GitHub, Inc.
- Local changes: none.

## GitHub MCP server

- Project: <https://github.com/github/github-mcp-server>
- Hosted endpoint: `https://api.githubcopilot.com/mcp/`
- No GitHub MCP source code is vendored by this repository.
