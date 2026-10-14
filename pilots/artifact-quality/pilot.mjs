// Consumer integration harness only. All artifact validation belongs to pinned AQC.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
export const pilotPath = 'pilots/artifact-quality';
export const agentPath = 'com.github.copilot/agents/custom-agent-foundry.agent.md';
export const skillPath = 'skills/capability-collision-detection/SKILL.md';
export const scannerPath = 'skills/capability-collision-detection/scripts/scan_capabilities.py';
const agentDeclarations = `${pilotPath}/foundry.declarations.json`;
const skillDeclarations = `${pilotPath}/collision.declarations.json`;
const configNames = ['inventory.json', 'foundry.binding.json', 'collision.binding.json',
  'foundry.declarations.json', 'collision.declarations.json', 'pin.json'];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const diagnostic = (rule, artifact, element, code, detail) =>
  [rule, artifact, element, code, detail];
const structure = (artifact, element) => diagnostic('AQC-BOUND-STRUCTURE', artifact,
  element, 'AQC-BOUND-ELEMENT', 'missing');
const value = keyword => diagnostic('AQC-BOUND-VALUES', agentPath,
  'tools', 'AQC-BOUND-VALUE', keyword);
const reference = code => diagnostic('AQC-BOUND-REFERENCES', skillPath,
  'dependencies', code, 'found');
export const expectations = {
  baseline: [structure(agentPath, 'permissions'), structure(agentPath, 'failureEscalation'),
    structure(skillPath, 'tools'), structure(skillPath, 'successCriteria')],
  'fixture-valid': [],
  'missing-agent-procedure': [structure(agentPath, 'procedure')],
  'missing-skill-procedure': [structure(skillPath, 'procedure')],
  'invalid-tools': [value('type')],
  'duplicate-tools': [value('uniqueItems')],
  'unknown-tool': [value('enum')],
  'missing-resource': [reference('AQC-BOUND-REFERENCE')],
  'escaping-resource': [reference('AQC-BOUND-REFERENCE')],
  'malformed-reference': [reference('AQC-BOUND-REFERENCE-TYPE')],
};

function replaceOnce(text, expression, replacement) {
  assert.equal([...text.matchAll(expression)].length, 1, `Mutation anchor changed: ${expression}`);
  return text.replace(expression, replacement);
}


function replaceFrontmatterField(text, field, replacement) {
  // The imported Foundry agent contains a second tools: inside a fenced YAML example.
  // Only a fully bounded leading frontmatter envelope can be mutated.
  const envelope = /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m.exec(text);
  assert.ok(envelope && envelope.index === 0, 'Expected a complete leading YAML frontmatter envelope');
  const frontmatter = envelope[1];
  const fieldLine = new RegExp('^' + field + ':[^\\r\\n]*$', 'gm');
  assert.equal([...frontmatter.matchAll(fieldLine)].length, 1,
    `Expected exactly one frontmatter ${field} declaration`);
  const start = envelope.index + envelope[0].indexOf(frontmatter);
  const end = start + frontmatter.length;
  return text.slice(0, start) + frontmatter.replace(fieldLine, () => replacement) + text.slice(end);
}

// Snapshot the complete file set for each case, including copied AQC contracts.
async function snapshotCase(caseRoot) {
  // readdir() follows a symlink passed as the root even though nested entries
  // are rejected below. Verify the root itself before inspecting any files.
  const rootStat = await lstat(caseRoot);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(),
    'Symlinked or non-directory case root is not allowed');
  const records = [];
  async function visit(relative = '') {
    for (const entry of await readdir(path.join(caseRoot, relative), { withFileTypes: true })) {
      const file = path.posix.join(relative, entry.name);
      assert.ok(!entry.isSymbolicLink(), `Synthetic case contains symlink: ${file}`);
      if (entry.isDirectory()) await visit(file);
      else {
        assert.ok(entry.isFile(), `Synthetic case contains non-file: ${file}`);
        records.push({ path: file, sha256: sha256(await readFile(path.join(caseRoot, file))) });
      }
    }
  }
  await visit();
  return records.sort((a, b) => a.path.localeCompare(b.path));
}

