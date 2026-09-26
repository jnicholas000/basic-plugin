# Upstream policy

This project borrows the marketplace and website *structure* of [Awesome Copilot](https://github.com/github/awesome-copilot), not its resource catalog.

- `UPSTREAM_AWESOME_COPILOT_REF` is an immutable commit SHA reviewed through the scheduled/manual sync PR flow.
- `aqc.config.json` and workflows pin the private AQC engine to an immutable reviewed commit. AQC upgrades require an explicit repository change and review.
- The upstream checkout is comparison-only. Basic Plugin records a reviewed structural baseline and implements a local adapter; the upstream resource catalog is never copied into this repository.
- Local plugins and AQC findings are authoritative for what is published.
- Upstream website changes are classified before the reviewed pin advances: `routine` changes may auto-merge after validation, `review` changes open a human-reviewed sync PR, and `architecture` changes stop automatic pin advancement and open/refresh a manual migration issue.
- Architecture classification is deterministic and intentionally conservative: framework additions/removals, framework major-version changes, critical website-root removal, large add/remove replacements, or very large website diffs trigger the manual path.
- A sync PR may update the Awesome Copilot pin and selected structural metadata; it must not import agents, skills, prompts, or instructions without review.
- Fork and Dependabot pull requests never receive `AQC_READ_TOKEN` in contribution-triggered workflows; they run the secret-free local checks.
- A maintainer authorizes private validation of one exact untrusted head by applying `aqc-trusted-validation`. The trusted base workflow checks out the immutable AQC engine with non-persisted credentials, checks out the contribution separately without credentials, installs only AQC dependencies, executes no contribution scripts, and records `Trusted AQC checks` on that head.
- A later contribution commit has no trusted status. Remove and reapply the label to authorize and validate the new exact head. Require either the same-repository `Private AQC checks` result or the exact-head `Trusted AQC checks` result before merge.

The upstream project is MIT licensed. See `licenses/awesome-copilot-MIT.txt`.

## Website synchronization boundary

The automation optimizes the common path without pretending an architectural rewrite is a normal dependency bump. Routine changes can advance automatically only after local and pinned AQC validation. Review-class changes advance through a PR that explicitly requires human review. Architecture-class changes leave `UPSTREAM_AWESOME_COPILOT_REF` on the last reviewed baseline and create a durable migration issue with the measured diff and trigger signals.

The local branding/adaptation layer should stay small and separate from upstream implementation so a manual architecture migration means reattaching intent to the new upstream structure, not reconstructing a fork by hand.

## Current reviewed website architecture

The current manual architecture migration is reviewed against Awesome Copilot commit `6c4d33b9cfca967a28bb2962ef4d55e4a384c88c` (2026-09-26). The local adapter tracks its Astro 7 + React 19 + Primer Brand page structure without importing the upstream resource catalog. The pin in `.env.example` and `website/upstream-baseline.json` move together for routine/review-class syncs.
