import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { lstat, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const command = path.resolve('eng/project-local-catalog.mjs');
const repository = 'https://github.com/jnicholas000/basic-plugin';
const shapeRef = '6c4d33b9cfca967a28bb2962ef4d55e4a384c88c';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const agentPath = 'com.github.copilot/agents/Alpha.agent.md';
const skillPath = 'skills/zeta-tool/SKILL.md';
const manifest = { $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', name: 'basic-plugin', version: '1.2.3', description: 'Fixture local plugin', repository, homepage: repository, keywords: ['local', 'fixture'] };
const indexFor = (value = manifest) => ({ schemaVersion: 1, generatedAt: '2021-02-03T04:05:06.000Z', plugins: [{ name: value.name, version: value.version, description: value.description, repository: value.repository, homepage: value.homepage, source: 'local', capabilities: { agents: 3, skills: 2, prompts: 0, instructions: 0 } }] });

async function snapshot(root, prefix = '') {
  const rows = [];
  for (const entry of (await readdir(root, { withFileTypes: true })).filter(e => e.name !== '.git').sort((a, b) => ascii(a.name, b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) rows.push(...await snapshot(file, relative));
    else if (entry.isSymbolicLink()) rows.push([relative, 'symlink']);
    else rows.push([relative, (await readFile(file)).toString('hex')]);
  }
  return rows;
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'local-catalog-projection-test-'));
  const marker = path.join(root, 'EXECUTED-ASSET');
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const put = async (relative, bytes) => {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), bytes);
  };
  const files = new Map([
    ['plugin.json', `${JSON.stringify(manifest)}\n`],
    ['marketplace/index.json', `${JSON.stringify(indexFor())}\n`],
    ['README.md', '# Fixture README\nLocal body only.\n'],
    [agentPath, '---\nname: Alpha Agent\ndescription: Plain description\n---\nAn inert agent body.\n'],
    ['com.github.copilot/agents/Beta.agent.md', `---\nname: Beta Agent\ndescription: ${JSON.stringify('A "quoted" description')}\nmodel: ["model-z", "model-a"]\ntools: ["Read"]\n---\nBeta body.\n`],
    ['com.github.copilot/agents/Zeta.agent.md', '---\nname: "Zeta Agent"\ndescription: \'It\'\'s useful\'\nmodel: model-z\ntools: ["Shell", "Read"]\nother: inert-value\n---\nZeta body.\n'],
    ['skills/alpha-guide/SKILL.md', '---\nname: alpha-guide\ndescription: An alpha guide\n---\nInert guide.\n'],
    [skillPath, `---\nname: zeta-tool\ndescription: ${JSON.stringify('Zeta "quoted" tool')}\n---\nInert skill instructions; do not execute.\n`],
    ['skills/zeta-tool/reference.md', 'An inert reference.\n'],
    ['skills/zeta-tool/scripts/marker.cjs', `require("node:fs").writeFileSync(${JSON.stringify(marker)}, "executed");\n`],
    ['skills/zeta-tool/bin/ignored.dat', 'excluded from assets, retained in files\n'],
    ['skills/zeta-tool/obj/ignored.dat', 'excluded from assets, retained in files\n'],
  ]);
  for (const [relative, bytes] of files) await put(relative, bytes);
  for (const relative of ['website/vendor.config.json', 'website/overlay.json', 'website/overlay/local-site-data.ts', 'website/vendor-generated/accepted.txt', '.github/workflows/protected.yml']) await put(relative, `protected fixture: ${relative}\n`);
  git('init', '-q'); git('config', 'user.name', 'Fixture'); git('config', 'user.email', 'fixture@example.invalid'); git('add', '.');
  git('update-index', '--chmod=+x', 'skills/zeta-tool/scripts/marker.cjs');
  const commit = message => {
    execFileSync('git', ['-C', root, 'commit', '-qm', message], { env: { ...process.env, GIT_AUTHOR_DATE: '2021-02-03T04:05:06+00:00', GIT_COMMITTER_DATE: '2021-02-03T04:05:06+00:00' }, stdio: 'pipe' });
    return git('rev-parse', 'HEAD');
  };
  const head = commit('projection fixture');
  return { root, marker, files, git, put, head, commit };
}

