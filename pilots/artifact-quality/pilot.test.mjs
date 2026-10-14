import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { prepare, seal, assess, expectations, agentPath, skillPath, scannerPath, pilotPath } from './pilot.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
async function fixture(context, { realFoundry = false } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'basic-artifact-pilot-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const repo = path.join(root, 'consumer');
  await mkdir(repo);
  await cp(here, path.join(repo, pilotPath), { recursive: true });
  const source = {
    [agentPath]: "---\ntools: ['read']\n---\n## Your Process\nCreate a result.\n\n```yaml\ntools: ['example-not-an-input']\n```\n",
    [skillPath]: '## Workflow\nInspect approved roots.\n',
    [scannerPath]: "raise RuntimeError('This resource must never execute')\n",
  };
  if (realFoundry) {
    source[agentPath] = await readFile(path.resolve(here, '../..', agentPath), 'utf8');
  }
  for (const [file, text] of Object.entries(source)) {
    await mkdir(path.dirname(path.join(repo, file)), { recursive: true });
    await writeFile(path.join(repo, file), text);
  }
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });
  git('init', '-q'); git('add', '.');
  git('-c', 'user.name=Pilot Test', '-c', 'user.email=pilot@example.invalid', 'commit', '-qm', 'Synthetic harness fixture');
  const inputs = path.join(root, 'inputs');
  await prepare(repo, inputs);
  // Mimic run.sh's contract copy, then seal every complete executed case.
  for (const name of Object.keys(expectations)) {
    const contracts = path.join(inputs, name, 'contracts');
    await mkdir(contracts);
    await writeFile(path.join(contracts, 'agent.json'), '{"id":"agent-base","version":"1.0.0","artifactType":"agent"}\n');
    await writeFile(path.join(contracts, 'skill.json'), '{"id":"skill-base","version":"1.0.0","artifactType":"skill"}\n');
  }
  const manifest = await seal(inputs);
  return { root, repo, inputs, manifest, source };
}

async function mockResults(f) {
  const results = path.join(f.root, 'results');
  await mkdir(results);
  await writeFile(path.join(results, 'aqc-commit.txt'), f.manifest.aqc.commit);
  const bindingByArtifact = {
    [agentPath]: JSON.parse(await readFile(path.join(f.inputs, 'baseline', pilotPath, 'foundry.binding.json'))),
    [skillPath]: JSON.parse(await readFile(path.join(f.inputs, 'baseline', pilotPath, 'collision.binding.json'))),
  };
  const declarationByArtifact = {
    [agentPath]: pilotPath + '/foundry.declarations.json',
    [skillPath]: pilotPath + '/collision.declarations.json',
  };
  for (const [name, expected] of Object.entries(expectations)) {
    const findings = expected.map(([ruleId, artifact, elementId, code, detail]) => {
      const binding = bindingByArtifact[artifact];
      const locator = binding.elements[elementId];
      return {
        ruleId, ruleVersion: '1.0.0', path: artifact,
        artifactType: artifact === agentPath ? 'agent' : 'skill',
        profile: 'artifact-quality', enforcement: 'blocking',
        evidence: {
          elementId, code, locator,
          source: locator.kind === 'declaration' ? declarationByArtifact[artifact] : artifact,
          contractIdentity: binding.contract.id + '@' + binding.contract.version,
          bindingIdentity: binding.id + '@' + binding.version,
          ...(ruleId === 'AQC-BOUND-VALUES' ? { keyword: detail } : { status: detail }),
        },
      };
    });
    await writeFile(path.join(results, `${name}.raw.json`), JSON.stringify({ findings, summary: { blocking: findings.length } }));
    await writeFile(path.join(results, `${name}.exit.txt`), findings.length ? '1\n' : '0\n');
  }
  return results;
}

