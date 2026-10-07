# First vendoring slice

The structural adapter is still the production site. This slice establishes a reversible
vendoring seed, static preflight, and the publication isolation boundary. It does not claim
vendored-site parity, browser smoke, successful hosted publication, or automatic advancement.

## Generated seed

`website/vendor.config.json` records the exact accepted upstream commit, copy/prune/keep
inputs, overlay entry point, and classification policy. The small seed retains package/config
files and one asserted catalog integration point. It deliberately excludes the upstream resource
catalog. The owned catalog overlay blocks using the seed as a production site until parity has
been reviewed. No upstream install, build, configuration, or package script executes during copying.

```sh
UPSTREAM_REPO_DIR=/path/to/awesome-copilot npm run site:vendor
npm run site:vendor:validate
```

The upstream checkout must already contain the full immutable commit. Generated roots are replaced
wholesale after successful preparation. Never edit `website/vendor-generated/`; change the
reviewed config or overlay and regenerate. `provenance.json` records SHA, accepted/candidate role,
inputs, rule count, config/overlay digests, ordered file hashes, file count, and content digest.
Candidate generation leaves the accepted SHA unchanged and labels provenance `candidate`.

## Read-only static preflight

```sh
UPSTREAM_REPO_DIR=/path/to/awesome-copilot \
UPSTREAM_HEAD=<full-candidate-sha> UPSTREAM_REPORT=/tmp/preflight npm run site:preflight
```

The CLI captures Git diff/tree and package metadata only, then writes a content-addressed evidence
report. Failed capture, malformed/truncated/unbound evidence, and unresolved framework versions
are `indeterminate`. Framework replacement/major changes, lost required overlay points, and the
configured consumed-implementation threshold are `architecture`. Both stop automated candidate
execution. `routine` requires the explicit non-executable asset allowlist; all other surfaces and
renames require `review`. Classification is replayable with `classifyPreflight` and captured JSON.
Overlay file rules are the integration authority; directory pruning does not create integration points.

The scheduled sync now captures this report with read-only access. It does not move the accepted
pin, execute upstream code, create a sync PR, or enable auto-merge. The old three-state classifier
and pin-edit helper remain regression-tested historical adapter tools, not the scheduled path.
A later candidate sandbox/final classifier and browser smoke remain required before advancement.

## Post-merge artifact promotion

Publication has three jobs within one source-head-bound workflow run:

1. `prepare` checks out without persisted credentials, builds with read-only permissions and no
   secrets, materializes the plugin distribution, validates the local inventory, and uploads a
   SHA-bound archive and content digest.
2. `validate` downloads that artifact, verifies digest and source binding, extracts it with the
   Python data filter, and uses only the pinned AQC engine against generated artifacts as data.
   It installs only AQC dependencies with lifecycle scripts disabled. It never builds the site.
3. `publish` consumes only the validated artifact from that run, verifies the same binding and
   current main head, and promotes bytes to `marketplace` using shell/Git with hooks disabled.
   It runs no repository Node scripts, package scripts, site build, or vendored configuration.

PR quality likewise builds in a secret-free local job and passes generated artifacts to the
private AQC job. The existing maintainer-authorized fork/Dependabot exact-head data-only path
remains intact. Reusable security and quality rules stay in AQC; local checks test clone-specific
provenance, catalog behavior, and workflow boundaries.

This establishes isolation in workflow source and local regression coverage. Hosted AQC access,
artifact transport, publication, and Pages deployment still need actual run evidence. Automatic
routine advancement remains disabled even when the static classification is routine.