export async function verifySnapshots(inputsRoot, manifest) {
  const rootStat = await lstat(inputsRoot);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(),
    'Symlinked or non-directory input root is not allowed');
  const physicalInputsRoot = await realpath(inputsRoot);
  assert.deepEqual(Object.keys(manifest.caseSnapshots ?? {}).sort(),
    [...manifest.cases].sort(), 'Case snapshot inventory missing or incomplete');
  for (const name of manifest.cases) {
    const caseRoot = path.join(inputsRoot, name);
    // Root symlinks and intermediary symlink paths must not redirect execution
    // to an identical out-of-tree copy of the sealed snapshot.
    const caseStat = await lstat(caseRoot);
    assert.ok(caseStat.isDirectory() && !caseStat.isSymbolicLink(),
      `${name}: symlinked or non-directory case root is not allowed`);
    assert.equal(await realpath(caseRoot), path.join(physicalInputsRoot, name),
      `${name}: case root escapes sealed input tree`);
    const actual = await snapshotCase(caseRoot);
    assert.deepEqual(actual, manifest.caseSnapshots[name], `${name}: staged case snapshot changed`);
  }
}

export async function seal(inputsRoot) {
  const file = path.join(inputsRoot, 'manifest.json');
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  assert.deepEqual(manifest.cases, Object.keys(expectations), 'Case inventory changed');
  assert.ok(!Object.hasOwn(manifest, 'caseSnapshots'), 'Case snapshots already sealed');
  const caseSnapshots = {};
  for (const name of manifest.cases) {
    const snapshot = await snapshotCase(path.join(inputsRoot, name));
    for (const contract of ['contracts/agent.json', 'contracts/skill.json']) {
      assert.ok(snapshot.some(item => item.path === contract),
        `${name}: missing pinned contract ${contract}`);
    }
    caseSnapshots[name] = snapshot;
  }
  manifest.caseSnapshots = caseSnapshots;
  await writeFile(file, json(manifest));
  return manifest;
}


export async function prepare(repositoryRoot, destination) {
  repositoryRoot = await realpath(path.resolve(repositoryRoot));
  destination = path.resolve(destination);
  destination = path.join(await realpath(path.dirname(destination)), path.basename(destination));
  const relative = path.relative(repositoryRoot, destination);
  assert.ok(relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative),
    'Pilot output must be outside the source repository');
  const git = (...args) => execFileSync('git', ['-C', repositoryRoot, ...args], { encoding: 'utf8' });
  const consumerCommit = git('rev-parse', 'HEAD').trim();
  const inputPaths = [agentPath, skillPath, scannerPath, ...configNames.map(n => `${pilotPath}/${n}`)];
  // Read immutable Git blobs, not a changing or partly untracked filesystem snapshot.
  const inputs = Object.fromEntries(inputPaths.map(p => [p, git('show', `${consumerCommit}:${p}`)]));
  const pin = JSON.parse(inputs[`${pilotPath}/pin.json`]);
  assert.match(pin.commit, /^[a-f0-9]{40}$/);
  await mkdir(destination); // Refuse to overwrite an earlier run's evidence.
  const manifest = {
    schemaVersion: 1, consumerRepository: 'jnicholas000/basic-plugin', consumerCommit,
    aqc: pin, profile: 'artifact-quality',
    inputs: inputPaths.map(p => ({ path: p, sha256: sha256(inputs[p]) })),
    cases: Object.keys(expectations),
    limits: 'Baseline is real source. All other cases are synthetic overlays, not runtime or adoption evidence.',
  };
  for (const name of manifest.cases) {
    const files = { ...inputs, 'aqc.artifacts.json': inputs[`${pilotPath}/inventory.json`],
      'aqc.config.json': json({ schemaVersion: 1, profiles: ['artifact-quality'] }) };
    if (name !== 'baseline') {
      // Deliberately synthetic declarations isolate the downstream validators.
      // These never modify either distributed artifact or the baseline report.
      files[agentDeclarations] = json({ permissions: ['TEST-ONLY: workspace read/edit'],
        failureEscalation: 'TEST-ONLY: Stop and escalate a failed operation.' });
      files[skillDeclarations] = json({ dependencies: [scannerPath], tools: ['TEST-ONLY: python3'],
        successCriteria: 'TEST-ONLY: Return the bounded collision report with coverage limits.' });
    }
    if (name === 'missing-agent-procedure') files[agentPath] = replaceOnce(files[agentPath],
      /^## Your Process$/gm, '## Unmapped process');
    if (name === 'missing-skill-procedure') files[skillPath] = replaceOnce(files[skillPath],
      /^## Workflow$/gm, '## Unmapped workflow');
    const toolMutations = { 'invalid-tools': 'tools: 42',
      'duplicate-tools': "tools: ['read', 'read']", 'unknown-tool': "tools: ['not-in-consumer-contract']" };
    if (Object.hasOwn(toolMutations, name)) files[agentPath] = replaceFrontmatterField(
      files[agentPath], 'tools', toolMutations[name]);
    if (name === 'missing-resource') delete files[scannerPath];
    if (name === 'escaping-resource') {
      const declarations = JSON.parse(files[skillDeclarations]);
      declarations.dependencies = ['../outside.py'];
      files[skillDeclarations] = json(declarations);
    }
    if (name === 'malformed-reference') {
      const declarations = JSON.parse(files[skillDeclarations]);
      declarations.dependencies = scannerPath;
      files[skillDeclarations] = json(declarations);
    }
    for (const [file, text] of Object.entries(files)) {
      const output = path.join(destination, name, file);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, text);
    }
  }
  await writeFile(path.join(destination, 'manifest.json'), json(manifest));
  return manifest;
}

