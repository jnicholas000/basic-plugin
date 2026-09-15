# Work Reference Needs

Recorded: 2026-09-15
Status: reference capture; candidate capabilities are not implementation claims.

## Intent

Use Basic Plugin to develop and test original, reusable capabilities needed for work,
then transfer the purpose-built capabilities into the work environment for adaptation
and validation. The supplied examples describe needs and useful patterns. They do
not require exact copies, identical agent names, the same agent count, or the same
architecture.

This direction applies to capabilities deliberately developed here for that purpose.
It does not authorize transferring unrelated personal projects, branding, or distinctive
personal architecture.

## Reference Sources

The original attachments are retained with Jonathan's Work knowledge reference
materials outside this repository. Retrieve the originals when detailed source
inspection is needed; do not reconstruct missing definitions from this summary.

| Supplied example | What it informs |
| --- | --- |
| AI-resources-catalog(1).md | Breadth of agent, skill, instruction, prompt, knowledge, workflow, and distribution needs. |
| bolt-bridge.css | An adapter between design-system tokens and consuming theme variables, with theme-specific fallback decisions. |
| _custom-props.scss | Runtime CSS custom properties, semantic tokens, contextual aliases, and available token names. |
| _tokens.scss | Generated Sass token definitions, aliases, types, and source provenance. |

These are snapshots. The catalog identifies itself as updated in August 2026.
The Sass token file records generation on August 13, 2026. Their descriptions
are evidence of example needs, not proof of current tool support or successful
execution. The catalog is an inventory; the underlying agent and skill definitions
were not supplied in this reference set.

## Candidate Capability Map

The rows are areas to evaluate as needs arise, not an instruction to implement
the entire catalog.

| Need | Reusable capability to develop or extend | Adaptation performed at work |
| --- | --- | --- |
| Development delivery | Planning, implementation, review, testing, validation, and clear handoffs. | Team requirements, repository conventions, and delivery controls. |
| Agent and skill quality | Authoring support, deterministic checks, behavioral evaluation, reliability review, and collision detection. | Enterprise artifact standards and allowed tooling. |
| Debugging and test repair | Evidence capture, failure classification, targeted repair, and accurate validation reporting. | Actual application stack, test runner, CI commands, and runner constraints. |
| Repository knowledge | Source-backed inventory, context indexing, change impact, onboarding, and documentation review. | Repository maps, domain vocabulary, and internal documentation destinations. |
| Context efficiency and continuity | Selective context loading, durable task state, resumability, and staleness detection. | Team-owned state locations and retention rules. |
| Engineering conventions | Configurable naming, review, accessibility, and language-specific guidance. | Current team conventions and application requirements. |
| Tool and service integration | Configurable setup, authentication diagnostics, and bounded operations. | Service endpoints, approved clients, identities, and access controls. |
| Design-system integration | Token discovery, provenance, semantic mapping, theme adaptation, and focused validation. | The actual design-system package and supported public token API. |
| Plugin maintenance | Explicit package inventory, source-to-package traceability, version consistency, and installation evidence. | Approved distribution and managed-client compatibility. |
| Delivery communication | Requirements checks, tester notes, PR summaries, and source-backed changelogs. | Team templates, issue references, and stakeholder vocabulary. |

Before creating another agent or skill, inspect the current inventory and decide
whether to extend an existing capability. Basic Plugin already contains skill
authoring, custom-agent authoring, collision detection, and an advisory sentinel;
their presence does not demonstrate coverage of the other needs.

## Design-Token Requirements

A reusable design-system workflow should:

- Read supplied Sass and CSS token sources and distinguish token definitions,
  aliases, generated output, and consumer-specific mappings.
- Resolve referenced tokens and report missing definitions or unavailable source
  files before claiming that an integration is complete.
- Treat public token support as a separate question from whether a variable exists.
  Both supplied token sources explicitly caution that some variables are not for
  general consumption.
- Keep token mapping separate from consumer component rules and explicitly identify
  any exceptions. The bridge example includes a focus-outline rule alongside its
  variable mappings.
- Distinguish native theme tokens from authored fallbacks. Verify available themes
  against the actual package version before assuming that an example's limitations
  still apply.
- Check affected theme behavior, contrast, keyboard focus, CSS ordering, and build
  output in the consuming project. An example's comments are not test evidence.
- Use synthetic tokens and neutral component fixtures for personal development.
  Introduce the actual work package and mappings during adaptation at work.

This is a candidate skill or workflow need; it does not require turning Basic
Plugin into a styled website or bundling the supplied design-system files.

## Build and Transfer Workflow

1. Select one concrete work need and inspect the existing Basic Plugin inventory.
2. Define expected behavior, configuration inputs, and a small acceptance scenario.
3. Create or extend the reusable capability with neutral examples and fixtures.
4. Record what passed, failed, or remains untested in the personal environment.
5. Prepare the purpose-built capability with its dependencies, configuration points,
   usage instructions, and validation evidence for transfer.
6. Adapt and validate it in the work environment before recording work compatibility.

Work-specific source files, token payloads, internal paths, credentials, and company
rules remain external inputs. Referencing an example does not make it a runtime
instruction or a dependency of the installed plugin.

## Known Validation Questions

- The catalog includes a Jira Data Center setup description. Jonathan's stated work
  target is Jira Cloud. Verify the target before choosing a client or workflow.
- Legacy and newer plugin layouts both appear in the catalog. Do not adopt both
  merely because the example lists them; validate the intended client surfaces.
- Example framework versions, testing commands, package counts, and compatibility
  claims need verification when a specific capability is selected.
- This capture did not execute the referenced agents, compile the Sass, or render
  the theme integration.

## Relationship to Current Project State

[PROJECT.md](../PROJECT.md) remains the local project authority. Its current runtime
smoke objective and unknown managed-environment behavior remain applicable.
This reference records future development intent; implementation work should update
the project state when a concrete capability is selected.
