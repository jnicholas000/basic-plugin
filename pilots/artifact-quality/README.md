# Two-artifact AQC integration pilot

## Status and scope

**Prepared, not accepted:** five local harness tests pass, but the ten real AQC CLI
runs have not executed. The connector blocked the optional workflow write, so no workflow,
required CI gate, or production pin was changed. `run.sh` is a standalone execution path.

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
following four missing mapped declarations are expected, pending actual AQC execution:

| Artifact | Expected missing declarations |
| --- | --- |
| Custom Agent Foundry | `permissions`, `failureEscalation` |
| Capability Collision Detection | `tools`, `successCriteria` |

This is a representation-gap hypothesis, not a claim that related guidance is absent from
all surrounding prose. Any baseline findings are preserved rather than converted into a
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
The runner performs no checkout, authentication, installation, publication or scanner execution.
It copies selected committed consumer blobs and the pinned contracts into isolated case roots.
An unmodified AQC checkout and locked dependency installation are prerequisites, not a
cryptographic attestation of dependencies.

The five unit tests use synthetic CLI records to test snapshot isolation, exact-result
assessment, provenance drift and execution-error handling. They do not establish AQC's
real detection behavior. Ten real CLI runs and evidence review are required for acceptance.

Every run preserves input snapshots and hashes, unmodified CLI JSON, exit statuses, stderr,
and a summary with exact diagnostic tuples and raw-output SHA-256s. Existing output is never
overwritten. Retain that bundle before claiming the pilot passed. The harness verifies
integration behavior; it supplies no representative precision, recall or runtime qualification.

## Acceptance boundary

Keep this pilot unverified until the real run succeeds and baseline gaps are reviewed.
Review any proposed permissions or success policy separately; preserve imported upstream
text unless an explicit patch is approved. Reusable detector defects belong in AQC.
No broader artifact selection, graph/authority validation, required CI adoption, automatic
promotion, or change to fork/Dependabot/private-token boundaries is authorized here.
