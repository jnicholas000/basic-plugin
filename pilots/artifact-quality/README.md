# Two-artifact AQC integration pilot

## Scope

A report-only integration of AQC's existing `artifact-quality` profile with Basic Plugin's
Custom Agent Foundry agent and Capability Collision Detection skill. No imported artifact,
scanner, plugin manifest, production AQC pin, required quality workflow, publication path,
or runtime behavior is changed. Website materialization remains the project's primary next action.

AQC owns all three validators. These consumer bindings and test mutations do not implement
another parser, schema engine, dependency validator, or approval system.

## Inputs and ownership

- Engine: `jnicholas000/ai-quality-control` at `ccad08bf9e3b90456d4f3b138707d5131c49a70b`.
- Contracts: unchanged `agent-base@1.0.0` and `skill-base@1.0.0`, copied at execution time
  from that commit's accepted `fixtures/valid/artifact-validation` contract files.
- Bindings, value constraints, and declarations: owned here by Basic Plugin.
- Foundry's tool enum is an explicit consumer constraint based on the imported declaration,
  not proof that a host currently supports those tools or grants their permissions.
- The collision scanner reference is explicitly declared in `collision.declarations.json`,
  based on the existing skill's bundled-scanner command. Python availability and script
  behavior are not checked or inferred by a local-file reference validator.

The portable contracts remain unchanged. No made-to-pass reduced contract is substituted.
Optional unmapped elements remain outside the pilot; no prose is reinterpreted as an
undeclared tool grant, dependency graph, or handoff.

## Real baseline versus synthetic controls

The baseline reads exact committed Git blobs. Foundry maps purpose, responsibilities, inputs,
tools, procedure, output and success criteria to its actual frontmatter and document headings.
The skill maps its description, approved scan scope, workflow, report format, and resolution
rules. Presence is not a judgment about the quality or completeness of that prose.

Four explicit representation gaps are expected in the unchanged baseline:

| Artifact | Unresolved declaration | Meaning |
| --- | --- | --- |
| Foundry | `permissions` | No separately declared mutation/authority boundary in this binding |
| Foundry | `failureEscalation` | No separately declared failure/escalation value |
| Collision Detection | `tools` | No explicit machine-readable required-tool declaration |
| Collision Detection | `successCriteria` | No separately declared completion-criteria value |

These are missing mapped declarations, not a claim that the surrounding prose contains no
related guidance. They remain real findings. Empty sidecars must not be filled with invented
production policy just to make validation pass.

Only temporary **synthetic controls** add `TEST-ONLY` declaration values to isolate the
other validators. They prove consumer integration and diagnostic behavior, not that the
published artifacts satisfy every base-contract obligation. The baseline and distributed
artifacts never receive those additions.

| Case | Expected result |
| --- | --- |
| Unchanged baseline | Four exact `AQC-BOUND-STRUCTURE` findings |
| Synthetic positive control | Zero findings |
| Missing agent procedure | One structure finding for agent `procedure` |
| Missing skill procedure | One structure finding for skill `procedure` |
| Tools replaced with a number | One values/type finding |
| Duplicate declared tool | One values/uniqueItems finding |
| Tool outside consumer enum | One values/enum finding |
| Missing scanner resource | One local-reference finding |
| Escaping scanner resource path | One local-reference finding |
| Dependency array replaced by scalar | One reference-type finding |

Each defect is isolated from the positive control. Exact rule, artifact, semantic element,
diagnostic code, status/schema keyword, enforcement, version, source attribution and CLI
exit status are checked. A parser/execution error is not successful defect detection.

## Execution and evidence

**Status:** pilot bindings, controls and harness are prepared. Five local harness tests
pass. The ten pinned-AQC CLI scans have not yet been executed. The connector rejected
creation of the optional workflow; no new workflow or required gate was added.
Expected baseline gaps above are a hypothesis checked by the runner, not a completed
consumer-validation report.

Use a clean checkout of the pinned AQC commit with dependencies installed from its lockfile:

```sh
# In a separately authorized AQC checkout at the exact pin:
npm ci --ignore-scripts

# In a committed Basic Plugin pilot checkout:
node --test pilots/artifact-quality/pilot.test.mjs
bash pilots/artifact-quality/run.sh /absolute/path/to/pinned-aqc /new/absolute/pilot-output
```

The output directory must be new and outside the Basic Plugin repository. The runner
performs no checkout/authentication, installation, publication, source mutation or scanner
execution. It copies only selected committed consumer blobs and the pinned AQC contract
files into isolated case roots. Uncommitted consumer changes are deliberately not inputs.
Changes to the pinned AQC tracked source fail the preflight. An unmodified checkout and
`npm ci --ignore-scripts` are prerequisites, not a cryptographic attestation of dependencies.

The five unit tests use synthetic CLI records to test snapshot isolation, exact-result
assessment, provenance drift, and execution-error handling. They do **not** establish
AQC detection behavior; the ten real CLI runs are still required before pilot acceptance.

Each run preserves its input manifest/snapshots, unmodified CLI JSON and statuses, stderr,
and an assessed summary with per-input and raw-output SHA-256s. The script never overwrites
an existing output directory. A parser/execution failure is not accepted as a detected
mutation. Review and retain the output bundle before claiming the pilot passed.

No consumer permissions are granted and no fork, Dependabot, publication, required CI,
or private-token boundary is changed. No precision, recall, adoption or runtime-qualification
claim follows from the controlled examples.

## Follow-up boundary

Review the real declaration gaps before authoring any consumer permissions or success
policy. Keep imported upstream text intact unless a separate, documented patch is approved.
Any reusable detector defect belongs in AQC. Broader artifact selection, graph/authority
validation, mandatory CI adoption and Code Integrity V4 are not part of this pilot.
