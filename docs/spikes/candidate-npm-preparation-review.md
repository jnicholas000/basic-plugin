# Candidate npm Preparation — Independent Bashir Review

Feature slug: `candidate-catalog-parity`. Review boundary: readiness for one first-open owned
empty-graph observation, before any controller execution. Runtime and production qualification
remain **NOT_EXECUTED**.

Result: **PASS — READY for one bounded first-open execution after coordinator admission**

Summary:

The exact runner and temporary workflow were independently reviewed against Data's bounded
contract, Odo's frozen fixtures/evidence and PROJECT One Next Action. The frozen pure suite passes
9/9, and no defect was found in the fixed runtime/closure, configuration, observer sequence,
selected policy, output checks, first-failure handling or cleanup finalization. The initial review
returned FAIL for a shallow-checkout source-binding dependency. That finding is resolved by the
owner's temporary depth-two local checkout and the coordinator's conclusive owned Git fixture;
the original finding and evidence remain below. No current blocking issue remains.

The installed Starfleet 0.2.0 Bashir role, review-rubric entry and canonical procedure, and core
principles were actually read. Their review/report-only boundary was preserved. Role source
SHA-256 is `cd5856a70d9c63fbd81ddd95b25a084eeeab61382354f0e3377ec2e6a0600f22`;
canonical rubric SHA-256 is `bc1de78d9385166ede3ee2f860a1a05050d31f8e2d2541cb3a72cf7d1396c7de`.

Reviewed source identities:

| Artifact | SHA-256 |
| --- | --- |
| `fixtures/run-npm-preparation-control.mjs` | `efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7` |
| `.github/workflows/quality.yml` | `59c46620b7ab5e21e4634f62e5a10d492dcb54dde67015bf7a51f85c09a71cbb` |
| `fixtures/npm-preparation-probe.mjs` | `18800d03a5f86171c2eb96631a54e7a3b4e1aaa1f65f25d5d402067ec96ebb5c` |
| `fixtures/npm-lifecycle-observer.mjs` | `a3059404cb6f0cfcc861d00a53a471e8f7dc90632d5e8b9b02f68d88b7f9fcb9` |
| `fixtures/test-npm-preparation-control.mjs` | `5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972` |

One authorized execution of `node --test docs/spikes/fixtures/test-npm-preparation-control.mjs`
against this exact runner returned exit0: 9 tests, 9 passing, zero failed/cancelled/skipped/todo,
102.628334 ms. Only pure exports and source reads executed. This supplies final-source contract
evidence; it does not cover runtime-only admission or execute the probe/observer. Odo's independent
9/9 result on the earlier `af7d21ff…` source is retained as earlier-source evidence. The prior
Node/C fixture diff against main `62ab1e301f152eb38e268af919ef2c3bc69f4787` is empty.

### Original FAIL Finding — Issue 1, Now Resolved

- Type: Bug
- Severity: P1
- Basis: acceptance-criterion; the single first-open route must reach the owned observation
  after exact source admission under the existing checkout.
- Original disposition: fix-now
- Original Reopens Current Mission: yes; current status: resolved, no outstanding reopening.
- Location: `fixtures/run-npm-preparation-control.mjs`, lines 261–262; existing workflow checkout.
- Description: raw `git cat-file -p HEAD` correctly exposes the merge header's two parent IDs,
  but `git rev-parse ${result.headCommit}:${relative}` still needs the head parent's commit/tree
  objects. The workflow has no fetch-depth override and checks out only the test-merge commit.
  Parent IDs in raw headers do not supply those objects. Thus the source-bindings stage cannot
  rely on the parent-file lookup being available.
- Impact: a valid first-open checkout can stop before the fixed runtime or npm observation,
  consuming the sole initial route for a harness prerequisite failure.
- Suggested Fix: route a bounded source-binding repair through the implementation owner that
  works with the existing depth-one checkout while retaining exact merge parent and reviewed-byte
  binding; verify the repaired admission logic with an owned host-only shallow Git fixture.
  Do not add runtime execution, fallback, implicit fetch or a corrective CI run to this review.

Resolution evidence: the coordinator's same owned local Git fixture first demonstrated merge-file
availability but missing head-parent commit/file objects at depth one (both parent reads exit128).
After a local file-origin fetch at depth two, it reported exactly two merge parents and both
head-parent commit/file readable with exit0. This is host Git admission evidence, not a producer,
npm, Docker or security-probe result. The coordinator supplied these results to Bashir; Bashir did
not create or mutate the fixture.

Bashir independently inspected the final workflow delta and implementation note: only the first
`local` checkout gains the documented temporary `fetch-depth: 2`; `persist-credentials: false`,
the pinned checkout action and the AQC checkout remain unchanged. The runner retains the strong
head-file/merge-file equality and exact ordered raw parent check. The prior workflow identity was
`353fd7d286246874f4ddaee9f27c3d2e462d1191bb26c9f5021806e2567e8340`; current identity is the table
above. No runner or frozen fixture bytes changed, so the final-runner 9/9 evidence remains valid
and was not repeated. Retire the extra checkout depth together with the temporary hook before
merge. This owner-routed prerequisite repair resolves the sole original P1 finding.

Required Fixes:

- None for the reviewed pre-execution boundary. Fresh resource/source admission, the single
  actual observation, independent first-result/inventory interpretation and hook/depth retirement
  remain the explicitly planned coordinator follow-through, not already completed evidence.

Accepted Risks:

- None. No unresolved runtime uncertainty is treated as an accepted risk or passing observation.

Optional Improvements:

- None. Review did not expand the threat model or request broader hardening.

Risks:

- npm startup, lifecycle suppression, empty offline ci, real closure inventory and actual cleanup
  remain unobserved. A repaired pre-execution PASS will authorize only the bounded experiment's
  readiness, not assert its result. Independently review the first receipt and full inventory.
- Human comprehension is sufficient: the durable plan and implementation note explain the fixed
  route/limits, new inventory, uncertainty, stop behavior and retirement of the temporary hook.
  They keep `DO_NOT_COPY` and `UNRESOLVED` boundaries explicit. Retire the hook before merge.
- Publication scan of the new documents and executable sources found no personal host paths,
  private coordination paths, secret values or employer material. Public fixed cache/runtime paths
  and owned synthetic paths are necessary experiment data. The coordinator's required pre-push
  squash/sanitization of private historical coordination remains a separate publication
  prerequisite; this review does not claim it has happened or that public Git proves native
  automatic role activation. Actual role invocations and pre-producer ordering are retained as
  private coordination evidence and source-bound authorship notes.

Tool classes: repo-reader/content-source-reader for named installed role, contracts, source,
hashes, status and diffs; test-runner for the single nine-test pure suite; artifact-writer for
this review only. No implementation/workflow/test/PROJECT/Ops/Git mutation, controller, npm,
Docker, observer, probe, upstream code, installation, publication, security probe or denial retry
was performed by Bashir. No denied or uncertain action occurred in this review.
