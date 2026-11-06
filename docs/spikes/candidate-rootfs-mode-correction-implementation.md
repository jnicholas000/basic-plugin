# Owned rootfs mode correction — Scotty implementation handoff

Feature slug: candidate-catalog-parity. Date2026-11-06. Basee88526a9a5dc8c14576ac6d0728c11328045986c. Scotty reread the installed StarfleetCrew 0.2.0 implementation role and Data's narrow mode contract. Independent Odo/Data freeze commit557753fa87b6b1454093c832ce4d97596268d803 preceded producer changes. Odo's meaningful pre-fix filesystem failures remain in its source-owned note; they are not loader failures or historical runtime causation evidence.

Implemented only owned-rootfs-modes.mjs and narrow integration into the derived same-job controller. The helper holds the root descriptor, validates current-owner/canonical-root and original dev/inode identity, preflights the complete expected tree before chmod, rejects links/specials/missing/foreign directories and invalid/nonempty/hardlinked configs, and bounds total visited entries 8208/depth 34/mode record bytes 1 MiB. It explicitly normalizes only newly owned rootfs directories 0755 and the two exact newly owned empty configs 0444, rechecking descriptor/path identities and resulting modes. Other payload modes, bytes, private parent/input/output paths and process umask are preserved. Summary contains only bounded directory count/digest, eight critical directory records and two config records.

Controller captures rootfs identity before population, binds helper and independent mode-test hashes through the existing actual head/test-merge source comparison, and calls normalization exactly once before tar/import. Actual Docker start failures may add only an allowlisted fixed native-error enum. The helper emits no raw stderr, host paths, environment or inferred cause; ambiguous/oversize/invalidUTF8 input stays UNCLASSIFIED. Original attempt/deadlines/runtime/selected child policy and retired execution guards are unchanged. No new action hook or control retry exists.

Verification after final code: both modified/new JS files syntax-checked using existing hostNode 22.15.1. New independent nine-group controlled owned-filesystem suite succeeded 9/9 with no skips in 165.092125 ms; fixtures restored their temporary process umask and removed their own inert trees. The previously requested 32 pure checks had already been run once before the coordinator's narrower clarification:12 same-job/cleanup methods OK 0.009 s,11 availability/ownership methods OK 0.100 s,9 npm pure tests OK 98.066292 ms. No further repetition occurred. Those existing checks are preservation/contract evidence, not new mode runtime qualification.

No actual wrapper, archive/download/install, target Node 24/npm, container, credential/security probe, simulator, workflow, PROJECT/Ops, Git mutation or publication was performed by Scotty. Historical originals/probes/tests/receipts remain unchanged. The helper is a DO_NOT_COPY bounded harness correction, not a generic permission API. Actual historical 126 cause remains unproven; no new runtime success is claimed. Handoff was sufficient after coordinator clarified 8208 as total entries. Independent Bashir review and coordinator publication remain pending; no implementation review verdict is issued.

## Source hashes
- `docs/spikes/fixtures/owned-rootfs-modes.mjs`: `497324bc0eb012c4180705554546d948f2ce0691c97ca771ab041aa3a5354fad`
- `docs/spikes/fixtures/run-npm-same-job-control.mjs`: `9839b44384d3232d917f24b971c3b426f033c0f2e0d16178cbbf2b6b4a842a01`
- `docs/spikes/fixtures/test-rootfs-directory-modes.mjs`: `50eb4d13e2be8dfbeb6059a7ad1728f484a53fd7d9e988c99dd9ed2484a9d25e`

## Bashir ancestor-redirection correction

Bashir identified a P1 in helper 497324bc: final-component O_NOFOLLOW alone did not reject a moved npm ancestor replaced by a symlink before a later directory chmod. Odo froze the actual owned-filesystem regression before repair at commit fde3133a4eee6fa53e2e21551cfae29b2d107956; independent test SHA 7fb1e1be8f5f67c2f7a3b1fa241593e4ab24678bc64c0c1dced67249ae7efe5d. Its meaningful prior failure and original helper source remain retained. No outside project or real credential path was involved; the test used only its own temporary tree.

Minimal correction: checkEntry now validates every relative ancestor against its preflighted directory dev/inode/current-owner identity and canonical path, plus canonical final entry resolution. The final held-descriptor mutation guard runs after the deadline callback, so callback-triggered ancestor replacement is checked before fchmod. Existing root descriptor, complete preflight and output/file preservation logic remain. Import comment clarifies that the intentional owned-rootfs mode change does not alter permissions outside that root. Derived controller pins the corrected helper and independently changed test hashes.

One final ten-group owned-filesystem suite succeeded 10/10, zero skips, in 186.049834 ms; both modified JS files syntax-checked. Existing 32 pure checks were not repeated. No actual controller, target runtime, acquisition/install or container action occurred. Corrected helper SHA 47b544208400dcf72ab38a74f8b335061c7e51e3f17aa51b88dc5aaa9362dc4b; controller SHA 64c246e8d8042df9490e9627b4e8ef4f1f61a2adbde8f244beca301288b4a63a. Candidate frozen for independent Bashir delta review.

## Final pre-import owner hash-chain delta

Following Bashir/coordinator's narrow binding instruction, the derived Python owner's fixed PINS gained only the two exact final mode-helper and frozen mode-test identities. The existing PINS verification loop runs before the anonymous GET and therefore before the later host JS import. No branch, limits, policy, control flow or historical file changed. Final owner SHA: f303186e581eb24ea1536d97a2b24f0b9e1adf03244d2e283b7d8d9a3d0555e8.

Python AST parsing, literal-dictionary validation against actual helper/test bytes, source ordering of PINS-before-transfer and AST equality of all child_uncertain assignments versus the committed owner succeeded. No runtime or behavioral suite was repeated for these two literal entries. Final helper/controller remain 47b544208400dcf72ab38a74f8b335061c7e51e3f17aa51b88dc5aaa9362dc4b / 64c246e8d8042df9490e9627b4e8ef4f1f61a2adbde8f244beca301288b4a63a. Independent final review now covers all three producer files.

## Current offline checkpoint

Bashir independently returned PASS for the final bounded correction after checking the actual
source, the pre-fix mode failures, the ancestor-redirection regression and the owner-before-import
hash chain. The original FAIL and its resolution remain in
[candidate-rootfs-mode-correction-review.md](candidate-rootfs-mode-correction-review.md).
All ten final owned-filesystem groups passed with no skips; no new runtime observation occurred.
The old exit-126 result remains INDETERMINATE and its historical cause is unproven.
Normal exact-head checks and final publication follow-through remain separate requirements.
