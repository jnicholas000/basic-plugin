# Upstream policy

This project borrows the marketplace and website *structure* of [Awesome Copilot](https://github.com/github/awesome-copilot), not its resource catalog.

- `UPSTREAM_AWESOME_COPILOT_REF` pins the upstream reference used by scheduled sync and site builds.
- The upstream checkout is build-time-only and is never copied into this repository.
- Local plugins and AQC findings are authoritative for what is published.
- A sync PR may update the pin and selected structural metadata; it must not import agents, skills, prompts, or instructions without review.

The upstream project is MIT licensed. See `licenses/awesome-copilot-MIT.txt`.
