# Candidate Catalog Parity — Credential-Free Execution Question

Feature slug: `candidate-catalog-parity`. **Current result: PARTIALLY_PROVEN; execution gate UNRESOLVED.**
The initial contract below was NOT_EXECUTED. The dated local control evidence following it grants
no risk acceptance, hosted qualification or upstream execution authority.

## One Falsifiable Question

Can the selected existing validation route run the pinned candidate's package/config/build code
without repository write permission, private AQC/publication credentials or other exposed secrets,
while keeping any resulting artifacts outside trusted execution and preserving production?

## Basis And Scope

`UPSTREAM_POLICY.md` and `docs/upstream-vendoring-direction.md` require this boundary before and
after merge. `quality.local` currently has read-only contents permission, non-persisted checkout
credentials and no explicit private AQC token; `quality.aqc` is separate. That is source evidence,
not proof of candidate execution isolation. The existing trusted structural build is not a substitute.

Recommend assessing that existing job first, rather than adding a personal VM, service or new runner.
A concrete change to workflow/trust/runtime authority must be reviewed before it is applied. No route
is selected by this contract and no configuration, permission or security setting changes here.

## Minimum Future Evidence

- Freeze the exact source, candidate/overlay/package/lock hashes, intended entry command, job/host
  identity and authority. Identify what the host can and cannot attest.
- Inspect the effective job permission/credential injection and checkout cleanup boundaries using
  supported metadata and an approved inert fixture. Record presence/class only, never secret values,
  credential-file contents or copied tokens. Sanitized environment alone cannot prove filesystem isolation.
- Observe the fixture's permitted output and denied/absent credential/write access within approved
  fixture surfaces. Do not probe real credentials, other sessions or unrelated workspaces.
- Bind successful artifacts to source and command, feed them to trusted artifact-only validation,
  and show that trusted publication promotes bytes without rebuilding candidate code.
- Preserve the first failure/unknown result. Missing attestation remains unknown; do not weaken the
  boundary or treat missing observability as success.

## Ownership, Budget And Stop

Data owns the question; LaForge admits a finite test and routes execution to the existing executor.
No executor is dispatched now. Any future test needs its own finite allowance, approved surfaces and
fixture before execution; no new services, installation, credential changes or live model trials follow.
Stop on unexpected access, unsupported controls, source drift, denied operation or resource limit.

Classify actual future evidence PROVEN, DISPROVEN, PARTIALLY_PROVEN or INDETERMINATE and reintegrate
it into the plan. Until then the gate remains SPIKE_REQUIRED and this document is UNRESOLVED.
Do not copy a temporary shortcut into production or mark the whole migration implementation-ready.


## 2026-11-04 Bounded Boundary Assessment

Source baseline: `e93daccbb20ec6ff23d6f18a1ebd148f43a10ebb`. Upstream remains
`6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`. The selected first route to assess is still
`quality.local` on existing `ubuntu-latest`, with `publish.prepare` as its post-merge counterpart.
Neither job was modified or used for this experiment. No candidate build command was admitted.

### Threat model and observed controls

Candidate package lifecycle scripts, Astro configuration and build JavaScript are executable inputs.
Treat them as able to attempt environment reads, same-user filesystem access, process/service access,
network transmission and output alteration. Assets are job/checkout credential classes, private AQC
and publication credentials, canonical source/accepted outputs and the artifact handoff. This is a
bounded source-and-control assessment, not a complete exploit model or host attestation.

| Boundary | Source evidence | Proven limit / missing evidence |
| --- | --- | --- |
| Remote repository authority | `quality.yml` and `publish.yml` default to `contents: read`; private AQC and publication write permissions are in separate jobs. | Establishes the declared workflow permission/injection separation, not absence of all same-job credentials. |
| Checkout authentication | Both build jobs use pinned checkout with `persist-credentials: false`. The pinned checkout implementation removes authentication in its checkout cleanup. | Source-backed cleanup design; this spike did not read credential stores or dynamically attest runner state. |
| Candidate process | Current build steps run directly on the hosted job; no candidate-specific filesystem/process/network confinement is configured. | An environment allowlist alone is not a sandbox. No hosted denied-access observation exists. |
| Trusted validation/promotion | Separate jobs validate prepared artifacts as data with hashes/source binding; publication and Pages steps do not rebuild candidate code. Existing main runs 41794586788, 41794586903 and 41794682726 passed their six jobs. | Reuses existing structural-adapter evidence. It does not prove candidate isolation, adversarial host resistance or artifact semantics. |

