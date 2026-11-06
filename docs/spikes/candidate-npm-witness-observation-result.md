# Owned npm witness observation — first result

Date: 2026-11-06. Result: **INDETERMINATE; sole attempt consumed; no retry**.
The witness reached a specific strict-summary rejection. It does not establish the complete
owned preparation gate, candidate dependencies/builds, site parity or Missions 9/10 completion.

## Source and evidence

[PR #32](https://github.com/jnicholas000/basic-plugin/pull/32),
[run 42162713031](https://github.com/jnicholas000/basic-plugin/actions/runs/42162713031),
local job `127711928082`, attempt 1:

- Reviewed head: `fffe0d647403784add8d979b24ad41fca669dcc9`.
- Base: `743498a292278350294155cd9a3fd42d0a434914`.
- Actual test-merge: `02ea215b365478f3b4dedd55fba0789b7c29c1b0`; ordered parents independently
  corroborated through GitHub's Git commit API.
- [Raw first receipt](candidate-npm-witness-observation-first-receipt.json): 18,751 bytes,
  SHA256 `61979e9c975bbe9b6e598b61e6d34ab795b44e432a4cb98f86f1a018a55fde74`.
- Inert evidence artifact `13477447687`: ZIP 226,613 bytes,
  SHA256 `fbd4adc82f29f5c8a0f473670eac3ee06b8fb5d28c14eca64cca854ea7c13cec`.
  Inventory 321,518 bytes SHA256 `200df0fcd7713a81a653aa7d160177ce2b0dda476c85df59b6d5dbb679191599`;
  archive manifest 1,113,992 bytes SHA256
  `a51be53c3f8023e063e4cb34148a3392e9845f83e7cabb55679241f172161e62`.

Data independently read the unchanged receipt and pinned probe/controller flow. No runtime,
acquisition, tests, scoring or new research was performed for this interpretation.

## What the observation establishes

One GET supplied 58,290,700 bytes matching the official pinned archive; zero retries. Exact cache
and nine runtime identities, unchanged npm closure and selected child policy passed their checks.
The npm inventory records 1,635 files / 9,525,769 bytes and 439 directories, builtin npmrc absent.
The pre-tar mode summary records 446 directories at 0755, eight critical ancestors and both empty
config files at 0444. The target actually ran the owned probe.

The retained contained failure is `ci-keys`, jsonKind `object`, detail `unexpected-keys`.
Its passed checkpoints are admission, observer-positive, observer-reset and npm-version.
The ci subprocess exited 0, signal null, no timeout, stdout 126 bytes and stderr 0. The probe/container
exited 1, not OOM-killed. Neither a successful npm process exit nor these checkpoints changes the
full gate's INDETERMINATE status.

The source-ordered witness supports successful JSON parsing and the preceding added/changed/
audited/funding zero predicates plus a safe nonnegative integer removed value. The exact removed
value was not retained. The closed key-set predicate then rejected at least one unexpected key.
No unexpected key name, count or returned body was retained; none is reconstructed here.
Later optional-array acceptance, owned-output checks, final observation validation and post-child
source preservation were not reached. The 170 tracked-files comparison belongs to preparation
before the child; it is not whole-action source-preservation evidence.

## Limits, resource accounting and cleanup

Preparation 69,021.854565ms; whole action 76,037.457924ms; child controller 5,594.702026ms.
Recorded limits remain the original 96 MiB/60s GET, 235s overall/four-minute step and fixed child/
cleanup budgets. Both selected filesystem admission snapshots reported 4096-byte fragments and
92,115,656,704 available bytes. These snapshots are capacity observations, not reserved space.

The child controller's peak admitted bound was 1,047,658,496 bytes. The larger prospective owner
handoff admission was 1,208,844,288 bytes: 218,988,544 live cache + 536,870,912 remaining filesystem
+ 436,207,616 Docker reserve + 16,777,216 safety reserve. Both are within 1,288,490,188;
neither is a measured physical aggregate peak. The owner reported 495,149,056 bytes measured
filesystem peak; the child controller separately reported 293,224,448.
These are different scopes, not a combined physical host/Docker measurement. Docker reserve was
436,207,616 bytes; image logical size 142,780,557. Docker physical peak was explicitly unmeasured.
Do not relabel logical reserves or image size as actual Docker storage allocation.

Child and outer cleanup both completed without uncertainty or remaining owned paths. No runtime,
archive, rootfs, image or container persists. Only bounded inert evidence is retained. The one-use
hook was restored locally to the normal base workflow before closeout; main/check verification
remains coordinator-owned. Retention did not turn the failed capture into a passing gate.

## Smallest next gate

Perform a read-only contract comparison between the pinned npm 11.19.1 ci JSON producer and this
experiment's original closed key set. Determine whether that closed set is intentional normative
acceptance or an unsupported assumption about the fixed version. No key name or schema amendment
is established by this receipt alone. Any proposed acceptance change must be explicit, reviewed
and prospective; this result and PR #30's less specific failure remain unchanged. If the existing
closed set is retained, qualification stays blocked at this rejection. No automatic new capture,
criterion relaxation, acquisition or retry is selected.
