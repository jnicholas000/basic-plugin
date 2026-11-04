# Candidate Catalog Projection Review

Feature slug: `candidate-catalog-parity`; slice: inert local projection.

Result: FAIL

## Summary

The projector substantially follows the frozen committed-HEAD, read-only projection contract, and
real baseline provenance matches its committed inputs. One supported metadata branch emits a shape
incompatible with the pinned consumer and must be corrected before readiness approval.

## Required Fixes

### Issue 1 — Normalize author metadata to the consumed shape

- Type: Bug
- Severity: P1
- Basis: acceptance-criterion; frozen plugin consumed-field mapping
- Disposition: fix-now
- Reopens Current Mission: yes
- Location: `eng/project-local-catalog.mjs:119` and plugin construction at line 148
- Description: Validation accepts a nonempty string `manifest.author`, then plugin construction
  forwards that string unchanged. At pinned upstream ref
  `6c4d33b9cfca967a28bb2962ef4d55e4a384c88c`, both `pages/plugin/[id].astro`
  and `components/brand/PluginDetail.tsx` declare author as `{ name?: string; url?: string } | null`.
  The component consumes `item.author?.name` for attribution. For example, an accepted
  `author: "Local Author"` produces a string where the consumer requires an object.
- Impact: Known author attribution disappears from the detail presentation, and the projection
  violates its promised consumed-field shape. The current real manifest uses an object, so its
  successful projection and existing tests do not exercise this branch.
- Suggested Fix: Normalize a string author to `{ name: value }`, preserve supported object fields
  and absent-author null semantics, and document this mapping. Have the independent test owner add
  a committed string-author control that verifies consumer-shaped output. Preserve the original
  tests/results and rerun only affected focused verification before bounded delta review.

## Evidence And Attribution

- Reviewed the projector, package-script delta, frozen field contract, parity-plan change,
  independent tests and first-result/implementation records. Package integration adds only the
  focused test script to the trusted existing build; it does not activate the projection as site input.
- The independent test author's initial three tests failed on absent implementation; no negative
  behavior was credited. The implementor's first three failed on rejection of Git's valid UTC `Z`
  date form. The retained bounded date repair was followed by 3/3 passing. This reviewer inspected
  those logs and assertions without rerunning the suite or executing the projector.
- Independently checked the saved real JSON against committed HEAD
  `cbf6666ed1ed82ba9935a9b884ac5842caf5a36d`: all 24 input paths, ordinary modes, sizes and
  SHA-256 values match Git blobs; every projected resource date matches its bound Git log value.
  Counts are one agent, two skills, one plugin and four search records, with empty unsupported
  categories. Recomputed payload digest matches
  `2c5feb2193c266c2f28ce5232ba740855c7073b393ba00210a9ee8ae9fee662c`.
- All 97 protected before/after records match each other and current bytes. The throwing guard,
  accepted pins/config/output, workflows and production adapter are unchanged. Independent tests
  retain SHA-256 `efa8b9a00d838c26ce1db7763d65325f5a46f11f7e7fe1165603a7946a6924f4`.
- Reviewed projector SHA-256:
  `ca00f217d8af048132d4817f8f4255c7493e4ab7c4fba6d18459d0d0b6f1c2a3`.
  Frozen contract SHA-256:
  `504349ec114a82e3facb922152d6997dda8fc274b1025ea3634e3a4c7fbecad2`.

## Accepted Risks

None. The metadata mismatch is a required correction, not an accepted risk.

## Optional Improvements

None required beyond the bounded correction.

## Remaining Gates

Output remains `LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE`. Projection reads committed HEAD;
working-tree edits and untracked files are deliberately excluded. Metadata/body paths are data,
not rendered or executed content. Contributor count is unknown, installation actions unverified,
and candidate integration is not activated. Credential-free execution proof, asserted overlays,
build/browser parity and any baseline/publication change retain separate gates. No hidden-input,
independent-oracle, model calibration, comparative benefit or full Mission 9/10 claim is established.
Return the required fix to LaForge and the appropriate implementation/test owners.
