# Owned rootfs mode correction — independent Bashir review

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `e88526a9a5dc8c14576ac6d0728c11328045986c`.
Boundary: offline harness correction only; no new runtime action or qualification.

Result: **FAIL — one ancestor-path mutation gap requires correction**.

## Summary

Bashir read the installed Starfleet 0.2.0 reviewer role, core principles and review rubric in
this task, and independently inspected the approved Data contract, Odo’s frozen tests/actual
pre-fix observations, the new helper, actual controller integration and workflow delta.
The intended umask correction and bounded future error evidence are appropriately scoped.
One entry-validation gap can follow a replaced ancestor and chmod a directory outside rootfs
before a later sweep detects it. No runtime experiment or publication approval follows here.

## Required fixes

### Issue 1 — a replaced relative ancestor can redirect a permission mutation

- Type: Bug
- Severity: P1
- Basis: threat-model / acceptance-criterion; the explicit contract forbids following links
  or changing modes outside the acknowledged rootfs.
- Disposition: fix-now
- Reopens Current Mission: yes
- Location: `fixtures/owned-rootfs-modes.mjs`, `checkEntry` / `chmodOwned`.
- Description: entry validation rechecks the pinned canonical root and final entry identity,
  but does not check relative ancestors against the complete preflight map or require canonical
  resolution of the child path. `O_NOFOLLOW` applies to the final path component only. If an
  already-preflighted `npm` directory is moved outside rootfs and replaced by a symlink before
  normalizing `npm/bin`, lstat/open can still reach the original bin inode through that ancestor
  link. The held final descriptor then passes identity checks and fchmod changes the outside
  path before the final whole-tree sweep rejects the replaced `npm` entry.
- Impact: the helper can violate its bounded mutation surface despite preserving the original
  final entry inode. A later rejection does not undo that out-of-rootfs permission change.
- Suggested Fix: freeze an independent narrow owned-filesystem replacement regression before
  producer repair, then validate canonical child resolution and every applicable relative
  ancestor’s original directory identity before entry mutations. Keep the existing pinned root,
  descriptor/final-identity checks and complete preflight. Do not build a general permission API
  or claim adversarial race-free host isolation from this local correction.

## Accepted risks

None.

## Optional improvements

None requested.

## Reviewed boundaries and evidence

The helper is import-inert. It validates root identity/current owner, holds the root descriptor,
preflights the complete bounded tree, checks exact expected directory membership and both config
files before the first chmod, and limits changes to directories0755 plus two exact newly owned
empty regular single-link config files0444. Payload modes/bytes, private siblings and process
umask are preserved by the checked candidate and independent tests. Bounded summary is count/
digest, eight fixed critical-directory records and two config records; it does not embed a full
mode array in the64 KiB receipt or claim historical tar-mode evidence.

The derived controller captures rootfs identity before population, compares helper and independent
test hashes through its retained head/test-merge source binding, and calls normalization once
after payload/config creation and before tar/import. Future native start failures receive only
one of three fixed error enums. UTF-8/length/explicit intended exec-path checks reject arbitrary,
ambiguous or malformed data without returning raw stderr, environment or host paths. The enum
is reported-error classification, not proof of cause or an execution-success gate.

The workflow delta adds only the owned inert Node test command inside the existing local unit
step. It adds no job, trigger, permission, runtime hook, acquisition or control retry. Original
receipts and historical INDETERMINATE/unknown-cause status remain unchanged. Runtime, policy,
limits, umask and the retired action boundary are preserved.

Odo/Data freeze commit `557753fa87b6b1454093c832ce4d97596268d803` preceded producer changes.
The actual pre-fix source-extracted owned filesystem cases observed nested directories0700 and
configs0400 under umask077: one control passed, two intended-mode assertions failed and six
helper cases skipped. That is meaningful local behavior evidence, not a missing-export failure
or proof of historical container causation. Scotty reports final nine groups passing with no
skips in165.092125 ms. The earlier32 unchanged pure checks also passed once; they do not cover
the newly identified ancestor replacement case. Bashir did not rerun these suites.

| Candidate | SHA-256 |
| --- | --- |
| Data contract | `adc2afd333e628f83d21f4bec2be66f3c7dd877159607da378c631d61f462bac` |
| Original helper candidate | `497324bc0eb012c4180705554546d948f2ce0691c97ca771ab041aa3a5354fad` |
| Derived controller candidate | `9839b44384d3232d917f24b971c3b426f033c0f2e0d16178cbbf2b6b4a842a01` |
| Frozen Odo test | `50eb4d13e2be8dfbeb6059a7ad1728f484a53fd7d9e988c99dd9ed2484a9d25e` |

Human comprehension is sufficient: the contract, ownership note and implementation handoff
explain the restricted scope, mode semantics, evidence limits and recovery. The known prior
exit126 cause remains unproven and the original record is not modified. This offline correction
cannot qualify npm, candidate dependencies/builds, site parity or full Missions9/10.

Bashir performed read-only source/diff/evidence inspection and wrote only this review artifact.
No test, controller, main, target runtime, archive acquisition, cache, container, credential,
security setting, Git mutation or publication occurred in this review. No denial or uncertain
action occurred. Independent regression/repair/delta review remain before publication readiness.
