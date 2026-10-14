# Two-artifact AQC integration pilot

## Status and scope

**Bounded pilot verified, not artifact conformance:** Fifteen focused harness tests and
all ten actual pinned-AQC CLI scans passed on 2026-10-13. The test run used a temporary
read-only GitHub Actions job with no persistent private checkout credentials. The
accepted evidence is recorded in [verification-2026-10-13.json](verification-2026-10-13.json)
and [GitHub Actions final execution](https://github.com/jnicholas000/basic-plugin/actions/runs/38498913731).
The imported agent/skill still have four recorded declaration gaps. No production
AQC pin, required CI gate, publication or runtime behavior was changed.

The pilot covers Custom Agent Foundry and Capability Collision Detection using AQC's
existing structure, value, and reference rules. Imported agent/skill/scanner bytes,
manifests, publication, and runtime behavior remain unchanged. Website materialization
remains the project's primary next action. This is not Code Integrity V4.

## Contracts and consumer-owned mappings

The pilot separately pins `jnicholas000/ai-quality-control` to
`ccad08bf9e3b90456d4f3b138707d5131c49a70b`. At execution, it copies the unchanged
`agent-base@1.0.0` and `skill-base@1.0.0` contracts from that commit's accepted
`fixtures/valid/artifact-validation` directory. It does not substitute a reduced contract
merely to pass the existing artifacts.

Basic Plugin owns the bindings, explicit value schema and sidecar declarations here.
Foundry's tool enum is a consumer constraint based on its imported declaration, not proof
of host support or permission. The skill's scanner is explicitly declared as a resource
dependency because its existing workflow invokes that bundled file. Local existence does
not prove Python availability or scanner behavior. The scanner is never executed by this pilot.

Foundry maps actual frontmatter and headings for purpose, responsibilities, inputs, tools,
procedure, output and success criteria. The skill maps its description, approved scan scope,
workflow, report format and resolution rules. Presence does not establish prose quality.

## Real baseline and synthetic controls

The baseline reads committed Git blobs, never uncommitted working-tree changes. The
following four missing mapped declarations were observed in the real AQC run:

| Artifact | Expected missing declarations |
| --- | --- |
| Custom Agent Foundry | `permissions`, `failureEscalation` |
| Capability Collision Detection | `tools`, `successCriteria` |

These are detected missing **mapped declarations**, not proof that related guidance is absent
from surrounding prose. The baseline findings were preserved rather than converted into a
passing artifact. Production policy must not be invented to fill those gaps.

Only temporary synthetic controls add `TEST-ONLY` declaration values to isolate downstream
validators. Even a successful control does not mean the distributed artifact satisfies
all base-contract obligations. The original documents and baseline never receive those additions.

| Case | Expected exact result |
| --- | --- |
| Real baseline | Four `AQC-BOUND-STRUCTURE` findings |
| Synthetic positive | Zero findings |
| Missing agent procedure | One structure finding for agent `procedure` |
| Missing skill procedure | One structure finding for skill `procedure` |
| Numeric tools value | One values/type finding |
| Duplicate tool | One values/uniqueItems finding |
| Unknown tool | One values/enum finding |
| Missing scanner | One local-reference finding |
| Escaping resource path | One local-reference finding |
| Scalar dependency value | One reference-type finding |

Defects are isolated from the positive control. Assessment checks exact rule, artifact,
semantic element, diagnostic code, status/schema keyword, version, enforcement, source
attribution, identity presence, and exit status. A parser or execution failure cannot stand
in for successful defect detection. AQC owns the validators; the consumer harness does not
reimplement parsing, schemas, references or approval policy.

## Run and retain evidence

Use a clean authorized AQC checkout at the exact pin. Install its locked dependencies first:

```sh
# In the pinned AQC checkout:
npm ci --ignore-scripts

# In the committed Basic Plugin pilot checkout:
node --test pilots/artifact-quality/pilot.test.mjs
bash pilots/artifact-quality/run.sh /absolute/path/to/pinned-aqc /new/absolute/pilot-output
```

The output directory must be new, with an existing parent, and outside both source checkouts.
The AQC checkout is canonicalized to its physical path before checking this boundary,
including when the supplied checkout path is a symlink. The runner performs no checkout,
authentication, installation, publication or scanner execution.
It copies selected committed consumer blobs and the pinned contracts into isolated case roots.
Before any CLI run, it rejects staged, unstaged or untracked changes to the executing
pilot harness so evidence cannot be attributed to an unexecuted clean commit.
It seals a complete SHA-256 file inventory for each staged case,
including all synthetic overlays and the copied contracts. It verifies that inventory
before each execution and again during assessment; missing, added, changed or symlinked
case inputs fail closed. The final assessor also verifies each finding's exact
contract and binding identity against the sealed consumer declarations; it never
accepts merely nonempty identity fields. The runner does not reconstruct validation
results itself.
An unmodified AQC checkout and locked dependency installation are prerequisites, not a
cryptographic attestation of dependencies.

Fifteen unit tests exercise the synthetic result harness, exact-result assessment, immutable
snapshots, real Foundry frontmatter with fenced YAML, leading-frontmatter rejection, and
symlinked root/output containment, dirty-harness rejection, and exact artifact-specific contract/binding identity verification. Those tests are separate from actual AQC rule behavior.
The independent ten-case AQC run used exactly pinned revision
`ccad08bf9e3b90456d4f3b138707d5131c49a70b` against Basic Plugin
`a5d3472a7f457d5a071118367124d0bb59837f6e`. All ten cases matched their
expected exact diagnostics; the known-good synthetic control returned zero findings,
the baseline returned four structural findings, and each of eight mutations returned
the single intended finding. The GitHub Actions evidence ZIP retains input snapshots,
per-case raw JSON, exit codes, stderr, sealed hash manifest and evaluated summary.
The committed JSON verification record preserves source identities, exact diagnostic
tuples, checked per-finding contract/binding IDs, artifact type, source path, locator,
diagnostic code, and raw SHA-256s after the ZIP's retention period ends.

Every run preserves input snapshots and hashes, unmodified CLI JSON, exit statuses, stderr,
and a summary with exact diagnostic tuples and raw-output SHA-256s. Existing output is never
overwritten. Retain that bundle before claiming the pilot passed. The harness verifies
integration behavior; it supplies no representative precision, recall or runtime qualification.

## Acceptance boundary

This bounded integration pilot has passed the ten-case acceptance check; the four real
baseline gaps remain open for separate owner policy review. The result proves reusable AQC
rules can read these two consumer artifacts through explicit bindings and report precise
structural defects. It **does not** certify the underlying agent or skill, prove representative
precision/recall, establish runtime or model behavior, or authorize blocking required CI.
Review any proposed permissions or success policy separately; preserve imported upstream
text unless an explicit patch is approved. Reusable detector defects belong in AQC.
No broader artifact selection, graph/authority validation, required CI adoption, automatic
promotion, or change to fork/Dependabot/private-token boundaries is authorized here.
