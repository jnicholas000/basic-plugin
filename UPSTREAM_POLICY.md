# Upstream policy

This project borrows the marketplace and website *structure* of [Awesome Copilot](https://github.com/github/awesome-copilot), not its resource catalog.

- `UPSTREAM_AWESOME_COPILOT_REF` is an immutable commit SHA reviewed through the scheduled/manual sync PR flow.
- `aqc.config.json` and workflows pin the private AQC engine to an immutable reviewed commit. AQC upgrades require an explicit repository change and review.
- The upstream checkout is build-time-only and is never copied into this repository.
- Local plugins and AQC findings are authoritative for what is published.
- A sync PR may update the Awesome Copilot pin and selected structural metadata; it must not import agents, skills, prompts, or instructions without review.
- Fork pull requests never receive `AQC_READ_TOKEN`; they run the secret-free local checks and require trusted AQC validation before merge.

The upstream project is MIT licensed. See `licenses/awesome-copilot-MIT.txt`.
