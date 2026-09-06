# basic-plugin

A deliberately small Agent Plugins 1.0 package and marketplace pilot. The repository keeps one test plugin, while the website, marketplace branch, and CI automation follow the useful structural patterns of [Awesome Copilot](https://github.com/github/awesome-copilot).

AQC is authoritative for quality: pull requests run its `awesome-copilot-repository` profile before publication. The upstream catalog is not copied here.

## Layout

```
basic-plugin/
├── plugin.json                 # curated local plugin
├── skills/ and com.github.copilot/
├── website/                    # branded Holo wrapper
├── eng/                        # index, validation, and site generation
├── .github/workflows/          # AQC, sync, marketplace, and Pages jobs
└── marketplace/index.json      # generated catalog
```

The Agent Plugins 1.0 manifest, portable skill, Copilot custom agent, and GitHub MCP configuration remain unchanged. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for provenance and licenses.

## Automation

Set the `AQC_READ_TOKEN` repository secret to a read-only token that can checkout `jnicholas000/ai-quality-control`. Pull requests run `npm run build` followed by AQC. A push to `main` publishes a generated `marketplace` branch; the Pages workflow deploys its `site/` artifact. A weekly/manual sync job records the pinned upstream structure for review rather than importing upstream resources.

## Install

```shell
copilot plugin install jnicholas000/basic-plugin
```

For a branch under test, clone it and install the local directory.

## Diagnostic value

This is a small, reviewable testbed for plugin behavior and marketplace automation. It is intentionally not a mirror of Awesome Copilot's agents, skills, prompts, or instructions.
