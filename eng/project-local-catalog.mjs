import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, safePath } from './vendor-upstream.mjs';

const repository = 'https://github.com/jnicholas000/basic-plugin';
const upstreamShapeRef = '6c4d33b9cfca967a28bb2962ef4d55e4a384c88c';
const agentRoot = 'com.github.copilot/agents/';
const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const reject = () => { throw new Error('Invalid local catalog input'); };
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = value => typeof value === 'string' && value.trim().length > 0;
const isStrings = value => Array.isArray(value) && value.every(isString);

// Deliberately a flat string/inline string-array subset, not a YAML interpreter.
function parseString(value) {
  if (!value) reject();
  let parsed;
  if (value.startsWith('"')) {
    parsed = JSON.parse(value);
  } else if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(value)) reject();
    parsed = value.slice(1, -1).replaceAll("''", "'");
  } else {
    if (/^[\[\]{}&*!|>@`#?,%]|^-(?:\s|$)|:\s|\s#/.test(value) || /^(?:true|false|null|~|[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?)$/i.test(value)) reject();
    parsed = value;
  }
  if (!isString(parsed)) reject();
  return parsed;
}

function parseValue(value) {
  if (!value.startsWith('[')) return parseString(value);
  if (!value.endsWith(']')) reject();
  const body = value.slice(1, -1).trim();
  if (!body) return [];
  const values = [];
  let start = 0;
  let quote = null;
  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (quote === '"' && char === '\\') { index++; continue; }
    if (quote === "'" && char === "'" && body[index + 1] === "'") { index++; continue; }
    if (quote && char === quote) quote = null;
    else if (!quote && (char === '"' || char === "'")) quote = char;
    else if (!quote && char === ',') {
      values.push(parseString(body.slice(start, index).trim()));
      start = index + 1;
    }
  }
  if (quote) reject();
  values.push(parseString(body.slice(start).trim()));
  return values;
}

function parseHeader(bytes) {
  const lines = bytes.toString('utf8').split(/\r?\n/);
  if (lines[0] !== '---') reject();
  const end = lines.indexOf('---', 1);
  if (end < 0) reject();
  const fields = Object.create(null);
  for (const line of lines.slice(1, end)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):[ \t]+(.+)$/.exec(line);
    if (!match || Object.hasOwn(fields, match[1])) reject();
    fields[match[1]] = parseValue(match[2].trim());
  }
  if (!isString(fields.name) || !isString(fields.description)) reject();
  return fields;
}

export function projectLocalCatalog(options = {}) {
  if (!isObject(options) || Reflect.ownKeys(options).some(key => key !== 'root')) reject();
  const { root = process.cwd() } = options;
  if (!isString(root) || root.includes('\0')) reject();
  const git = (...args) => execFileSync('git', ['--no-lazy-fetch', '--literal-pathspecs', '-C', root, ...args], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  if (git('rev-parse', '--is-shallow-repository').toString().trim() !== 'false') reject();
  const commit = git('rev-parse', '--verify', 'HEAD^{commit}').toString().trim();
  if (!/^[0-9a-f]{40}$/.test(commit)) reject();
  const entries = new Map();
  const inputs = [];
  const paths = ['plugin.json', 'marketplace/index.json', 'README.md', 'com.github.copilot/agents', 'skills', 'prompts', 'instructions', 'extensions'];
  for (const entry of git('ls-tree', '-r', '-z', commit, '--', ...paths).toString('utf8').split('\0').filter(Boolean)) {
    const split = entry.indexOf('\t');
    const [mode, type, oid] = entry.slice(0, split).split(' ');
    const file = safePath(entry.slice(split + 1));
    if (/[\x00-\x1f\x7f]/.test(file) || /^(?:prompts|instructions|extensions)(?:\/|$)/.test(file)) reject();
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) reject();
    if (file.startsWith(agentRoot) && !/^com\.github\.copilot\/agents\/[A-Za-z0-9][A-Za-z0-9_-]*\.agent\.md$/.test(file)) reject();
    if (file.startsWith('skills/') && !/^skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/.+$/.test(file)) reject();
    entries.set(file, { mode, oid });
  }
  const consumed = new Map();
  const read = file => {
    if (!entries.has(file)) reject();
    if (!consumed.has(file)) {
      const entry = entries.get(file);
      const bytes = git('cat-file', 'blob', entry.oid);
      inputs.push({ path: file, mode: entry.mode, size: bytes.length, sha256: digest(bytes) });
      consumed.set(file, bytes);
    }
    return consumed.get(file);
  };
  const readJson = file => {
    const value = JSON.parse(read(file).toString('utf8'));
    if (!isObject(value)) reject();
    return value;
  };
  const date = file => {
    const value = git('log', '-1', '--format=%cI', commit, '--', file).toString().trim();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) reject();
    return value;
  };
  const manifest = readJson('plugin.json');
  const index = readJson('marketplace/index.json');
  if (!read('README.md').length) reject();
  if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json' || manifest.name !== 'basic-plugin' || manifest.repository !== repository || !['version', 'description', 'homepage'].every(key => isString(manifest[key])) || !/^https:\/\//.test(manifest.homepage)) reject();
  const homepage = new URL(manifest.homepage);
  if (homepage.username || homepage.password) reject();
  if (manifest.keywords !== undefined && !isStrings(manifest.keywords)) reject();
  if (manifest.author !== undefined && !(isString(manifest.author) || (isObject(manifest.author) && isString(manifest.author.name)))) reject();
  if (isObject(manifest.author) && manifest.author.url !== undefined && !isString(manifest.author.url)) reject();
  const author = isString(manifest.author) ? { name: manifest.author } : manifest.author ?? null;
  if (manifest.license !== undefined && !isString(manifest.license)) reject();
  if (index.schemaVersion !== 1 || !Array.isArray(index.plugins) || index.plugins.length !== 1) reject();
  const row = index.plugins[0];
  if (!isObject(row) || row.source !== 'local' || ['name', 'version', 'description', 'repository', 'homepage'].some(key => row[key] !== manifest[key])) reject();
  const capabilities = row.capabilities;
  const capabilityKeys = ['agents', 'skills', 'prompts', 'instructions'];
  if (!isObject(capabilities) || Object.keys(capabilities).length !== capabilityKeys.length || capabilityKeys.some(key => !Number.isSafeInteger(capabilities[key]) || capabilities[key] < 0) || capabilities.prompts !== 0 || capabilities.instructions !== 0) reject();

  const sortedPaths = [...entries.keys()].sort(ascii);
  const agents = sortedPaths.filter(file => file.startsWith(agentRoot)).map(file => {
    const header = parseHeader(read(file));
    if (header.model !== undefined && !(isString(header.model) || (isStrings(header.model) && header.model.length > 0))) reject();
    if (header.tools !== undefined && !isStrings(header.tools)) reject();
    const filename = file.slice(agentRoot.length);
    return { id: filename.slice(0, -'.agent.md'.length), title: header.name, description: header.description, path: file, filename, lastUpdated: date(file), ...(header.model === undefined ? {} : { model: header.model }), tools: header.tools ?? [] };
  });
  const skillIds = [...new Set(sortedPaths.filter(file => file.startsWith('skills/')).map(file => file.split('/')[1]))].sort(ascii);
  const skills = skillIds.map(id => {
    const skillPath = `skills/${id}`;
    const skillFile = `${skillPath}/SKILL.md`;
    const header = parseHeader(read(skillFile));
    if (header.name !== id) reject();
    const files = sortedPaths.filter(file => file.startsWith(`${skillPath}/`)).map(file => ({ path: file, name: file.slice(skillPath.length + 1), size: read(file).length }));
    const assets = files.filter(file => file.name !== 'SKILL.md' && !file.name.split('/').slice(0, -1).some(segment => ['bin', 'obj'].includes(segment))).map(file => file.name);
    return { id, name: id, title: id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '), description: header.description, path: skillPath, skillFile, files, assets, hasAssets: assets.length > 0, assetCount: assets.length, lastUpdated: date(skillFile) };
  });
  if (agents.length !== capabilities.agents || skills.length !== capabilities.skills || agents.length + skills.length === 0) reject();
  const pluginItems = [...agents.map(item => ({ kind: 'agent', path: item.path, title: item.title, detailUrl: `/agent/${item.id}` })), ...skills.map(item => ({ kind: 'skill', path: item.path, title: item.title, detailUrl: `/skill/${item.id}` }))];
  const plugin = { id: manifest.name, name: manifest.name, description: manifest.description, path: '.', version: manifest.version, tags: manifest.keywords ?? [], itemCount: pluginItems.length, items: pluginItems, readmeFile: 'README.md', repository: manifest.repository, homepage: manifest.homepage, author, license: manifest.license ?? null, external: false, lastUpdated: date('plugin.json') };
  const facets = values => [...new Set(values)].sort(ascii);
  const searchRecord = (type, item, itemPath = item.path) => ({ type, id: item.id, title: item.title ?? item.name, description: item.description, path: itemPath, lastUpdated: item.lastUpdated });
  const result = {
    status: 'LOCAL_CATALOG_PROJECTED_UNVALIDATED_SITE',
    schemaVersion: 1,
    source: { repository: 'jnicholas000/basic-plugin', commit, upstreamShapeRef },
    files: {
      'agents.json': { items: agents, filters: { models: facets(agents.flatMap(item => item.model ?? [])), tools: facets(agents.flatMap(item => item.tools)) } },
      'skills.json': { items: skills },
      'plugins.json': { items: [plugin] },
      'instructions.json': { items: [], filters: { patterns: [], extensions: [] } },
      'extensions.json': { items: [] },
      'search-index.json': [...agents.map(item => searchRecord('agent', item)), ...skills.map(item => searchRecord('skill', item, item.skillFile)), searchRecord('plugin', plugin)]
    },
    counts: { agents: agents.length, skills: skills.length, plugins: 1, instructions: 0, extensions: 0 },
    inputs: inputs.sort((a, b) => ascii(a.path, b.path)),
    observationLimits: { contributorsTotal: null, installActions: 'UNVERIFIED', integration: 'NOT_ACTIVATED' }
  };
  return { ...result, contentDigest: digest(JSON.stringify(result)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) reject();
    process.stdout.write(`${JSON.stringify(projectLocalCatalog())}\n`);
  } catch {
    process.stderr.write('Local catalog projection failed.\n');
    process.exitCode = 1;
  }
}
