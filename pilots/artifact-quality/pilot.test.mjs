import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { prepare, assess, expectations, agentPath, skillPath, scannerPath, pilotPath } from './pilot.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
async function fixture(context) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'basic-artifact-pilot-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const repo = path.join(root, 'consumer');
  await mkdir(repo);
  await cp(here, path.join(repo, pilotPath), { recursive: true });
  const source = {
    [agentPath]: "---\ntools: ['read']\n---\n## Your Process\nCreate a result.\n",
    [skillPath]: '## Workflow\nInspect approved roots.\n',
    [scannerPath]: "raise RuntimeError('This resource must never execute')\n",
  };
  for (const [file, text] of Object.entries(source)) {
    await mkdir(path.dirname(path.join(repo, file)), { recursive: true });
    await writeFile(path.join(repo, file), text);
  }
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });
  git('init', '-q'); git('add', '.');
  git('-c', 'user.name=Pilot Test', '-c', 'user.email=pilot@example.invalid', 'commit', '-qm', 'Synthetic harness fixture');
  const inputs = path.join(root, 'inputs');
  const manifest = await prepare(repo, inputs);
  return { root, repo, inputs, manifest, source };
}

async function mockResults(f) {
  const results = path.join(f.root, 'results');
  await mkdir(results);
  await writeFile(path.join(results, 'aqc-commit.txt'), f.manifest.aqc.commit);
  for (const [name, expected] of Object.entries(expectations)) {
    const findings = expected.map(([ruleId, artifact, elementId, code, detail]) => ({
      ruleId, ruleVersion: '1.0.0', path: artifact, profile: 'artifact-quality', enforcement: 'blocking',
      evidence: { elementId, code, source: artifact, contractIdentity: 'test-contract', bindingIdentity: 'test-binding',
        ...(ruleId === 'AQC-BOUND-VALUES' ? { keyword: detail } : { status: detail }) },
    }));
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
  await assert.rejects(assess(f.inputs, results, f.repo), /Staged baseline changed/);
});

test('an AQC execution error cannot be mistaken for a successful defect detection', async context => {
  const f = await fixture(context), results = await mockResults(f);
  await writeFile(path.join(results, 'baseline.exit.txt'), '2\n');
  await assert.rejects(assess(f.inputs, results, f.repo), /unexpected CLI exit status/);
});
