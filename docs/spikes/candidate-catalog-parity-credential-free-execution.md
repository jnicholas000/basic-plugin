# Candidate Catalog Parity — Credential-Free Execution Question

Feature slug: `candidate-catalog-parity`. **Contract only; NOT_EXECUTED.** No result, risk acceptance,
host qualification or upstream execution authority is implied.

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