export async function assess(inputsRoot, resultsRoot, repositoryRoot = path.resolve(directory, '../..')) {
  const manifest = JSON.parse(await readFile(path.join(inputsRoot, 'manifest.json'), 'utf8'));
  const pinned = JSON.parse(await readFile(path.join(directory, 'pin.json'), 'utf8'));
  assert.deepEqual(manifest.aqc, pinned, 'Prepared inputs use a different AQC pin');
  assert.deepEqual(manifest.cases, Object.keys(expectations), 'Case inventory changed');
  await verifySnapshots(inputsRoot, manifest);
  const git = (...args) => execFileSync('git', ['-C', repositoryRoot, ...args], { encoding: 'utf8' });
  assert.equal(manifest.consumerCommit, git('rev-parse', 'HEAD').trim(), 'Consumer revision changed');
  const inputPaths = [agentPath, skillPath, scannerPath, ...configNames.map(n => `${pilotPath}/${n}`)];
  assert.deepEqual(manifest.inputs.map(item => item.path), inputPaths, 'Consumed-file inventory changed');
  for (const item of manifest.inputs) {
    assert.equal(sha256(git('show', `${manifest.consumerCommit}:${item.path}`)), item.sha256,
      `Input is not the recorded consumer blob: ${item.path}`);
    assert.equal(sha256(await readFile(path.join(inputsRoot, 'baseline', item.path))), item.sha256,
      `Staged baseline changed: ${item.path}`);
  }
  // Validate the *identity* of each finding against the exact sealed consumer
  // inventory, binding, and pinned contract. Mere non-empty identities can
  // silently accept findings from a different contract version or agent.
  const stagedBaseline = path.join(inputsRoot, 'baseline');
  const inventory = JSON.parse(await readFile(path.join(stagedBaseline, pilotPath, 'inventory.json'), 'utf8'));
  const registryBindings = await Promise.all(inventory.bindings.map(async file =>
    JSON.parse(await readFile(path.join(stagedBaseline, file), 'utf8'))));
  const registryContracts = await Promise.all(inventory.contracts.map(async file =>
    JSON.parse(await readFile(path.join(stagedBaseline, file), 'utf8'))));
  const identity = ({ id, version }) => `${id}@${version}`;
  const bindings = new Map(registryBindings.map(binding => [identity(binding), binding]));
  const contracts = new Map(registryContracts.map(contract => [identity(contract), contract]));
  const expectedIdentityByPath = new Map();
  for (const artifact of inventory.artifacts) {
    const binding = bindings.get(identity(artifact.binding));
    assert.ok(binding, `Unresolved exact consumer binding: ${artifact.path}`);
    const contract = contracts.get(identity(binding.contract));
    assert.ok(contract, `Unresolved exact contract: ${artifact.path}`);
    assert.equal(binding.artifactType, artifact.artifactType);
    assert.equal(contract.artifactType, artifact.artifactType);
    assert.ok(!expectedIdentityByPath.has(artifact.path),
      `Duplicate explicitly bound artifact: ${artifact.path}`);
    expectedIdentityByPath.set(artifact.path, {
      contractIdentity: identity(contract), bindingIdentity: identity(binding),
    });
  }
  const observedAqcCommit = (await readFile(path.join(resultsRoot, 'aqc-commit.txt'), 'utf8')).trim();
  assert.equal(observedAqcCommit, pinned.commit, 'Executed AQC revision does not match the pin');
  const results = [];
  for (const name of manifest.cases) {
    const rawBytes = await readFile(path.join(resultsRoot, `${name}.raw.json`));
    const raw = JSON.parse(rawBytes);
    const status = (await readFile(path.join(resultsRoot, `${name}.exit.txt`), 'utf8')).trim();
    const expected = expectations[name];
    assert.equal(status, expected.length ? '1' : '0', `${name}: unexpected CLI exit status`);
    assert.ok(Array.isArray(raw.findings), `${name}: missing findings array`);
    const observed = raw.findings.map(f => {
      assert.equal(f.profile, 'artifact-quality');
      assert.equal(f.enforcement, 'blocking'); // Rule semantics retained; not a required repository gate.
      assert.equal(f.ruleVersion, '1.0.0');
      assert.ok(f.evidence.source, `${name}: missing source attribution`);
      const expectedIdentity = expectedIdentityByPath.get(f.path);
      assert.ok(expectedIdentity, `${name}: finding attributed to unbound artifact: ${f.path}`);
      assert.equal(f.evidence.contractIdentity, expectedIdentity.contractIdentity,
        `${name}: wrong exact contract identity on ${f.path}`);
      assert.equal(f.evidence.bindingIdentity, expectedIdentity.bindingIdentity,
        `${name}: wrong exact consumer binding identity on ${f.path}`);
      return diagnostic(f.ruleId, f.path, f.evidence.elementId, f.evidence.code,
        f.evidence.keyword ?? f.evidence.status);
    });
    const sorted = items => items.map(item => JSON.stringify(item)).sort();
    assert.deepEqual(sorted(observed), sorted(expected), `${name}: exact diagnostic mismatch`);
    assert.equal(raw.summary.blocking, expected.length, `${name}: inconsistent blocking count`);
    results.push({ name, evidenceKind: name === 'baseline' ? 'real-source' : 'synthetic-control',
      exitCode: Number(status), findings: raw.findings.length, matched: true,
      rawSha256: sha256(rawBytes), diagnostics: observed });
  }
  return { schemaVersion: 1, consumerCommit: manifest.consumerCommit,
    aqcCommit: observedAqcCommit, inputs: manifest.inputs, results,
    decision: 'Integration expectations matched. Baseline declaration gaps remain open. No runtime qualification or gate promotion.' };
}

async function main() {
  const [command, first, second] = process.argv.slice(2);
  if (command === 'prepare' && first && !second) {
    console.log(json(await prepare(path.resolve(directory, '../..'), first)));
  } else if (command === 'seal' && first && !second) {
    console.log(json(await seal(first)));
  } else if (command === 'verify' && first && !second) {
    const manifest = JSON.parse(await readFile(path.join(first, 'manifest.json'), 'utf8'));
    await verifySnapshots(first, manifest);
    console.log('All staged case snapshots match sealed SHA-256 records.');
  } else if (command === 'assess' && first && second) {
    console.log(json(await assess(first, second)));
  } else {
    throw new Error('Usage: node pilots/artifact-quality/pilot.mjs prepare OUTPUT | seal INPUTS | verify INPUTS | assess INPUTS RESULTS');
  }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
