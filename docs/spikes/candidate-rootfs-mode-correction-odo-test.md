# Owned rootfs modes — independent Odo regression

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: `e88526a9a5dc8c14576ac6d0728c11328045986c` and
[Data's offline correction contract](candidate-rootfs-mode-correction.md), SHA-256
`adc2afd333e628f83d21f4bec2be66f3c7dd877159607da378c631d61f462bac`.
Checkpoint: **TESTS FROZEN BEFORE PRODUCER; ACTUAL LOCAL MODE FAILURES REPRODUCED**.

Odo reread the installed Starfleet Crew 0.2.0 behavioral-integrity role and inspected the actual
derived controller. Only the new test and this note are Odo-owned changes. The coordinator's
spike-artifact destination supersedes the generic role location. No production fix is included.

## Frozen test

[fixtures/test-rootfs-directory-modes.mjs](fixtures/test-rootfs-directory-modes.mjs),
11,493 bytes, SHA-256 `50eb4d13e2be8dfbeb6059a7ad1728f484a53fd7d9e988c99dd9ed2484a9d25e`.
The nine groups use the existing host Node22 built-ins only. The complete controller, main,
target runtime, npm, observer, package code and external commands are never imported or run.

The fixture extracts exact actual-source nested mkdir, rootfs chmod, config mkdir and config
write statements from controller SHA-256
`2b2cd774e58217afe1e39f5be43a3d93b2c957315f5f7a843b432b5967de4525`.
Only those small filesystem statements run in a VM context with explicit fs/path/owned paths
and a direct mutation callback. Each case uses a tiny exclusively created temporary tree with
inert text payloads, restores the previous process umask in finally, and removes its own tree.
The fixture performs no privilege switch or actual cross-UID access; its nonroot accessibility
check inspects the directory other-execute and config other-read mode bits appropriate to the
declared root-owned tar/different nonroot consumer.

The future narrow helper is loaded only if its file exists. Before it exists, normalization is
intentionally absent, so actual mode assertions fail on 0700/0400 rather than an import error.
Helper-specific negative controls are explicitly skipped until implementation. If the helper
file exists, both named exports are required; missing exports cannot silently skip the suite.

## First actual observation before implementation

- Requirement: requested 0755/0444 must yield the exact intended new owned rootfs modes regardless
  of umask, while preserving scope and historical evidence.
- Test Case: one `node --test docs/spikes/fixtures/test-rootfs-directory-modes.mjs` on the source
  above, with owned tiny trees populated by the actual extracted statements under umask 077.
- Expected Result: all eleven planned directories, including root, become 0755 and both owned
  empty configs become 0444; this must be a behavioral regression before the fix exists.
- Observed Result: exit1, nine groups, one passed, two failed and six skipped, 86.364709 ms.
  The baseline control directly observed rootfs itself 0755, ten nested directories 0700 and
  both configs 0400. Other-execute/read predicates were false. The two desired-outcome cases
  failed with actual numeric modes 448/256 versus intended 493/292. No loader failure occurred.
- Status: FAIL

The first-run test SHA-256 was
`45a64b4ac3c656525a87c7bf2a33c2bc95d7f0aa1f3916674a24277dd4de5765`.
Before freeze, only test titles were spaced, a skipped negative fixture's function-text lookup
was replaced by an explicit case label, and future-helper export checks were added. None changes
the three executed filesystem cases or source under test. No second pre-fix run was performed.
The final frozen identity above is the required post-implementation verification basis.

## Pending verification after Scotty

| Requirement | Test case | Expected result | Observed result | Status |
| --- | --- | --- | --- | --- |
| Exact modes and scope | Normalize actual restrictive fixture; compare every file hash, inode, mode, private parent, input/output siblings and process umask; verify exact count/digest/required/config summary | Only planned directories 0755 and two exact empty configs 0444 change | Producer absent | NOT EXECUTED |
| Stable owner and planned directory authority | Wrong root pin, replacement root, unsafe/duplicate/missing/oversize directory list | Reject before chmod; owned foreign/replacement paths untouched | Producer absent | NOT EXECUTED |
| Safe complete preflight | Symlink, extra/missing directory, nonempty/hardlinked/missing/symlink config | Reject without partial normalization | Producer absent | NOT EXECUTED |
| Deadline and canonical path | Throwing deadline, noncanonical path and symlink root alias | Reject without changing data or mode | Producer absent | NOT EXECUTED |
| Sanitized native error evidence | Explicit bounded native exec errors naming `/runtime/node`; unrelated, ambiguous, oversize and malformed values | Only the three declared enums; no raw stderr disclosure | Producer absent | NOT EXECUTED |

## Interpretation and handoff

This local execution proves the source's umask-sensitive mode behavior and a concrete defect in
the intended rootfs preparation. It does not identify the historical container exit 126 cause,
prove native startup, qualify npm or authorize another runtime action. The original failed result
and receipts remain unchanged. File/tree bounds are tested using small invalid record inputs;
no large hostile filesystem or general host qualification program is introduced.

Scotty owns the normalizer/classifier and call sites; Bashir independently reviews the complete
preflight, stable ownership, placement before tar and sanitized result semantics. Run this frozen
focused suite once on the final implementation and record actual observations. No download,
archive, installation, container, security probe or denied-operation retry occurred here.

## Independent ancestor-redirection regression before repair

Bashir found a P1 in first helper SHA-256
`497324bc0eb012c4180705554546d948f2ce0691c97ca771ab041aa3a5354fad`:
holding/checking the root and final inode did not reject an intermediate directory replaced by
a symlink after complete preflight. Final-component `O_NOFOLLOW` did not prevent following that
ancestor, so a later chmod could affect the original directory after it moved outside rootfs.
The final sweep rejected the changed ancestor only after the out-of-rootfs mutation.

Odo appended one independently authored actual-filesystem regression to the same test file before
Scotty's repair. New frozen test: 12,818 bytes, SHA-256
`7fb1e1be8f5f67c2f7a3b1fa241593e4ab24678bc64c0c1dced67249ae7efe5d`.
The original nine groups are unchanged. This updated identity supersedes the initial frozen
identity for subsequent verification; the original failure and freeze remain recorded above.

- Requirement: changing an ancestor after preflight must stop normalization before a later chmod
  reaches a directory moved outside the authorized rootfs.
- Test Case: use the same tiny exclusively owned fixture and actual helper. Temporarily wrap
  `fs.fchmodSync` to observe completion on the original npm directory inode. On the second
  subsequent deadline callback, rename that owned npm directory to a sibling within the owned
  test parent and replace its former location with a symlink to the moved directory. Require
  normalization to throw and the moved npm/bin directory to retain its original 0700 mode.
  Restore the filesystem function in finally; the fixture separately restores umask and removes
  only its own temporary tree. No host/user file, target code, external command or container runs.
- Expected Result: the controlled redirection actually occurs, helper rejects it, and the sibling
  bin mode remains 0700 without an out-of-rootfs chmod.
- Observed Result: one `node --test --test-name-pattern='ancestor redirection after preflight'
  docs/spikes/fixtures/test-rootfs-directory-modes.mjs` on helper 497324bc exited1. One test ran,
  one failed, zero skipped; total 82.052625 ms. The redirection occurred and helper threw, but the
  moved bin mode was 0755 (493) rather than 0700 (448). This is an actual local filesystem behavior
  failure, not source inspection or a missing-export/loader result.
- Status: FAIL

This deterministic interleaving proves the specific reported gap. It is not universal race
freedom or a new hostile-host qualification program. Scotty owns the correction; Bashir must
review the complete ancestor chain and descriptor ordering. No live action is authorized here.
