# Vendored candidate validation: 2026-10-07

## Result

The merged vendoring foundation was validated at Basic Plugin main
`28f9f6e7fd3fcebbca12cc16e6b5078ade2a4f8c`. The exact reviewed Awesome Copilot
commit `6c4d33b9cfca967a28bb2962ef4d55e4a384c88c` was prepared as a candidate
without changing accepted pins or generated production artifacts. Candidate generation
passed and reproduced the three-file seed. Static classification is `routine` for
the unchanged accepted/candidate pair; this is not build or parity approval.

**Final validation remains indeterminate.** The seed is not a runnable website.
No production publication, deployment, baseline advancement, or upstream resource
catalog import occurred.

## Executed evidence

- `npm run build`: passed all 27 Node tests, accepted provenance validation,
  structural-baseline validation, marketplace/site generation, and clone validation.
- `python -m unittest discover -s tests -p 'test_*.py'`: 26 passed.
- `UPSTREAM_REPO_DIR=<read-only checkout> UPSTREAM_HEAD=<reviewed SHA>
  npm run site:preflight`: unchanged-pair `routine` report; evidence SHA-256
  `3eb82df5617377c5c71d82c5144c5dd34681d7c7578cb7b796fcabe33bc17996`.
- `UPSTREAM_REPO_DIR=<read-only checkout> UPSTREAM_HEAD=<reviewed SHA>
  npm run site:vendor`: passed, candidate role, three retained files, no upstream
  scripts executed. Accepted-tree content digest and all committed outputs unchanged.
- `npm run build --prefix website/vendor-candidate/website`: attempted and failed
  with exit 127 (`astro: not found`). No dependency installation occurred.
- Playwright browser availability probe: failed because no Chromium executable
  is installed in this runtime. No browser smoke was executed or inferred.

## Exact missing prerequisites

Installing Astro alone cannot make this seed pass. The reviewed copy/prune rules
retain only `website/package.json`, `website/astro.config.mjs`, and
`website/src/lib/site-data.ts`. They omit the dependency lockfile, page routes,
components, assets, and `src/integrations/pagefind-resources` imported by the config.
The config also requires `.all-contributorsrc` during a production build. The
owned catalog overlay deliberately throws instead of permitting upstream catalog
fallback. These are explicit migration boundaries, not transient build failures.

Browser smoke and vendored-versus-adapter parity therefore have no vendored build
to inspect. The successful current-adapter build validates that adapter only.

## System-owned continuation

Prepare a separately reviewed candidate-only materialization: explicit source
allowlist, pinned dependency lockfile, required entry routes/integrations/assets,
and an assertive local-catalog adapter. Confirm no upstream resource data enters
the site. Then execute dependency install/build in an ephemeral credential-free
runner, install a pinned browser there, and compare home/catalog/detail behavior,
local resource inventory, status labels, search, mobile overflow, links, console
errors, and unexpected network requests against the current adapter. Keep
production source and accepted pins unchanged until those gates pass.

Do not weaken the throwing overlay, add upstream catalog data, or substitute the
structural adapter as a candidate merely to obtain a green result. The existing
credentialed AQC/publication jobs must continue consuming artifacts as data.
