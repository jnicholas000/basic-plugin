import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { applyOverlay, vendor } from '../eng/vendor-upstream.mjs';
import { capturePreflight, classifyPreflight } from '../eng/vendor-preflight.mjs';

const config = JSON.parse(await readFile('website/vendor.config.json', 'utf8'));
const overlay = JSON.parse(await readFile(config.overlay, 'utf8'));
const pkg = { dependencies: { astro: '^7.0.0', react: '^19.0.0' } };
const base = { base: config.acceptedSha, head: 'b'.repeat(40), complete: true, truncated: false, files: [], consumedPaths: ['website/src/lib/site-data.ts'], basePackage: pkg, headPackage: pkg };
const classify = values => classifyPreflight({ ...base, ...values }, config, overlay);

test('routine is limited to explicit non-executable allowlist and never auto-advances', () => {
  assert.equal(classify({ files: [{ status: 'M', path: 'website/public/image.png' }] }).classification, 'routine');
  for (const file of ['website/src/page.tsx', 'website/package.json', 'website/public/data.json', 'website/public/image.svg', 'scripts/install.sh', 'website/public/image.png.js']) assert.equal(classify({ files: [{ status: 'M', path: file }] }).classification, 'review', file);
  assert.equal(classify({}).automaticBaselineAdvancement, false);
});
test('renames and overlay changes require review; lost integration point requires migration', () => {
  assert.equal(classify({ files: [{ status: 'R', previousPath: 'website/public/old.png', path: 'website/public/new.png' }] }).classification, 'review');
  assert.equal(classify({ files: [{ status: 'M', path: overlay.rules[0].target }] }).classification, 'review');
  assert.equal(classify({ files: [{ status: 'D', path: overlay.rules[0].target }] }).classification, 'architecture');
});
test('framework shape/major and consumed surface replacement are architecture', () => {
  assert.equal(classify({ headPackage: { dependencies: { astro: '^8.0.0', react: '^19.0.0' } } }).classification, 'architecture');
  assert.equal(classify({ headPackage: { dependencies: { astro: '^7.0.0' } } }).classification, 'architecture');
  const paths = Array.from({ length: 20 }, (_, i) => `website/src/lib/${i}.ts`);
  assert.equal(classifyPreflight({ ...base, consumedPaths: paths, files: paths.map(path => ({ status: 'M', path })) }, { ...config, copy: ['website/src'], prune: [], keep: [] }, overlay).classification, 'architecture');
});
test('missing, truncated, unbound and unresolvable evidence fails closed', () => {
  for (const values of [{ complete: false }, { truncated: true }, { basePackage: null }, { base: 'c'.repeat(40) }, { files: [{ path: '../private', status: 'M' }] }, { headPackage: { dependencies: { astro: 'latest', react: '^19.0.0' } } }]) {
    const result = classify(values);
    assert.equal(result.classification, 'indeterminate');
    assert.equal(result.candidateExecutionAllowed, false);
  }
});
test('assertive overlay refuses missing/ambiguous matches and applies owned replacement', () => {
  const files = new Map([['website/a.txt', Buffer.from('hello')]]);
  const rule = { name: 'brand', intent: 'local brand', target: 'website/a.txt', operation: 'replaceText', expected: 'hello', replacement: 'local' };
  assert.equal(applyOverlay(files, { rules: [rule] }, new Map()).get('website/a.txt').toString(), 'local');
  assert.throws(() => applyOverlay(new Map(), { rules: [rule] }, new Map()), /Missing overlay/);
  assert.throws(() => applyOverlay(new Map([['website/a.txt', Buffer.from('hello hello')]]), { rules: [rule] }, new Map()), /exactly once/);
  assert.throws(() => applyOverlay(files, { rules: [{ ...rule, target: '../private' }] }, new Map()), /Unsafe path/);
});
test('real Git vendoring is deterministic, prunes, replaces stale roots, and executes no upstream scripts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'vendor-test-'));
  const repository = path.join(root, 'upstream');
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' }).trim();
  try {
    await mkdir(path.join(repository, 'website/src/lib'), { recursive: true });
    await writeFile(path.join(repository, 'website/package.json'), JSON.stringify({ ...pkg, scripts: { install: 'exit 99' } }));
    await writeFile(path.join(repository, 'website/astro.config.mjs'), 'throw new Error("must never execute");\n');
    await writeFile(path.join(repository, 'website/src/lib/site-data.ts'), 'upstream resource catalog');
    await writeFile(path.join(repository, 'website/src/lib/private-data.ts'), 'must prune');
    await mkdir(path.join(root, 'website/overlay'), { recursive: true });
    await writeFile(path.join(root, 'website/overlay/local-site-data.ts'), 'local catalog authority');
    git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.invalid'); git('add', '.'); git('commit', '-qm', 'fixture');
    const ref = git('rev-parse', 'HEAD');
    const settings = { ...config, acceptedSha: ref };
    const output = path.join(root, 'generated');
    const first = await vendor({ repository, config: settings, overlay, output, localRoot: root });
    await writeFile(path.join(output, 'stale.txt'), 'stale');
    const second = await vendor({ repository, config: settings, overlay, output, localRoot: root });
    assert.deepEqual(first, second);
    assert.equal(second.fileCount, 3);
    assert.equal((await readFile(path.join(output, overlay.rules[0].target))).toString(), 'local catalog authority');
    assert.deepEqual(await readdir(path.join(output, 'website/src/lib')), ['site-data.ts']);
    await assert.rejects(readFile(path.join(output, 'stale.txt')));
    assert.equal((await capturePreflight(repository, ref, ref)).complete, true);
    await assert.rejects(vendor({ repository, config: settings, overlay, role: 'accepted', ref: 'b'.repeat(40), output, localRoot: root }), /Invalid immutable/);
    git('mv', 'website/src/lib/site-data.ts', 'website/src/lib/moved.ts'); git('commit', '-qam', 'rename');
    const evidence = capturePreflight(repository, ref, git('rev-parse', 'HEAD'));
    assert.equal(classifyPreflight(evidence, settings, overlay).classification, 'architecture');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('committed provenance catches modified bytes and unexpected files', async () => {
  const { cp } = await import('node:fs/promises');
  const root = await mkdtemp(path.join(tmpdir(), 'vendor-provenance-'));
  const validator = path.resolve('eng/validate-vendor-provenance.mjs');
  try {
    await cp('website', path.join(root, 'website'), { recursive: true });
    const run = () => execFileSync(process.execPath, [validator], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    assert.match(run(), /Validated 3/);
    const file = path.join(root, 'website/vendor-generated/website/astro.config.mjs');
    await writeFile(file, 'drift');
    assert.throws(run, /Vendor drift/);
    await cp('website/vendor-generated/website/astro.config.mjs', file);
    await writeFile(path.join(root, 'website/vendor-generated/stale'), 'stale');
    assert.throws(run, /Stale or missing/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