test('preparation preserves real baseline bytes and isolates every synthetic overlay', async context => {
  const f = await fixture(context);
  for (const [file, text] of Object.entries(f.source)) {
    assert.equal(await readFile(path.join(f.inputs, 'baseline', file), 'utf8'), text);
    assert.equal(await readFile(path.join(f.repo, file), 'utf8'), text);
  }
  const baseline = JSON.parse(await readFile(path.join(f.inputs, 'baseline', pilotPath, 'foundry.declarations.json')));
  assert.deepEqual(baseline, {});
  const positive = JSON.parse(await readFile(path.join(f.inputs, 'fixture-valid', pilotPath, 'foundry.declarations.json')));
  assert.match(positive.failureEscalation, /TEST-ONLY/);
  await assert.rejects(readFile(path.join(f.inputs, 'missing-resource', scannerPath)), { code: 'ENOENT' });
  assert.equal(f.manifest.cases.length, 10);
  await assert.rejects(prepare(f.repo, f.inputs), { code: 'EEXIST' });
  await assert.rejects(prepare(f.repo, path.join(f.repo, 'out')), /outside/);
  const alias = path.join(f.root, 'consumer-alias');
  await symlink(f.repo, alias, 'dir');
  await assert.rejects(prepare(f.repo, path.join(alias, 'out')), /outside/);
});

test('preparation reads immutable committed blobs, never changed working-tree source', async context => {
  const f = await fixture(context);
  await writeFile(path.join(f.repo, agentPath), 'uncommitted source');
  const second = path.join(f.root, 'second');
  await prepare(f.repo, second);
  assert.equal(await readFile(path.join(second, 'baseline', agentPath), 'utf8'), f.source[agentPath]);
});

test('assessment requires exact per-case diagnostics and exit status, not a nonzero count', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const report = await assess(f.inputs, results, f.repo);
  assert.equal(report.results.length, 10);
  const bad = path.join(results, 'missing-agent-procedure.raw.json');
  await writeFile(bad, JSON.stringify({ findings: [], summary: { blocking: 0 } }));
  await assert.rejects(assess(f.inputs, results, f.repo), /exact diagnostic mismatch/);
});

test('assessment rejects changed baseline data and AQC revision', async context => {
  const f = await fixture(context), results = await mockResults(f);
  await writeFile(path.join(results, 'aqc-commit.txt'), '0'.repeat(40));
  await assert.rejects(assess(f.inputs, results, f.repo), /AQC revision/);
  await writeFile(path.join(results, 'aqc-commit.txt'), f.manifest.aqc.commit);
  await writeFile(path.join(f.inputs, 'baseline', skillPath), 'altered input');
  await assert.rejects(assess(f.inputs, results, f.repo), /baseline: staged case snapshot changed/);
});

test('an AQC execution error cannot be mistaken for a successful defect detection', async context => {
  const f = await fixture(context), results = await mockResults(f);
  await writeFile(path.join(results, 'baseline.exit.txt'), '2\n');
  await assert.rejects(assess(f.inputs, results, f.repo), /unexpected CLI exit status/);
});


test('tool mutations affect only leading frontmatter, not fenced documentation in the real Foundry agent', async context => {
  const f = await fixture(context, { realFoundry: true });
  const frontmatterEnd = source => source.indexOf('\n---\n');
  assert.ok(frontmatterEnd(f.source[agentPath]) > 0, 'Real Foundry frontmatter not found');
  const originalBody = f.source[agentPath].slice(frontmatterEnd(f.source[agentPath]) + 5);
  for (const [name, expected] of [
    ['invalid-tools', 'tools: 42'],
    ['duplicate-tools', "tools: ['read', 'read']"],
    ['unknown-tool', "tools: ['not-in-consumer-contract']"],
  ]) {
    const mutated = await readFile(path.join(f.inputs, name, agentPath), 'utf8');
    assert.ok(mutated.includes(expected), name);
    assert.equal(mutated.slice(frontmatterEnd(mutated) + 5), originalBody,
      name + ': a YAML example or body content was changed');
  }
});

