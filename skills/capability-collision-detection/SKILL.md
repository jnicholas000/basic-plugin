---
name: capability-collision-detection
description: Inventory and compare skills, custom agents, Agent Plugins, and MCP server definitions to find duplicate IDs, names, shadowing risks, and materially overlapping responsibilities. Use whenever a user asks what is installed, whether plugins or skills overlap, why duplicate agents appear, whether a local capability shadows a plugin capability, or what should be consolidated, renamed, disabled, or removed. This skill is read-only and never changes installations.
---

# Capability Collision Detection

Use this skill to create evidence before changing a plugin, marketplace, agent, skill, or MCP configuration. It distinguishes an **exact collision** from a **possible overlap** so a similarly named capability does not become an accidental deletion target. Naturally, invisible precedence rules are not a governance strategy.

## Scope and safety

- Inspect only roots the user identifies, plus the current workspace when it is relevant.
- Do not scan a home directory, a whole drive, or unrelated repositories.
- Do not install, uninstall, disable, rename, edit, or delete a capability.
- Treat platform-reported installed items and files found in explicitly supplied install/source roots as separate evidence sources.
- State when an installed-capability location cannot be verified. Do not claim a complete installation inventory from a workspace-only scan.

## Workflow

1. Establish the scan roots. Include the workspace and any known plugin-install or marketplace-cache roots that the user wants compared. For client-specific installed listings, use the client UI or its documented command first and record the result as evidence.
2. Run the bundled scanner once with every approved root:

   ```bash
   python3 skills/capability-collision-detection/scripts/scan_capabilities.py \
     --root <workspace-or-source-root> \
     --root <installed-plugin-or-cache-root> \
     --format markdown
   ```

   Use `--format json` when a follow-on tool needs structured findings. The scanner reads `SKILL.md`, `*.agent.md`, `plugin.json`, `mcp.json`, and `.mcp.json`. It skips generated/dependency directories.
3. Validate a finding before recommending action:
   - **Exact collision**: same normalized identity and same capability type in more than one source.
   - **Cross-type name collision**: the same identity is used by different types, such as a skill and an agent. This is a discoverability risk, not automatically an error.
   - **Possible responsibility overlap**: same-type descriptions have high token similarity. Treat this as a review queue, never proof of duplication.
4. Produce the report below. Recommend the smallest reversible resolution and name the authority that should own the retained capability.

## Report format

```markdown
# Capability Collision Report

## Coverage
- Scanned roots: ...
- Verified installed-capability sources: ...
- Limits: ...

## Inventory
| Type | Count | Sources |
| --- | ---: | --- |

## Exact collisions
| Capability | Type | Sources | Risk | Recommended resolution |
| --- | --- | --- | --- | --- |

## Cross-type name collisions
| Identity | Types | Sources | User impact | Recommended resolution |
| --- | --- | --- | --- | --- |

## MCP aliases
| Server identities | Target/configuration evidence | Confidence | Review decision needed |
| --- | --- | --- | --- |

## Possible responsibility overlaps
| Capabilities | Evidence | Confidence | Review decision needed |
| --- | --- | --- | --- |

## Recommended next action
One bounded, read-only or reversible action. If there are no confirmed collisions, say so plainly.
```

## Resolution rules

- Prefer one canonical capability with a stable, namespaced identity where the platform supports it.
- Rename only the weaker or local definition after confirming client precedence and references.
- Do not remove an installed capability merely because names match. First establish source, owner, current use, and precedence.
- For duplicate MCP servers, compare endpoint and authentication configuration before declaring them duplicates.
- Treat differently named MCP servers with the same endpoint or stdio command as aliases requiring review, even when their configuration differs.
- Escalate uncertain client precedence as a verification task rather than guessing which definition wins.
