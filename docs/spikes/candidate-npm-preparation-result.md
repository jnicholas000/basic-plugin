# Owned npm Preparation — First Result

Date: 2026-11-05. Result: **INDETERMINATE / PREREQUISITE_BLOCKED**.
This preserves the single first-open attempt; it is not npm qualification or a retry grant.

## Source And Receipt

- [PR #25](https://github.com/jnicholas000/basic-plugin/pull/25), head
  `aaedcce554dcb93a20acbce702fb4336f5b9ece4`, base
  `62ab1e301f152eb38e268af919ef2c3bc69f4787`.
- [Actions run 42097240276](https://github.com/jnicholas000/basic-plugin/actions/runs/42097240276),
  attempt 1, first `pull_request.opened`; [local job 127490380453](https://github.com/jnicholas000/basic-plugin/actions/runs/42097240276/job/127490380453).
  Executed test-merge `6c80de7e9c545e0fc1e91c397292ee2c88d1c935`.
  Job setup reports image `ubuntu-24.04`, version `20261101.360.1`; these are reported
  metadata, not an attestation of the required file inventory.
- Source bindings and the four frozen runner/fixture hashes passed before the stop. Runner
  SHA-256: `efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7`.
- Artifact `13446224670`, named
  `owned-npm-preparation-6c80de7e9c545e0fc1e91c397292ee2c88d1c935`:
  ZIP 797 bytes, GitHub digest SHA-256
  `c99d1dfb1064ad885ae417e06bf0f539f5025174758251eef41e9947e1d3f6f9`.
  The downloaded ZIP matched that length and digest before its named JSON member was read as data.
- [Unchanged raw receipt](candidate-npm-preparation-first-receipt.json): 1,003 bytes, SHA-256
  `eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e`.
  The ZIP contains only that receipt; no npm inventory was produced.

## Observed Boundary

The controller stopped at `fixed-runtime`, reason `owned-npm-requirement`, code `ENOENT`,
after 58.06945 ms. The receipt does **not identify the missing path**. It cannot distinguish a
missing fixed cache/header from a missing member of the nine-file runtime closure. No assertion
about which input disappeared, or why, is supported.

The npm inventory, owned observer positive/reset, npm version/empty offline `ci`, Docker import,
container creation and output validation were not reached. No upstream package/config/build code
or dependency archive ran. Cleanup completed with no failures and no uncertain mutation outcome.
Source hashes passed; the later complete post-observation source check was not reached.

The independent Odo interpretation and Data's planning disposition agree: this is a prerequisite
stop, not an observed npm behavior failure or success. The prior Node control remains valid for
its recorded runner; a moving hosted label does not establish continued fixed-input availability.

The workflow's capture step used `continue-on-error` to retain evidence. The separate enforcement
step correctly failed the job on the original outcome; subsequent build/output checks and private
AQC were skipped in that run. The existing Python contracts passed 26/26 before capture.
Earlier pure contract evidence is 9/9 passing, including an independent
Odo run and final-runner Bashir run. The same nine tests passed before this CI capture. Those tests
exercise pure contracts, not the actual runtime prerequisites or contained npm behavior.

## Disposition And Follow-Through

The initial one-use workflow hook and temporary checkout depth are retired. `quality.yml` is
byte-identical to the pre-experiment base, SHA-256
`47fd7fc8fde1ea65d4411528a82b8ba7b9038a44353a73c1435a4fc2f5c503d0`.
The reviewed runner and Odo fixture/test bytes are unchanged. Ordinary checks of the resulting PR
do not rerun the control and cannot change this first result.

Identify the absent fixed-runtime input and establish availability of the exact approved cache
and nine-file closure on the existing CI route before considering a separately reviewed future
gate. No automatic retry, runtime fallback, installation, new host or security change is selected.
Any future attempt must retain this record and its own source/route admission rather than replace
the failed prerequisite evidence.

Production dependency preparation, nonempty graphs, archive extraction, native tooling, upstream
builds, browser parity and both pre/post-merge candidate execution paths remain unqualified. The
public lock stays reference-only; accepted pins/output, the structural adapter, throwing guard
and automatic-baseline stop remain unchanged. This slice does not complete Missions 9/10.
