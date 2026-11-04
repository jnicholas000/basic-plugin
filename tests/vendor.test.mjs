import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
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
test('adding Starlight preserves Astro/React but stops candidate execution for architecture review', () => {
  const result = classify({ headPackage: { dependencies: { ...pkg.dependencies, '@astrojs/starlight': '^0.37.0' } } });
  assert.equal(result.classification, 'architecture');
  assert.equal(result.candidateExecutionAllowed, false);
  assert.equal(result.automaticBaselineAdvancement, false);
  assert.ok(result.signals.includes('Framework shape changed: @astrojs/starlight'));
});
test('missing, truncated, unbound and unresolvable evidence fails closed', () => {
  for (const values of [{ complete: false }, { truncated: true }, { basePackage: null }, { base: 'c'.repeat(40) }, { files: [{ path: '../private', status: 'M' }] }, { headPackage: { dependencies: { astro: 'latest', react: '^19.0.0' } } }, { basePackage: [], headPackage: [] }, { basePackage: { dependencies: [] } }, { basePackage: {}, headPackage: {} }, { basePackage: { dependencies: { astro: 'latest' } }, headPackage: { dependencies: { astro: 'latest' } } }]) {
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
    const outsideRoot = await mkdtemp(path.join(tmpdir(), 'vendor-outside-'));
    try {
      const outsideSource = path.join(outsideRoot, 'local-site-data.ts');
      await writeFile(outsideSource, 'synthetic external overlay source');
      await symlink(outsideSource, path.join(root, 'website/overlay/escaped-site-data.ts'));
      const snapshotOutput = async (directory, prefix = '') => {
        const entries = [];
        for (const entry of (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
          const file = path.join(directory, entry.name);
          const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
          if (entry.isDirectory()) entries.push(...await snapshotOutput(file, relative));
          else entries.push([relative, (await readFile(file)).toString('hex')]);
        }
        return entries;
      };
      const beforeOutput = await snapshotOutput(output);
      const escapedOverlay = { ...overlay, rules: overlay.rules.map(rule => ({ ...rule, source: 'website/overlay/escaped-site-data.ts' })) };
      await assert.rejects(vendor({ repository, config: settings, overlay: escapedOverlay, output, localRoot: root }), /Overlay source escapes local root/);
      assert.deepEqual(await snapshotOutput(output), beforeOutput);
    } finally {
      await rm(outsideRoot, { recursive: true, force: true });
    }
    git('mv', 'website/src/lib/site-data.ts', 'website/src/lib/moved.ts'); git('commit', '-qam', 'rename');
    const evidence = capturePreflight(repository, ref, git('rev-parse', 'HEAD'));
    assert.equal(classifyPreflight(evidence, settings, overlay).classification, 'architecture');
    await rm(path.join(repository, 'website/astro.config.mjs'));
    await symlink('/etc/passwd', path.join(repository, 'website/astro.config.mjs'));
    git('add', '.'); git('commit', '-qm', 'symlink');
    await assert.rejects(vendor({ repository, config: settings, overlay, ref: git('rev-parse', 'HEAD'), role: 'candidate', output, localRoot: root }), /Unsupported vendor entry/);
    assert.equal(JSON.parse(await readFile(path.join(output, 'provenance.json'), 'utf8')).upstreamSha, ref);
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
    const overlaySourceFile = path.join(root, 'website/overlay/local-site-data.ts');
    const overlaySourceBytes = await readFile(overlaySourceFile);
    await writeFile(overlaySourceFile, 'changed local catalog adapter');
    assert.throws(run, /Overlay source drift/);
    await writeFile(overlaySourceFile, overlaySourceBytes);
    const baselineFile = path.join(root, 'website/upstream-baseline.json');
    const baselineBytes = await readFile(baselineFile);
    await writeFile(baselineFile, JSON.stringify({ ref: 'a'.repeat(40) }));
    assert.throws(run, /must match/);
    await writeFile(baselineFile, baselineBytes);
    const file = path.join(root, 'website/vendor-generated/website/astro.config.mjs');
    await writeFile(file, 'drift');
    assert.throws(run, /Vendor drift/);
    await cp('website/vendor-generated/website/astro.config.mjs', file);
    await writeFile(path.join(root, 'website/vendor-generated/stale'), 'stale');
    assert.throws(run, /Stale or missing/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

// Candidate contract fixtures intentionally use real Git objects and the same public
// entry points as callers. A successful control precedes every rejection group.
const candidateCopy = ['.all-contributorsrc', 'LICENSE', 'website/package.json', 'website/package-lock.json', 'website/astro.config.mjs', 'website/tsconfig.json', 'website/src', 'website/public/fonts', 'website/public/images'];
const candidatePrune = ['website/public/data', 'website/src/content', 'website/src/pages/learning-hub', 'website/public/images/learning-hub'];
const candidateRequired = ['.all-contributorsrc', 'LICENSE', 'website/package.json', 'website/package-lock.json', 'website/astro.config.mjs', 'website/tsconfig.json', 'website/src/pages/index.astro', 'website/src/lib/site-data.ts', 'website/src/integrations/pagefind-resources.ts', 'website/src/layouts/BaseLayout.astro', 'website/src/components/brand/HomePage.tsx', 'website/src/components/brand/PageShell.tsx'];
const materializerCommand = path.resolve('eng/materialize-candidate.mjs');

async function snapshotCandidateTree(directory, prefix = '') {
  const entries = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) entries.push(...await snapshotCandidateTree(file, relative));
    else entries.push([relative, (await readFile(file)).toString('hex')]);
  }
  return entries;
}

async function candidateFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'materialize-candidate-test-'));
  const repository = path.join(root, 'upstream');
  const output = path.join(root, 'website/vendor-candidate');
  const marker = path.join(root, 'UPSTREAM-EXECUTED');
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' }).trim();
  const put = async (relative, bytes) => {
    const file = path.join(repository, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  };
  for (const file of candidateRequired) await put(file, `fixture: ${file}\n`);
  // These would leave an observable marker if a manifest or config were executed.
  await put('website/package.json', JSON.stringify({ ...pkg, scripts: { preinstall: `node -e 'require("node:fs").writeFileSync(${JSON.stringify(marker)},"executed")'`, build: `node -e 'require("node:fs").writeFileSync(${JSON.stringify(marker)},"executed")'` } }));
  await put('website/package-lock.json', '{"lockfileVersion":3}\n');
  await put('website/astro.config.mjs', `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(marker)}, 'executed');\nthrow new Error('fixture must remain inert');\n`);
  for (const file of ['website/public/fonts/font.woff2', 'website/public/images/brand.png', 'website/public/data/catalog.json', 'website/src/content/resource.md', 'website/src/pages/learning-hub/index.astro', 'website/public/images/learning-hub/lesson.png', 'agents/upstream.agent.md', 'prompts/upstream.prompt.md', 'instructions/upstream.instructions.md', 'skills/upstream/SKILL.md']) await put(file, `excluded-or-asset: ${file}\n`);
  git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.invalid'); git('add', '.'); git('commit', '-qm', 'candidate fixture');
  const settings = { ...config, acceptedSha: git('rev-parse', 'HEAD'), copy: [...candidateCopy], prune: [...candidatePrune], keep: [], requiredPaths: [...candidateRequired] };
  await mkdir(path.join(root, 'website/overlay'), { recursive: true });
  await writeFile(path.join(root, 'website/vendor.config.json'), JSON.stringify({ ...config, acceptedSha: settings.acceptedSha }));
  await writeFile(path.join(root, 'website/upstream-baseline.json'), JSON.stringify({ ref: settings.acceptedSha }));
  await writeFile(path.join(root, 'website/overlay.json'), JSON.stringify(overlay));
  await writeFile(path.join(root, 'website/overlay/local-site-data.ts'), await readFile('website/overlay/local-site-data.ts'));
  await mkdir(path.join(root, 'website/vendor-generated'), { recursive: true });
  await writeFile(path.join(root, 'website/vendor-generated/accepted.txt'), 'accepted output must remain byte-identical\n');
  const writeSettings = value => writeFile(path.join(root, 'website/candidate-materialization.config.json'), JSON.stringify(value));
  await writeSettings(settings);
  const protectedBytes = async () => {
    const files = ['website/vendor.config.json', 'website/upstream-baseline.json', 'website/overlay.json', 'website/overlay/local-site-data.ts'];
    return [...await Promise.all(files.map(async file => [file, (await readFile(path.join(root, file))).toString('hex')])), ...await snapshotCandidateTree(path.join(root, 'website/vendor-generated'), 'website/vendor-generated')];
  };
  return { root, repository, output, marker, settings, git, writeSettings, protectedBytes };
}

async function assertCandidateControl(fixture, result) {
  assert.equal(result.status, 'MATERIALIZED_UNVALIDATED_SITE');
  assert.equal(result.provenance.role, 'candidate');
  assert.equal(result.provenance.upstreamSha, fixture.settings.acceptedSha);
  assert.equal(result.provenance.repository, config.repository);
  assert.deepEqual(result.provenance, JSON.parse(await readFile(path.join(fixture.output, 'provenance.json'), 'utf8')));
  for (const required of candidateRequired) assert.ok((await readFile(path.join(fixture.output, required))).length, required);
  assert.deepEqual(await readFile(path.join(fixture.output, 'website/src/lib/site-data.ts')), await readFile('website/overlay/local-site-data.ts'));
  for (const excluded of ['agents', 'prompts', 'instructions', 'skills', ...candidatePrune]) await assert.rejects(lstat(path.join(fixture.output, excluded)), { code: 'ENOENT' });
  assert.ok(result.provenance.files.every(({ path: file }) => candidateCopy.some(root => file === root || file.startsWith(`${root}/`)) && !candidatePrune.some(root => file === root || file.startsWith(`${root}/`))));
  await assert.rejects(readFile(fixture.marker), { code: 'ENOENT' });
}

test('candidate materializer API generates an inert deterministic bundle and replaces stale candidate state', async () => {
  const { materializeCandidate } = await import('../eng/materialize-candidate.mjs');
  const fixture = await candidateFixture();
  try {
    const before = await fixture.protectedBytes();
    const first = await materializeCandidate({ repository: fixture.repository, localRoot: fixture.root });
    await assertCandidateControl(fixture, first);
    const firstTree = await snapshotCandidateTree(fixture.output);
    await writeFile(path.join(fixture.output, 'stale.txt'), 'replace this stale candidate');
    const second = await materializeCandidate({ repository: fixture.repository, localRoot: fixture.root });
    assert.deepEqual(second, first);
    assert.deepEqual(await snapshotCandidateTree(fixture.output), firstTree);
    assert.deepEqual(await fixture.protectedBytes(), before);
    await assert.rejects(readFile(fixture.marker), { code: 'ENOENT' });
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('candidate materializer API rejects unbound, incomplete and overridden inputs before output mutation', async () => {
  const { materializeCandidate } = await import('../eng/materialize-candidate.mjs');
  const fixture = await candidateFixture();
  try {
    // Without this positive control, a missing module or broken fixture could fake rejection coverage.
    await assertCandidateControl(fixture, await materializeCandidate({ repository: fixture.repository, localRoot: fixture.root }));
    await writeFile(path.join(fixture.output, 'preserve-on-rejection.txt'), 'candidate sentinel');
    const beforeOutput = await snapshotCandidateTree(fixture.output);
    const beforeProtected = await fixture.protectedBytes();
    const unchanged = async () => {
      assert.deepEqual(await snapshotCandidateTree(fixture.output), beforeOutput);
      assert.deepEqual(await fixture.protectedBytes(), beforeProtected);
      await assert.rejects(readFile(fixture.marker), { code: 'ENOENT' });
    };
    for (const [name, changed] of [
      ['repository disagreement', { repository: 'other/unreviewed' }],
      ['ref disagreement', { acceptedSha: 'b'.repeat(40) }],
      ['overlay disagreement', { overlay: 'website/other-overlay.json' }],
      ['root catalog copy', { copy: [...candidateCopy, 'agents'] }],
      ['public catalog copy', { copy: [...candidateCopy, 'website/public/data'] }],
      ['catalog keep', { keep: ['website/public/data/catalog.json'] }],
      ['missing prune', { prune: candidatePrune.slice(1) }],
      ['empty required inputs', { requiredPaths: [] }],
    ]) {
      await fixture.writeSettings({ ...fixture.settings, ...changed });
      await assert.rejects(materializeCandidate({ repository: fixture.repository, localRoot: fixture.root }), undefined, name);
      await unchanged();
    }
    await fixture.writeSettings(fixture.settings);
    for (const options of [{ role: 'accepted' }, { output: path.join(fixture.root, 'website/vendor-generated') }, { ref: 'b'.repeat(40) }, { unexpected: true }]) {
      await assert.rejects(materializeCandidate({ repository: fixture.repository, localRoot: fixture.root, ...options }));
      await unchanged();
    }
    await assert.rejects(materializeCandidate({ localRoot: fixture.root }));
    await unchanged();
    // Match both configs to a real second commit: required-input loss, rather than ref mismatch, must stop publication.
    await rm(path.join(fixture.repository, 'website/src/layouts/BaseLayout.astro'));
    fixture.git('add', '.'); fixture.git('commit', '-qm', 'remove required retained input');
    const missingRef = fixture.git('rev-parse', 'HEAD');
    const acceptedFile = path.join(fixture.root, 'website/vendor.config.json');
    const acceptedBytes = await readFile(acceptedFile);
    await writeFile(acceptedFile, JSON.stringify({ ...config, acceptedSha: missingRef }));
    await fixture.writeSettings({ ...fixture.settings, acceptedSha: missingRef });
    const missingProtected = await fixture.protectedBytes();
    await assert.rejects(materializeCandidate({ repository: fixture.repository, localRoot: fixture.root }));
    assert.deepEqual(await snapshotCandidateTree(fixture.output), beforeOutput);
    assert.deepEqual(await fixture.protectedBytes(), missingProtected);
    await writeFile(acceptedFile, acceptedBytes);
    await unchanged();
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});

test('candidate materializer CLI has a working positive control and rejects overrides with sanitized errors', async () => {
  const fixture = await candidateFixture();
  try {
    const env = { ...process.env, UPSTREAM_REPO_DIR: fixture.repository };
    delete env.UPSTREAM_HEAD;
    const run = (args = [], overrides = {}) => execFileSync(process.execPath, [materializerCommand, ...args], { cwd: fixture.root, env: { ...env, ...overrides }, encoding: 'utf8', stdio: 'pipe' });
    const beforeProtected = await fixture.protectedBytes();
    const stdout = run();
    assert.equal(stdout.trim().split('\n').length, 1, 'CLI prints one JSON result');
    await assertCandidateControl(fixture, JSON.parse(stdout));
    const beforeOutput = await snapshotCandidateTree(fixture.output);
    for (const [args, overrides] of [
      [['--role=accepted'], {}],
      [['--output=PRIVATE-MATERIALIZER-CANARY'], {}],
      [[], { UPSTREAM_HEAD: fixture.settings.acceptedSha }],
      [[], { UPSTREAM_REPO_DIR: '' }],
      [[], { UPSTREAM_REPO_DIR: path.join(fixture.root, 'PRIVATE-MATERIALIZER-CANARY') }],
    ]) {
      assert.throws(() => run(args, overrides), error => {
        assert.ok(Number.isInteger(error.status) && error.status !== 0);
        const diagnostic = `${error.stdout || ''}${error.stderr || ''}`;
        assert.ok(diagnostic.trim().length > 0 && diagnostic.length <= 1024, 'bounded generic diagnostic');
        assert.doesNotMatch(diagnostic, /PRIVATE-MATERIALIZER-CANARY|node:internal|\n\s+at\s/);
        return true;
      });
      assert.deepEqual(await snapshotCandidateTree(fixture.output), beforeOutput);
      assert.deepEqual(await fixture.protectedBytes(), beforeProtected);
      await assert.rejects(readFile(fixture.marker), { code: 'ENOENT' });
    }
  } finally { await rm(fixture.root, { recursive: true, force: true }); }
});