test('assessment rejects drift in any staged case including synthetic overlays and copied contracts', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const positive = path.join(f.inputs, 'fixture-valid', pilotPath, 'foundry.declarations.json');
  const original = await readFile(positive, 'utf8');
  await writeFile(positive, '{"permissions":["tampered"]}\n');
  await assert.rejects(assess(f.inputs, results, f.repo), /fixture-valid: staged case snapshot changed/);
  await writeFile(positive, original);

  const contract = path.join(f.inputs, 'missing-resource', 'contracts', 'skill.json');
  const originalContract = await readFile(contract, 'utf8');
  await writeFile(contract, '{"tampered":true}\n');
  await assert.rejects(assess(f.inputs, results, f.repo), /missing-resource: staged case snapshot changed/);
  await writeFile(contract, originalContract);

  const injected = path.join(f.inputs, 'baseline', 'extra.ts');
  await writeFile(injected, 'export const fake = 1;\n');
  await assert.rejects(assess(f.inputs, results, f.repo), /baseline: staged case snapshot changed/);
  await rm(injected);

  const scan = path.join(f.inputs, 'fixture-valid', scannerPath);
  await rm(scan);
  await assert.rejects(assess(f.inputs, results, f.repo), /fixture-valid: staged case snapshot changed/);
});

test('runner rejects output inside a physical AQC checkout even through a symlink alias', async context => {
  const f = await fixture(context);
  const checkout = path.join(f.root, 'physical-aqc');
  const alias = path.join(f.root, 'aqc-alias');
  await mkdir(checkout);
  await symlink(checkout, alias, 'dir');
  const process = spawnSync('bash', [path.join(here, 'run.sh'), alias, path.join(checkout, 'evidence')], {
    encoding: 'utf8',
  });
  assert.equal(process.status, 2);
  assert.match(process.stderr, /Output must be outside both source checkouts/);
});

test('snapshot validation rejects an identical symlinked case root and input root', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const baseline = path.join(f.inputs, 'baseline');
  const outside = path.join(f.root, 'moved-baseline');
  await rename(baseline, outside);
  await symlink(outside, baseline, 'dir');
  await assert.rejects(assess(f.inputs, results, f.repo),
    /baseline: symlinked or non-directory case root/);
  await rm(baseline);
  await rename(outside, baseline);
  const alias = path.join(f.root, 'inputs-alias');
  await symlink(f.inputs, alias, 'dir');
  await assert.rejects(assess(alias, results, f.repo), /Symlinked or non-directory input root/);
  const approved = await assess(f.inputs, results, f.repo);
  assert.equal(approved.results.length, Object.keys(expectations).length);
});

test('sealing rejects symlinked case roots instead of hashing target files', async context => {
  const f = await fixture(context);
  const input = path.join(f.root, 'inputs-unsealed');
  await prepare(f.repo, input);
  for (const name of Object.keys(expectations)) {
    const contracts = path.join(input, name, 'contracts');
    await mkdir(contracts);
    await writeFile(path.join(contracts, 'agent.json'), '{"id":"agent-base","version":"1.0.0","artifactType":"agent"}\n');
    await writeFile(path.join(contracts, 'skill.json'), '{"id":"skill-base","version":"1.0.0","artifactType":"skill"}\n');
  }
  const original = path.join(input, 'fixture-valid');
  const moved = path.join(f.root, 'redirected-case');
  await rename(original, moved);
  await symlink(moved, original, 'dir');
  await assert.rejects(seal(input), /Symlinked or non-directory case root/);
});

test('tool mutation rejects a YAML envelope after non-frontmatter introductory text', async context => {
  const f = await fixture(context);
  const git = (...args) => execFileSync('git', ['-C', f.repo, ...args], { stdio: 'pipe' });
  await writeFile(path.join(f.repo, agentPath), 'Some introductory text.\n' + f.source[agentPath]);
  git('add', agentPath);
  git('-c', 'user.name=Pilot Test', '-c', 'user.email=pilot@example.invalid',
    'commit', '-qm', 'Move frontmatter away from beginning');
  await assert.rejects(prepare(f.repo, path.join(f.root, 'nonleading')),
    /Expected a complete leading YAML frontmatter envelope/);
});


