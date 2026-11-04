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

## Final Bounded Delta Review

Current Result: PASS

The preceding FAIL, original P1 finding and original source hash remain the initial outcome.
This follow-up resolves Issue 1; it does not retroactively turn that outcome into a pass.

Reviewed source candidate: `8fec2f58d40e2e6af08e26a577d33f1b142b2c4b`.
The only projector logic delta is normalization of a string author to `{ name: value }`, together
with validation that a supplied object URL is a nonempty string. Supported objects and absent
metadata retain their prior semantics. The implementation record documents the mapping.

The independent test owner appended the author control without changing the original test prefix.
Its first run recorded three passes and one string-author assertion failure after absent/object
controls succeeded. The implementor's one subsequent focused run passed 4/4. This reviewer inspected
those assertions and retained logs; no suite or projector was rerun. Corrective real stdout is
byte-identical to the original object-author projection, preserving the verified input HEAD,
24-input inventory and content digest. All original private first-result evidence is unchanged.

Resolved projector SHA-256:
`23b2d5d24df6b5091401e0c0d43373f3ed1c7cd975300d302fa83802e864f810`.
Final independent test SHA-256:
`0bddc6f8840fb2cb7aa0531e9cfcb324fb3764bac720bb7a729ba6e3a7d0654f`.
The original test prefix retains the earlier recorded hash. No blocking finding remains; there
are no accepted risks or optional improvements required for this inert projection boundary.

The coordinator's Project State and source PR explanation accurately describe committed-HEAD
local data preparation and preserve the unknown contributor/install/integration limits. The intended
Ops mirror at `c3791d200bd11a7adeefe43d5c80c692e6437c03` and its explanation are also accurate
as a conditional post-merge reconciliation. They preserve history, inventory, Stable V1, priorities
and Active This Week. Publication is conditional on an actual clean source merge, passing main
checks, and confirmation that linked source facts match the reviewed logic. Future main links are
intended publication pointers; this review does not assert those pages already exist on main.

Only this review follow-up may be added after the source candidate reviewed here. Publication
must bind the final source revision and preserve the reviewed code, tests, package and Project State
hashes; unseen logic is not covered by this judgment. The initial scope and remaining execution,
overlay, build/browser parity and baseline/publication gates above remain unchanged. No website
parity, measured benefit or whole Mission 9/10 acceptance follows from this PASS.