GitHub documents a per-job installation token and notes that actions can access its context even
without an explicit token input. It also documents administrative privileges on standard hosted
runners. Therefore read-only permissions and non-persisted checkout credentials cannot alone be
used as evidence that a directly executed build has no reachable credential channels. This is an
inference about insufficient proof, not an observation of a token leak or successful privilege use.
Sources: [job token](https://docs.github.com/en/actions/concepts/security/github_token),
[token context](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token),
[hosted runner privileges](https://docs.github.com/en/actions/reference/runners/github-hosted-runners),
[pinned checkout cleanup](https://github.com/actions/checkout/blob/34e114876b0b11c390a56381ad16ebd13914f8d5/src/git-source-provider.ts).

### Local controlled observation

The retained [fixture](fixtures/credential-free-environment-control.mjs) is marked `DO_NOT_COPY`:
it deliberately implements an environment-only negative control, never a candidate sandbox. It
creates its own temporary workspace, empty home, permitted output and sibling synthetic canary/write
files. It accesses only those approved synthetic surfaces, using the existing Node 22.15.1 runtime.
There is no network, package/config/build execution, real credential probe, permission change to an
existing file, new dependency, host setup or privileged operation.

The freeze preceded the first execution and bound source/fixture/runtime hashes, two child runs,
3-second child limits, byte limits and a resource stop. The initial attempt stopped on its first
observer assertion: the child reported `__CF_USER_TEXT_ENCODING` in addition to the supplied keys.
Its value was not read. No filesystem/security result is credited from that failed observation.
The original source, freeze, stderr and incomplete result remain retained as INDETERMINATE.

A separately recorded ordinary fixture correction, under the same task/resource/time boundary,
allowed that one additional key name to be reported while rejecting any other extra key. It did
not erase the key, inspect its value, amend the original freeze or declare the first attempt passed.
One corrective run then completed both controls; no further retry was made. Across both invocations,
three child processes ran: one before the initial assertion and two in the corrective run. This is observer repair,
not a relaxation of the project's credential-free execution policy.

| Observation | Positive observer control | Environment allowlist only |
| --- | --- | --- |
| Synthetic token environment key | Present | Absent |
| Explicitly approved same-user sibling canary readable | Yes | Yes |
| Explicitly approved sibling write control changed | Yes | Yes |
| Permitted output written/read back | Yes | Yes |
| Additional environment key, name only | `__CF_USER_TEXT_ENCODING` | `__CF_USER_TEXT_ENCODING` |
| Canary content and existing fixture modes preserved | Yes | Yes |

The corrective process exited 0 with 1,011 stdout bytes and no stderr. All 105 tracked baseline
files stayed byte-identical during execution, and both owned temporary fixture levels were removed.
Corrected fixture SHA-256: `146d303913d48c2f6b192a0b71d5488515be9026bf8e5f66c1547f63a1e3107a`.
Raw first/corrective results and exact source/runtime/input bindings are retained separately as
operational evidence. The fixture is not wired into CI or production.

[SECURITY_PROPERTY / OBSERVABLE_OUTCOME] The reached local result disproves the narrow claim that
an environment allowlist by itself prevents same-user filesystem access. It does not demonstrate
access to any real credential, prove what a hosted candidate can reach, or test network isolation.
The observed extra key also prevents a claim that only supplied environment keys necessarily appear.

### Disposition and plan reintegration

Aggregate result: **PARTIALLY_PROVEN**. Declared job separation and the local observer's narrow
negative control are established; the mission-critical execution property remains **UNRESOLVED /
SPIKE_REQUIRED**. No risk acceptance or upstream implementation handoff follows. Retain the fixture
as `DO_NOT_COPY` evidence rather than a production reference sandbox.

- `SOURCE_SPECIFIED / ALIGNED`: preserve the no-secret, no-write-authority candidate boundary and
  artifact-only trusted validation/promotion before and after merge.
- `DERIVED_NO_ARCHITECTURE_CHANGE / ALIGNED`: do not admit upstream execution through the current
  direct build steps based on an environment allowlist or successful structural-adapter CI.
- `IMPLEMENTATION_DETAIL / NEW_ARCHITECTURAL_DECISION`: selecting a candidate-specific restricted
  child runtime is still open. A pinned, restricted container inside the existing job is a concrete
  candidate for review, not an installed/selected/verified mechanism or a requirement for another
  personal VM. Its filesystem mounts, runner/service/token channels, network and output authority
  must be explicit before an inert hosted proof. Do not modify workflow/security controls in this spike.

The smallest next slice is to review that one child-execution boundary, then test it with inert
positive and denied-access controls on the actual selected route. Only a passing, source-bound result
may admit upstream package/config/build code. Until then, preserve the throwing guard, production,
accepted pins/output, inactive candidate integration and disabled automatic baseline movement.
This assessment establishes neither website parity, measured benefit nor whole Mission 9/10 acceptance.