test('assessment rejects incorrect exact contract or binding identities even when diagnostics match', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const baselineRaw = path.join(results, 'baseline.raw.json');
  const original = JSON.parse(await readFile(baselineRaw, 'utf8'));
  for (const [key, value, expected] of [
    ['contractIdentity', 'agent-base@9.9.9', /wrong exact contract identity/],
    ['bindingIdentity', 'other-foundry@1.0.0', /wrong exact consumer binding identity/],
  ]) {
    const forged = structuredClone(original);
    forged.findings[0].evidence[key] = value;
    await writeFile(baselineRaw, JSON.stringify(forged));
    await assert.rejects(assess(f.inputs, results, f.repo), expected);
  }
  await writeFile(baselineRaw, JSON.stringify(original));
  const valid = await assess(f.inputs, results, f.repo);
  assert.equal(valid.results.length, 10);
});

test('runner refuses a dirty committed harness before pinning execution evidence', async context => {
  const f = await fixture(context);
  await writeFile(path.join(f.repo, pilotPath, 'pilot.mjs'), '// altered executable code\n');
  const fakeAqc = path.join(f.root, 'aqc');
  await mkdir(fakeAqc);
  const attempted = spawnSync('bash', [
    path.join(f.repo, pilotPath, 'run.sh'), fakeAqc, path.join(f.root, 'new-evidence'),
  ], { encoding: 'utf8' });
  assert.equal(attempted.status, 2);
  assert.match(attempted.stderr, /Consumer pilot harness differs from committed HEAD/);
});


test('assessment rejects forged element sources, locator provenance and artifact type', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const baselineRaw = path.join(results, 'baseline.raw.json');
  const original = JSON.parse(await readFile(baselineRaw, 'utf8'));
  for (const [mutate, expected] of [
    [finding => { finding.evidence.source = 'some-other-declarations.json'; },
      /wrong bound element source attribution/],
    [finding => { finding.evidence.locator = { kind: 'declaration', name: 'other' }; },
      /wrong bound element locator/],
    [finding => { finding.artifactType = 'skill'; }, /wrong artifact type/],
  ]) {
    const forged = structuredClone(original);
    mutate(forged.findings[0]);
    await writeFile(baselineRaw, JSON.stringify(forged));
    await assert.rejects(assess(f.inputs, results, f.repo), expected);
  }
  await writeFile(baselineRaw, JSON.stringify(original));
  const verified = await assess(f.inputs, results, f.repo);
  assert.equal(verified.results.length, 10);
});


test('durable report retains every independently checked provenance field for each finding', async context => {
  const f = await fixture(context), results = await mockResults(f);
  const report = await assess(f.inputs, results, f.repo);
  const baseline = report.results.find(entry => entry.name === 'baseline');
  assert.equal(baseline.checkedFindingProvenance.length, 4);
  for (const finding of baseline.checkedFindingProvenance) {
    assert.match(finding.contractIdentity, /^(agent|skill)-base@1\.0\.0$/);
    assert.match(finding.bindingIdentity, /^basic-plugin-(foundry|collision)-pilot@1\.0\.0$/);
    assert.ok(finding.source, 'Missing durable source path');
    assert.ok(finding.locator?.kind, 'Missing durable locator');
    assert.ok(['agent','skill'].includes(finding.artifactType));
    assert.equal(finding.ruleVersion, '1.0.0');
    assert.equal(finding.code, 'AQC-BOUND-ELEMENT');
  }
  assert.equal(report.results.find(entry => entry.name === 'fixture-valid')
    .checkedFindingProvenance.length, 0);
  const serialized = JSON.parse(JSON.stringify(report));
  assert.deepEqual(serialized.results[0].checkedFindingProvenance,
    baseline.checkedFindingProvenance);
});
