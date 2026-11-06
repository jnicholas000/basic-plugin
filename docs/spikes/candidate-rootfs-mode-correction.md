# Owned rootfs directory mode correction

Feature slug: `candidate-catalog-parity`. Date: 2026-11-06.
Basis: main `e88526a9a5dc8c14576ac6d0728c11328045986c`.
Status: prospective offline correction; no new runtime action authorized.

Data reread the installed Starfleet 0.2.0 role. The sole same-job attempt remains
INDETERMINATE: exit 126, no probe/version/ci result, both cleanups complete. Source implies
umask 077 makes requested 0755 nested directories 0700, then tar assigns root ownership.
This is consistent with the failure; the retained evidence does not establish its cause.

## Outcome and scope

Correct only newly owned rootfs directory modes and the two owned empty config-file modes
before tar, independent of caller umask. Requested0444 config files likewise become 0400
under 077; explicit 0444 is necessary for the selected nonroot child to read them.
Keep input/output/private-parent modes, process umask, runtime/policy, 90/10 deadlines,
original files/receipts and retired workflow guards unchanged. No download, install,
Node 24/npm, container, control retry or upstream execution. Ordinary host Node 22 filesystem
fixtures are sufficient. This is a local harness correction, not a production permission API.

## Exact seam for Odo and Scotty

In new import-inert `fixtures/owned-rootfs-modes.mjs` export two small helpers,
imported only by the derived `run-npm-same-job-control.mjs`:

`normalizeOwnedRootfsModes(root, expectedIdentity, expectedDirectories, checkDeadline)`

- Identity is the original `{dev, ino}` of this exclusively created rootfs, captured before
  population. Require an absolute canonical root matching that identity and current owner;
  check ancestor resolution, reject a symlink/replacement/foreign root. Deadline is the
  existing controller check callback. No root discovery or permission fallback.
- Expected directories are unique normalized relative paths including `''`, derived from
  the exact planned payload table. Reject absolute/traversal/foreign/duplicate paths.
  Preflight the complete bounded tree before chmod: reject symlinks/special entries,
  unexpected/missing directories, depth>34 or count>8208; regular payload files stay unchanged except the two exact empty configs below.
- Explicitly chmod only those identity-checked owned directories 0755 and the two exact
  newly owned regular empty files `config/user.npmrc` and `config/global.npmrc` to 0444.
  Require their current owner, nlink 1 and size 0 before mutation; reject absent/replaced/linked
  files. Recheck identities/modes and return `{count, sha256, required, configFiles}`. Digest is SHA256 of UTF8
  `JSON.stringify(sortedRecords)+'\n'`, records `{path,mode}` with numeric mode 493,
  ASCII path sorting. Bound serialized records to 1 MiB. `required` is the subset at
  `'',runtime,lib,lib64,lib/x86_64-linux-gnu,npm,npm/bin,config` (all required), in that order.
  `configFiles` contains those two `{path,mode}` records (mode292), in that order.
  Keep summary in the future receipt; its digest is not a historical tar-mode observation.
- Call once after all rootfs payload/config creation and before tar/import. Preserve private
  parent pin and rootfs identity through the call. Never chmod outside rootfs or follow links.

Also export pure `classifyOwnedStartupError(stderr)` returning only
`PERMISSION_DENIED_REPORTED`, `NOT_FOUND_REPORTED` or `UNCLASSIFIED`.
Accept bounded UTF8 string/Buffer<=65536 bytes. Match only an explicit native exec error
naming `/runtime/node` and its permission-denied/not-found phrase; ambiguous/oversize/other
text stays UNCLASSIFIED. Never return raw text/path/environment. Record it only on actual
Docker start failure; it describes reported error, not inferred root cause or a success gate.

## Ordered ownership and acceptance

1. Odo freezes `fixtures/test-rootfs-directory-modes.mjs` and a compact ownership note.
   Before producer changes, reproduce actual source-extracted directory creation under 077
   in a tiny owned tree and assert the intended 0755 outcome: this must fail meaningfully
   on 0700, not on a missing export. Restore the test process umask in finally. No whole main.
2. Scotty implements only the two seams and their call sites. Odo tests normalization,
   unchanged payload files/private siblings/umask, exact 0444 empty configs, substituted root,
   traversal/symlink/nonempty-or-hardlinked config rejection and bounds,
   plus redacted classifier vectors. No privileged identity switch or target execution.
3. Bashir reviews exact source and evidence independently. Coordinator reconciles Project
   State/Basic-only Ops and normal PR/CI. No live gate or automatic retry is added.

[OBSERVABLE_OUTCOME] The genuine pre-fix filesystem failure becomes a passing owned-tree
mode regression. [SECURITY_PROPERTY/EXACT_ERROR_CONTRACT] Foreign/symlink/path drift rejects
without modifying foreign paths; private siblings and process umask remain unchanged.
[MANUAL_VERIFICATION] Actual mode helper precedes tar; bounded mode/error evidence is honest.
Focused new tests plus affected existing pure tests are sufficient; no broad test program.

All decisions are DERIVED_NO_ARCHITECTURE_CHANGE/ALIGNED with the approved offline correction.
Candidate execution remains SPIKE_REQUIRED; prior startup cause remains unknown. Stop for
ownership ambiguity or unsupported safe path handling; no permission/security expansion.