function assertResult(result, f) {
  assert.equal(typeof result?.then, 'undefined', 'API is synchronous');
  assert.deepEqual(Object.keys(result).sort(), ['contentDigest', 'counts', 'files', 'inputs', 'observationLimits', 'schemaVersion', 'source', 'status'].sort());
  assert.equal(result.status, 'LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE');
  assert.equal(result.schemaVersion, 1);
  assert.deepEqual(result.source, { repository: 'jnicholas000/basic-plugin', commit: f.head, upstreamShapeRef: shapeRef });
  assert.deepEqual(result.observationLimits, { contributorsTotal: null, installActions: 'UNVERIFIED', integration: 'NOT_ACTIVATED' });
  assert.deepEqual(result.counts, { agents: 3, skills: 2, plugins: 1, instructions: 0, extensions: 0 });
  assert.deepEqual(Object.keys(result.files).sort(), ['agents.json', 'extensions.json', 'instructions.json', 'plugins.json', 'search-index.json', 'skills.json']);
  const agents = result.files['agents.json'];
  const skills = result.files['skills.json'];
  const plugins = result.files['plugins.json'];
  assert.equal(agents.items.length, 3);
  assert.equal(skills.items.length, 2);
  assert.equal(plugins.items.length, 1);
  assert.deepEqual(result.files['instructions.json'], { items: [], filters: { patterns: [], extensions: [] } });
  assert.deepEqual(result.files['extensions.json'], { items: [] });
  const date = relative => f.git('log', '-1', '--format=%cI', f.head, '--', relative);
  assert.deepEqual(agents.items.map(a => a.id), ['Alpha', 'Beta', 'Zeta']);
  for (const a of agents.items) {
    assert.equal(a.path, `com.github.copilot/agents/${a.id}.agent.md`);
    assert.equal(a.filename, `${a.id}.agent.md`);
    assert.equal(a.title, `${a.id} Agent`);
    assert.equal(a.lastUpdated, date(a.path));
    assert.ok(!Number.isNaN(Date.parse(a.lastUpdated)));
  }
  assert.equal(agents.items[0].description, 'Plain description');
  assert.deepEqual(agents.items[0].tools, []);
  assert.equal(agents.items[1].description, 'A "quoted" description');
  assert.deepEqual(agents.items[1].model, ['model-z', 'model-a']);
  assert.deepEqual(agents.items[1].tools, ['Read']);
  assert.equal(agents.items[2].description, "It's useful");
  assert.equal(agents.items[2].model, 'model-z');
  assert.deepEqual(agents.items[2].tools, ['Shell', 'Read']);
  assert.deepEqual(agents.filters, { models: ['model-a', 'model-z'], tools: ['Read', 'Shell'] });
  assert.deepEqual(skills.items.map(s => s.id), ['alpha-guide', 'zeta-tool']);
  for (const s of skills.items) {
    assert.equal(s.name, s.id);
    assert.equal(s.title, s.id === 'alpha-guide' ? 'Alpha Guide' : 'Zeta Tool');
    assert.equal(s.description, s.id === 'alpha-guide' ? 'An alpha guide' : 'Zeta "quoted" tool');
    assert.equal(s.path, `skills/${s.id}`);
    assert.equal(s.skillFile, `${s.path}/SKILL.md`);
    assert.equal(s.lastUpdated, date(s.skillFile));
    const expectedFiles = [...f.files].filter(([p]) => p.startsWith(`${s.path}/`)).sort(([a], [b]) => ascii(a, b)).map(([p, bytes]) => ({ path: p, name: p.slice(s.path.length + 1), size: Buffer.byteLength(bytes) }));
    assert.deepEqual(s.files, expectedFiles);
    assert.equal(s.hasAssets, s.id === 'zeta-tool');
    assert.equal(s.assetCount, s.id === 'zeta-tool' ? 2 : 0);
    assert.equal(s.assets.length, s.assetCount);
    // The frozen contract specifies skill-relative assets but does not fix their container shape.
    const assetNames = s.assets.map(asset => typeof asset === 'string' ? asset : asset.name).sort(ascii);
    assert.deepEqual(assetNames, s.id === 'zeta-tool' ? ['reference.md', 'scripts/marker.cjs'] : []);
  }
  const p = plugins.items[0];
  for (const [key, value] of Object.entries({ id: 'basic-plugin', name: 'basic-plugin', description: manifest.description, path: '.', version: manifest.version, readmeFile: 'README.md', repository, homepage: repository, author: null, license: null, external: false, lastUpdated: date('plugin.json'), itemCount: 5 })) assert.deepEqual(p[key], value, key);
  assert.deepEqual(p.tags, manifest.keywords);
  assert.equal(p.items.length, 5);
  for (const item of p.items) {
    const records = item.kind === 'agent' ? agents.items : item.kind === 'skill' ? skills.items : [];
    const target = records.find(record => record.path === item.path);
    assert.ok(target, `plugin item must identify a projected resource: ${item.path}`);
    assert.equal(item.title, target.title);
    assert.equal(typeof item.detailUrl, 'string');
    assert.ok(item.detailUrl.startsWith('/') && item.detailUrl.includes(target.id));
  }
  assert.equal(new Set(p.items.map(i => `${i.kind}:${i.path}`)).size, 5);
  const search = result.files['search-index.json'];
  assert.ok(Array.isArray(search), 'search payload is the generated record array');
  const expectedSearch = [...agents.items.map(a => ({ type: 'agent', ...a })), ...skills.items.map(s => ({ type: 'skill', ...s, path: s.skillFile })), { type: 'plugin', ...p }];
  assert.equal(search.length, expectedSearch.length);
  for (const expected of expectedSearch) {
    const record = search.find(r => r.type === expected.type && r.id === expected.id);
    assert.ok(record, `${expected.type}:${expected.id}`);
    for (const field of ['title', 'description', 'path']) assert.equal(record[field], expected[field] ?? (field === 'title' ? expected.name : undefined));
  }
  assert.equal(new Set(search.map(r => `${r.type}:${r.id}`)).size, 6);
  const expectedInputs = [...f.files].sort(([a], [b]) => ascii(a, b)).map(([p, bytes]) => ({ path: p, mode: p.endsWith('/marker.cjs') ? '100755' : '100644', size: Buffer.byteLength(bytes), sha256: sha256(Buffer.from(bytes)) }));
  assert.deepEqual(result.inputs, expectedInputs);
  const { contentDigest, ...payload } = result;
  assert.equal(contentDigest, sha256(JSON.stringify(payload)));
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.ok(!JSON.stringify(result).includes(f.root), 'output contains no absolute checkout root');
}

