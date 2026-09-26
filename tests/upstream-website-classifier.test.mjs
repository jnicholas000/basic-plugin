import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyWebsiteChange } from '../eng/upstream-website-classifier.mjs';

const packageWith = (dependencies) => ({ dependencies });

test('small website edits remain routine', () => {
  const result = classifyWebsiteChange({
    files: [
      { status: 'M', path: 'website/src/components/Card.tsx' },
      { status: 'M', path: 'website/src/styles/card.css' },
      { status: 'M', path: 'website/src/pages/index.astro' },
    ],
    basePackage: packageWith({ astro: '^7.1.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'routine');
});

test('broad non-architectural changes require review', () => {
  const files = Array.from({ length: 30 }, (_, index) => ({
    status: 'M',
    path: `website/src/components/Component${index}.tsx`,
  }));

  const result = classifyWebsiteChange({
    files,
    basePackage: packageWith({ astro: '^7.1.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'review');
});

test('adding Starlight is classified as an architecture migration', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'M', path: 'website/package.json' }],
    basePackage: packageWith({ astro: '^5.0.0' }),
    headPackage: packageWith({ astro: '^5.0.0', '@astrojs/starlight': '^0.32.0' }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /starlight/);
});

test('replacing Starlight with React and Primer Brand is an architecture migration', () => {
  const result = classifyWebsiteChange({
    files: [
      ...Array.from({ length: 114 }, (_, index) => ({ status: 'A', path: `website/new/${index}.tsx` })),
      ...Array.from({ length: 46 }, (_, index) => ({ status: 'D', path: `website/old/${index}.astro` })),
      ...Array.from({ length: 26 }, (_, index) => ({ status: 'M', path: `website/shared/${index}.ts` })),
    ],
    basePackage: packageWith({ astro: '^7.1.0', '@astrojs/starlight': '^0.35.0' }),
    headPackage: packageWith({
      astro: '^7.3.0',
      '@astrojs/react': '^4.3.0',
      '@primer/react-brand': '^0.56.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /starlight/);
  assert.match(result.architectureSignals.join('\n'), /react/);
});

test('framework major version changes stop automatic synchronization', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'M', path: 'website/package.json' }],
    basePackage: packageWith({ astro: '^6.10.0' }),
    headPackage: packageWith({ astro: '^7.0.0' }),
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /astro 6 -> 7/);
});

test('removing a critical website root file stops automatic synchronization', () => {
  const result = classifyWebsiteChange({
    files: [{ status: 'D', path: 'website/astro.config.mjs' }],
    basePackage: packageWith({ astro: '^7.3.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
  });

  assert.equal(result.classification, 'architecture');
});


test('removing a mapped structural source stops automatic synchronization', () => {
  const source = 'website/src/components/brand/HomePage.tsx';
  const result = classifyWebsiteChange({
    files: [{ status: 'D', path: source }],
    basePackage: packageWith({ astro: '^7.3.0' }),
    headPackage: packageWith({ astro: '^7.3.0' }),
    criticalPaths: [source],
  });

  assert.equal(result.classification, 'architecture');
  assert.match(result.architectureSignals.join('\n'), /HomePage\.tsx/);
});

// Exercise the actual Git-to-classifier boundary, not only pre-normalized file lists.


const classifierCli = fileURLToPath(new URL('../eng/classify-upstream-website-change.mjs', import.meta.url));

function fixture(t, files = {}) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'upstream-website-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const repository = path.join(directory, 'repo');
  mkdirSync(repository);
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8' });
  git('init', '--quiet');
  git('config', 'user.name', 'Classifier Test');
  git('config', 'user.email', 'classifier@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'diff.renames', 'copies');
  const write = (name, content) => {
    const destination = path.join(repository, name);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  };
  for (const [name, content] of Object.entries({
    'website/package.json': '{"dependencies":{}}\n',
    ...files,
  })) write(name, content);
  const commit = () => {
    git('add', '--all');
    git('commit', '--quiet', '-m', 'fixture');
    return git('rev-parse', 'HEAD').trim();
  };
  const base = commit();
  const move = (source, destination) => {
    mkdirSync(path.dirname(path.join(repository, destination)), { recursive: true });
    renameSync(path.join(repository, source), path.join(repository, destination));
  };
  const run = (head = commit()) => {
    const output = path.join(directory, 'output');
    const report = path.join(directory, 'report.md');
    const summary = path.join(directory, 'summary.md');
    writeFileSync(output, 'existing_output=preserved\n');
    writeFileSync(summary, 'Existing summary\n');
    execFileSync(process.execPath, [classifierCli], {
      encoding: 'utf8',
      env: {
        ...process.env,
        UPSTREAM_REPO_DIR: repository,
        UPSTREAM_BASE: base,
        UPSTREAM_HEAD: head,
        UPSTREAM_REPORT: report,
        GITHUB_OUTPUT: output,
        GITHUB_STEP_SUMMARY: summary,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const markdown = readFileSync(report, 'utf8');
    const values = Object.fromEntries(readFileSync(output, 'utf8').trim().split('\n').map((line) => line.split('=')));
    assert.equal(values.existing_output, 'preserved');
    assert.equal(readFileSync(summary, 'utf8'), `Existing summary\n${markdown}`);
    return { values, markdown };
  };
  return { repository, base, git, write, move, run };
}

for (const source of ['website/astro.config.mjs', 'website/package.json']) {
  test(`CLI treats renaming ${source} within website as architecture`, (t) => {
    const f = fixture(t, source.endsWith('.mjs') ? { [source]: 'export default {};\n' } : {});
    f.move(source, `website/renamed-${path.basename(source)}`);
    f.git('add', '--all');
    assert.match(f.git('diff', '--cached', '--name-status', '-M'), /^R100\t/m);
    const { values, markdown } = f.run();
    assert.equal(values.classification, 'architecture');
    assert.equal(values.added_files, '1');
    assert.equal(values.removed_files, '1');
    assert.equal(values.modified_files, '0');
    assert.ok(markdown.includes(`critical website path removed: ${source}`));
  });
}

test('CLI treats moving critical config outside website as architecture', (t) => {
  const f = fixture(t, { 'website/astro.config.mjs': 'export default {};\n' });
  f.move('website/astro.config.mjs', 'config/astro.config.mjs');
  const { values, markdown } = f.run();
  assert.equal(values.classification, 'architecture');
  assert.equal(values.removed_files, '1');
  assert.equal(values.added_files, '0');
  assert.match(markdown, /critical website path removed: website\/astro.config.mjs/);
});


test('CLI treats renaming a baseline-mapped structural source as architecture', (t) => {
  const source = 'website/src/components/brand/HomePage.tsx';
  const f = fixture(t, { [source]: 'export function HomePage() {}\n' });
  f.move(source, 'website/src/components/brand/MarketplaceHome.tsx');
  f.git('add', '--all');
  assert.match(f.git('diff', '--cached', '--name-status', '-M'), /^R100\t/m);

  const { values, markdown } = f.run();
  assert.equal(values.classification, 'architecture');
  assert.equal(values.added_files, '1');
  assert.equal(values.removed_files, '1');
  assert.match(markdown, /critical website path removed: website\/src\/components\/brand\/HomePage\.tsx/);
});

test('CLI counts ordinary renames as an addition and deletion without escalating a small move', (t) => {
  const f = fixture(t, { 'website/old.md': 'ordinary content\n' });
  f.move('website/old.md', 'website/new.md');
  const { values } = f.run();
  assert.equal(values.classification, 'routine');
  assert.equal(values.changed_files, '2');
  assert.equal(values.added_files, '1');
  assert.equal(values.removed_files, '1');
  assert.equal(values.line_additions, '1');
  assert.equal(values.line_deletions, '1');
});

test('CLI does not treat a copied critical config as removal of the original', (t) => {
  const f = fixture(t, { 'website/astro.config.mjs': 'export default {};\n' });
  copyFileSync(path.join(f.repository, 'website/astro.config.mjs'), path.join(f.repository, 'website/config-copy.mjs'));
  const { values } = f.run();
  assert.equal(values.classification, 'routine');
  assert.equal(values.added_files, '1');
  assert.equal(values.removed_files, '0');
});

test('CLI detects structural replacement even when Git can recognize all files as renames', (t) => {
  const files = Object.fromEntries(Array.from({ length: 20 }, (_, index) => [`website/old/${index}.md`, `unique content ${index}\n`]));
  const f = fixture(t, files);
  for (let index = 0; index < 20; index += 1) f.move(`website/old/${index}.md`, `website/new/${index}.md`);
  f.git('add', '--all');
  assert.equal((f.git('diff', '--cached', '--name-status', '-M').match(/^R100\t/gm) ?? []).length, 20);
  const { values, markdown } = f.run();
  assert.equal(values.classification, 'architecture');
  assert.equal(values.added_files, '20');
  assert.equal(values.removed_files, '20');
  assert.equal(values.modified_files, '0');
  assert.match(markdown, /structural replacement detected: 20 files added and 20 removed/);
});

test('CLI preserves tab, newline, and Unicode characters in Git paths', (t) => {
  const name = 'website/src/tab\tline\n\u00e9.md';
  const f = fixture(t, { [name]: 'first\n' });
  f.write(name, 'first\nsecond\n');
  const { values } = f.run();
  assert.equal(values.classification, 'routine');
  assert.equal(values.changed_files, '1');
  assert.equal(values.modified_files, '1');
  assert.equal(values.line_additions, '1');
  assert.equal(values.line_deletions, '0');
});

test('CLI emits zero counts for unchanged refs', (t) => {
  const f = fixture(t);
  const { values } = f.run(f.base);
  assert.equal(values.classification, 'routine');
  assert.equal(values.website_changed, 'false');
  for (const key of ['changed_files', 'added_files', 'removed_files', 'modified_files', 'line_additions', 'line_deletions']) {
    assert.equal(values[key], '0');
  }
});

test('CLI still requires review for an in-place config edit', (t) => {
  const f = fixture(t, { 'website/astro.config.mjs': 'export default {};\n' });
  f.write('website/astro.config.mjs', 'export default { site: "https://example.invalid" };\n');
  const { values } = f.run();
  assert.equal(values.classification, 'review');
  assert.equal(values.modified_files, '1');
});
