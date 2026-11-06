# Owned rootfs mode correction — independent Bashir review

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `e88526a9a5dc8c14576ac6d0728c11328045986c`.
Boundary: offline harness correction only; no new runtime action or qualification.

**Current result: PASS for the bounded offline correction and normal publication checks.**
The original FAIL and P1 below are preserved; the final delta review records resolution.
No runtime action, npm qualification or historical-cause claim follows from this PASS.

Original result: **FAIL — one ancestor-path mutation gap requires correction**.

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
files before the first chmod, and limits changes to directories 0755 plus two exact newly owned
empty regular single-link config files 0444. Payload modes/bytes, private siblings and process
umask are preserved by the checked candidate and independent tests. Bounded summary is count/
digest, eight fixed critical-directory records and two config records; it does not embed a full
mode array in the 64 KiB receipt or claim historical tar-mode evidence.

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
The actual pre-fix source-extracted owned filesystem cases observed nested directories 0700 and
configs 0400 under umask 077: one control passed, two intended-mode assertions failed and six
helper cases skipped. That is meaningful local behavior evidence, not a missing-export failure
or proof of historical container causation. Scotty reports final nine groups passing with no
skips in 165.092125 ms. The earlier 32 unchanged pure checks also passed once; they do not cover
the newly identified ancestor replacement case. Bashir did not rerun these suites.

| Candidate | SHA-256 |
| --- | --- |
| Data contract | `adc2afd333e628f83d21f4bec2be66f3c7dd877159607da378c631d61f462bac` |
| Original helper candidate | `497324bc0eb012c4180705554546d948f2ce0691c97ca771ab041aa3a5354fad` |
| Derived controller candidate | `9839b44384d3232d917f24b971c3b426f033c0f2e0d16178cbbf2b6b4a842a01` |
| Frozen Odo test | `50eb4d13e2be8dfbeb6059a7ad1728f484a53fd7d9e988c99dd9ed2484a9d25e` |

Human comprehension is sufficient: the contract, ownership note and implementation handoff
explain the restricted scope, mode semantics, evidence limits and recovery. The known prior
exit 126 cause remains unproven and the original record is not modified. This offline correction
cannot qualify npm, candidate dependencies/builds, site parity or full Missions 9/10.

Bashir performed read-only source/diff/evidence inspection and wrote only this review artifact.
No test, controller, main, target runtime, archive acquisition, cache, container, credential,
security setting, Git mutation or publication occurred in this review. No denial or uncertain
action occurred. Independent regression/repair/delta review remain before publication readiness.

## Final delta review — ancestor P1 resolved

Result: **PASS for the bounded offline correction, subject to normal final-head repository and
explanation checks**. Runtime action remains **NOT AUTHORIZED / NOT EXECUTED** by this review.

Summary: Bashir independently inspected the repair diff, frozen Odo regression, updated source
hashes and the narrow pre-import source-pin delta. The sole P1 is resolved. No blocking issue
remains in the approved offline normalizer/classifier/call-site scope. This is not a claim of
universal hostile-host race freedom or a passing npm observation.

### Issue 1 resolution

The entry guard now validates every applicable relative ancestor against its original complete
preflight record, directory type, current owner and canonical resolution, then requires canonical
resolution and original identity for the final entry. The descriptor’s type/identity/owner checks
remain in place. The final entry validation occurs after the deadline callback and immediately
before fchmod; afterward descriptor and path modes/identity are rechecked. The held root descriptor,
canonical-root checks and complete preflight remain intact. An ancestor symlink or replacement
therefore rejects the reported deterministic redirection before a later descriptor mutation.
No general filesystem permission API or new host configuration is introduced.

Odo freeze commit `fde3133a4eee6fa53e2e21551cfae29b2d107956` preceded this producer correction.
Its one additional owned-filesystem test genuinely reproduced the defect in the original helper:
redirection occurred, helper eventually threw, but the moved sibling bin changed 0700 to 0755.
The targeted test failed. This directly establishes the specific local interleaving, not general
runtime isolation. The original nine cases are unchanged; the final attributed Scotty run passed
all 10 groups, zero skipped, in 186.049834 ms. Bashir did not rerun the suite. Existing unchanged
pure-suite results remain preservation evidence and were not expanded into a qualification program.

### Source chain and bounded integration

The controller updates only the helper/test digests in this repair. Its previously reviewed
single normalizer call remains after all owned payload/config creation and before tar/import;
rootfs identity was captured before population and private-parent/root checks surround the call.
Modes remain 0755 only for the exact expected newly owned directories and 0444 only for the two
empty regular single-link configs. Other payload modes/bytes, process umask, private siblings,
container policy, deadlines and historical records remain unchanged.

The Python owner adds exactly two fixed PINS entries for this helper and its frozen independent
test. The existing owner hash loop checks these before archive transfer and before host Node 22
can import the new critical helper. This closes the newly introduced input-binding dependency;
it changes no branch, command, phase, deadline, cleanup, resource limit or runtime admission.
The owner’s existing child-cleanup propagation remains unchanged. Literal pin consistency and
source ordering were checked; no behavioral rerun is required for two fixed hash entries alone.

The ordinary workflow adds only the inert host Node unit command inside its existing local
unit step. It introduces no action hook, job, trigger, permission, acquisition or target runtime.
Future mode summary/error classification stays bounded, synthetic/relative and explicitly
prospective. Raw native stderr and a historical root-cause claim are not emitted. The prior
exit 126 record and all raw receipts remain byte-identical and INDETERMINATE.

Final reviewed identities:

| Artifact | SHA-256 |
| --- | --- |
| Corrected helper | `47b544208400dcf72ab38a74f8b335061c7e51e3f17aa51b88dc5aaa9362dc4b` |
| Derived controller | `64c246e8d8042df9490e9627b4e8ef4f1f61a2adbde8f244beca301288b4a63a` |
| Python owner, only two pre-transfer pin additions | `f303186e581eb24ea1536d97a2b24f0b9e1adf03244d2e283b7d8d9a3d0555e8` |
| Independent test, original nine plus ancestor regression | `7fb1e1be8f5f67c2f7a3b1fa241593e4ab24678bc64c0c1dced67249ae7efe5d` |

Required Fixes: none for the approved offline correction. Issue 1 is fixed, not accepted risk.
Accepted Risks: none. Optional Improvements: none requested. Risks: actual corrected tar modes,
container startup, npm version/ci behavior and candidate dependency/build/site qualification
remain unobserved. Any future live action needs its own authority, frozen corrected source and
fresh admission; no existing failed action is retried or reclassified. No persistent installation,
security change or broader experiment is selected.

Bashir used source/diff/hash and supplied evidence inspection only, with no additional test run.
Only this review artifact was changed; no producer, workflow, runtime, archive, container,
credential, security setting, Git mutation or publication was executed by the reviewer.