test('local projection covers all consumed fields, committed hashes/dates and deterministic API/CLI output without writes', async () => {
  const { projectLocalCatalog } = await import('../eng/project-local-catalog.mjs');
  const f = await fixture();
  try {
    const before = await snapshot(f.root);
    const first = projectLocalCatalog({ root: f.root });
    assertResult(first, f);
    assert.deepEqual(projectLocalCatalog({ root: f.root }), first);
    const cli = spawnSync(process.execPath, [command], { cwd: f.root, encoding: 'utf8' });
    assert.equal(cli.status, 0, cli.stderr);
    assert.equal(cli.stderr, '');
    assert.equal(cli.stdout, `${JSON.stringify(first)}\n`);
    assert.deepEqual(await snapshot(f.root), before);
    await assert.rejects(lstat(f.marker), { code: 'ENOENT' });
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('local projection explicitly reads committed HEAD while ignoring dirty edits and untracked resources', async () => {
  const { projectLocalCatalog } = await import('../eng/project-local-catalog.mjs');
  const f = await fixture();
  try {
    const first = projectLocalCatalog({ root: f.root });
    assertResult(first, f); // Positive control precedes dirty/untracked assertions.
    await f.put('plugin.json', 'malformed working-tree bytes');
    await f.put(agentPath, 'not frontmatter');
    await f.put('skills/untracked/SKILL.md', 'not a committed resource');
    await f.put('prompts/untracked.prompt.md', 'untracked unsupported inventory');
    const dirty = await snapshot(f.root);
    assert.deepEqual(projectLocalCatalog({ root: f.root }), first);
    assert.deepEqual(await snapshot(f.root), dirty);
    f.git('reset', '--hard', f.head);
    await f.put('README.md', '# Committed revision\n');
    f.git('add', 'README.md');
    const nextHead = f.commit('change consumed README');
    const next = projectLocalCatalog({ root: f.root });
    assert.equal(next.source.commit, nextHead);
    assert.notEqual(next.contentDigest, first.contentDigest);
    assert.equal(next.inputs.find(input => input.path === 'README.md').sha256, sha256('# Committed revision\n'));
    assert.deepEqual(projectLocalCatalog({ root: f.root }), next);
    await assert.rejects(lstat(f.marker), { code: 'ENOENT' });
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('local projection rejects invalid committed inventory and options only after a working positive control', async () => {
  const { projectLocalCatalog } = await import('../eng/project-local-catalog.mjs');
  const f = await fixture();
  try {
    assertResult(projectLocalCatalog({ root: f.root }), f);
    const baseline = await snapshot(f.root);
    for (const option of [{ output: 'PRIVATE-PROJECTION-CANARY' }, { ref: f.head }, { repository: f.root }, { role: 'accepted' }, { unknown: true }]) assert.throws(() => projectLocalCatalog({ root: f.root, ...option }));
    assert.deepEqual(await snapshot(f.root), baseline);
    const changeManifest = async edits => f.put('plugin.json', JSON.stringify({ ...manifest, ...edits }));
    const changeRow = async edits => f.put('marketplace/index.json', JSON.stringify({ ...indexFor(), plugins: [{ ...indexFor().plugins[0], ...edits }] }));
    const cases = [
      ['manifest schema', () => changeManifest({ $schema: 'unrecognized-schema' })],
      ['index schema', () => f.put('marketplace/index.json', JSON.stringify({ ...indexFor(), schemaVersion: 2 }))],
      ['foreign source', () => changeRow({ source: 'foreign' })],
      ['foreign repository', () => changeManifest({ repository: 'https://example.invalid/foreign' })],
      ['mismatched metadata', () => changeRow({ description: 'different description' })],
      ['additional plugin row', () => f.put('marketplace/index.json', JSON.stringify({ ...indexFor(), plugins: [...indexFor().plugins, indexFor().plugins[0]] }))],
      ['agent count', () => changeRow({ capabilities: { ...indexFor().plugins[0].capabilities, agents: 2 } })],
      ['fractional count', () => changeRow({ capabilities: { ...indexFor().plugins[0].capabilities, agents: 3.5 } })],
      ['unknown capability', () => changeRow({ capabilities: { ...indexFor().plugins[0].capabilities, surprise: 0 } })],
      ['unsupported declared prompt', () => changeRow({ capabilities: { ...indexFor().plugins[0].capabilities, prompts: 1 } })],
      ...['prompts', 'instructions', 'extensions'].map(root => [`unsupported root ${root}`, () => f.put(`${root}/resource.md`, 'unsupported tracked data')]),
      ['nested agent', () => f.put('com.github.copilot/agents/nested/extra.agent.md', f.files.get(agentPath))],
      ['missing manifest', () => rm(path.join(f.root, 'plugin.json'))],
      ['missing index', () => rm(path.join(f.root, 'marketplace/index.json'))],
      ['missing README', () => rm(path.join(f.root, 'README.md'))],
      ['missing skill metadata', () => rm(path.join(f.root, skillPath))],
      ['wrong skill name', () => f.put(skillPath, '---\nname: different-name\ndescription: Description\n---\n')],
      ['missing agent description', () => f.put(agentPath, '---\nname: Alpha Agent\n---\n')],
      ['duplicate header', () => f.put(agentPath, '---\nname: Alpha\nname: Other\ndescription: Description\n---\n')],
      ['block header', () => f.put(agentPath, '---\nname: Alpha\ndescription: |\n  Multiline\n---\n')],
      ['anchor header', () => f.put(agentPath, '---\nname: &anchor Alpha\ndescription: Description\n---\n')],
      ['tag header', () => f.put(agentPath, '---\nname: !!str Alpha\ndescription: Description\n---\n')],
      ['nested header', () => f.put(agentPath, '---\nname: Alpha\ndescription: Description\nextra:\n  nested: value\n---\n')],
      ['wrong tools type', () => f.put(agentPath, '---\nname: Alpha\ndescription: Description\ntools: Read\n---\n')],
      ['wrong model type', () => f.put(agentPath, '---\nname: Alpha\ndescription: Description\nmodel: 42\n---\n')],
      ['unterminated header', () => f.put(agentPath, '---\nname: Alpha\ndescription: Description\n')],
      ['unsafe Git path', () => f.put('skills/zeta-tool/unsafe\\name.md', 'unsafe path')],
      ['consumed submodule', async () => {}, () => f.git('update-index', '--add', '--cacheinfo', '160000', f.head, 'skills/zeta-tool/linked')],
      ['consumed symlink', async () => { await rm(path.join(f.root, agentPath)); await symlink('PRIVATE-PROJECTION-CANARY', path.join(f.root, agentPath)); }],
      ['empty inventory', async () => { await rm(path.join(f.root, 'com.github.copilot'), { recursive: true }); await rm(path.join(f.root, 'skills'), { recursive: true }); await changeRow({ capabilities: { agents: 0, skills: 0, prompts: 0, instructions: 0 } }); }],
    ];
    for (const [name, mutate, stage] of cases) {
      f.git('reset', '--hard', f.head);
      f.git('clean', '-fdq');
      await mutate();
      f.git('add', '-A');
      if (stage) stage();
      f.commit(name);
      const before = await snapshot(f.root);
      assert.throws(() => projectLocalCatalog({ root: f.root }), undefined, name);
      const cli = spawnSync(process.execPath, [command], { cwd: f.root, encoding: 'utf8' });
      assert.equal(cli.status, 1, name);
      assert.equal(cli.stdout, '', name);
      assert.equal(cli.stderr, 'Local catalog projection failed.\n', name);
      assert.deepEqual(await snapshot(f.root), before, name);
      await assert.rejects(lstat(f.marker), { code: 'ENOENT' });
    }
    f.git('reset', '--hard', f.head); f.git('clean', '-fdq');
    assertResult(projectLocalCatalog({ root: f.root }), f);
    const cli = spawnSync(process.execPath, [command, '--root=PRIVATE-PROJECTION-CANARY'], { cwd: f.root, encoding: 'utf8' });
    assert.equal(cli.status, 1);
    assert.equal(cli.stdout, '');
    assert.equal(cli.stderr, 'Local catalog projection failed.\n');
    assert.deepEqual(await snapshot(f.root), baseline);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('local projection preserves null/object authors and normalizes committed string authors for the pinned consumer', async () => {
  const { projectLocalCatalog } = await import('../eng/project-local-catalog.mjs');
  const f = await fixture();
  try {
    assertResult(projectLocalCatalog({ root: f.root }), f); // Absent author remains null.
    for (const [author, expected] of [
      [{ name: 'Local Author', url: 'https://example.invalid/local-author' }, { name: 'Local Author', url: 'https://example.invalid/local-author' }],
      ['Local Author', { name: 'Local Author' }],
    ]) {
      const bytes = `${JSON.stringify({ ...manifest, author })}\n`;
      await f.put('plugin.json', bytes);
      f.git('add', 'plugin.json');
      const head = f.commit('committed author metadata control');
      const before = await snapshot(f.root);
      const result = projectLocalCatalog({ root: f.root });
      assert.equal(result.status, 'LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE');
      assert.equal(result.source.commit, head);
      assert.equal(result.inputs.find(input => input.path === 'plugin.json').sha256, sha256(bytes));
      assert.deepEqual(await snapshot(f.root), before);
      await assert.rejects(lstat(f.marker), { code: 'ENOENT' });
      assert.deepEqual(result.files['plugins.json'].items[0].author, expected);
    }
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('local projection rejects shallow history that would misdate unchanged resources at the same HEAD', async () => {
  const { projectLocalCatalog } = await import('../eng/project-local-catalog.mjs');
  const { pathToFileURL } = await import('node:url');
  const f = await fixture();
  const clones = await mkdtemp(path.join(tmpdir(), 'local-catalog-history-test-'));
  try {
    const readme = '# Later README-only commit\n';
    await f.put('README.md', readme);
    f.files.set('README.md', readme);
    f.git('add', 'README.md');
    execFileSync('git', ['-C', f.root, 'commit', '-qm', 'later README only'], { env: { ...process.env, GIT_AUTHOR_DATE: '2024-06-07T08:09:10+00:00', GIT_COMMITTER_DATE: '2024-06-07T08:09:10+00:00' }, stdio: 'pipe' });
    f.head = f.git('rev-parse', 'HEAD');
    const resourceDate = f.git('log', '-1', '--format=%cI', f.head, '--', agentPath);
    const laterDate = f.git('log', '-1', '--format=%cI', f.head, '--', 'README.md');
    assert.notEqual(resourceDate, laterDate, 'fixture must distinguish true resource change from clone boundary');
    const full = path.join(clones, 'full');
    const shallow = path.join(clones, 'shallow');
    const url = pathToFileURL(f.root).href;
    // Owned temporary file transport only; no transport-policy overrides or remote network.
    execFileSync('git', ['clone', '--quiet', url, full], { stdio: 'pipe' });
    const gitAt = (root, ...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: 'pipe' }).trim();
    assert.equal(gitAt(full, 'rev-parse', '--is-shallow-repository'), 'false');
    assert.equal(gitAt(full, 'rev-parse', 'HEAD'), f.head);
    const fullBefore = await snapshot(full);
    const fullResult = projectLocalCatalog({ root: full });
    assertResult(fullResult, { ...f, root: full, git: (...args) => gitAt(full, ...args) });
    assert.equal(fullResult.files['agents.json'].items[0].lastUpdated, resourceDate);
    assert.deepEqual(await snapshot(full), fullBefore);
    execFileSync('git', ['clone', '--quiet', '--depth=1', url, shallow], { stdio: 'pipe' });
    assert.equal(gitAt(shallow, 'rev-parse', '--is-shallow-repository'), 'true');
    assert.equal(gitAt(shallow, 'rev-parse', 'HEAD'), fullResult.source.commit);
    assert.equal(gitAt(shallow, 'log', '-1', '--format=%cI', f.head, '--', agentPath), laterDate, 'ordinary shallow log demonstrates the false boundary date');
    const sourceBefore = await snapshot(f.root);
    const shallowBefore = await snapshot(shallow);
    let apiResult;
    let apiError;
    try { apiResult = projectLocalCatalog({ root: shallow }); } catch (error) { apiError = error; }
    const cli = spawnSync(process.execPath, [command], { cwd: shallow, encoding: 'utf8' });
    assert.deepEqual(await snapshot(f.root), sourceBefore);
    assert.deepEqual(await snapshot(full), fullBefore);
    assert.deepEqual(await snapshot(shallow), shallowBefore);
    for (const marker of [f.marker, path.join(full, 'EXECUTED-ASSET'), path.join(shallow, 'EXECUTED-ASSET')]) await assert.rejects(lstat(marker), { code: 'ENOENT' });
    assert.deepEqual({
      apiRejected: apiError instanceof Error,
      apiAgentDate: apiResult?.files?.['agents.json']?.items?.[0]?.lastUpdated ?? null,
      cliStatus: cli.status,
      cliStdoutEmpty: cli.stdout === '',
      cliStderr: cli.stderr,
    }, {
      apiRejected: true,
      apiAgentDate: null,
      cliStatus: 1,
      cliStdoutEmpty: true,
      cliStderr: 'Local catalog projection failed.\n',
    });
  } finally {
    await rm(clones, { recursive: true, force: true });
    await rm(f.root, { recursive: true, force: true });
  }
});
