import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'website');
const dist = path.join(root, 'site');

const [data, mcp, hooks, baseline] = await Promise.all([
  readJson(path.join(root, 'marketplace', 'index.json')),
  readJson(path.join(root, 'mcp.json')),
  readJson(path.join(root, 'hooks.json')),
  readJson(path.join(source, 'upstream-baseline.json')),
]);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const totals = data.plugins.reduce(
  (current, plugin) => ({
    agents: current.agents + (plugin.capabilities?.agents ?? 0),
    skills: current.skills + (plugin.capabilities?.skills ?? 0),
  }),
  { agents: 0, skills: 0 },
);

const repository = 'https://github.com/jnicholas000/basic-plugin';
const mcpServers = Object.keys(mcp.mcpServers ?? {}).length;
const hookCommands = Object.values(hooks.hooks ?? {}).reduce(
  (count, entries) => count + (Array.isArray(entries) ? entries.length : 0),
  0,
);

const resources = [
  { name: 'Plugins', count: data.plugins.length, description: 'Installable Agent Plugins packages published by this lab.', href: '#catalog' },
  { name: 'Agents', count: totals.agents, description: 'Copilot-specific custom agents packaged with the local plugin.', href: repository + '/tree/main/com.github.copilot/agents' },
  { name: 'Skills', count: totals.skills, description: 'Portable skills that bundle focused instructions and supporting resources.', href: repository + '/tree/main/skills' },
  { name: 'MCP servers', count: mcpServers, description: 'Portable MCP configuration declared by the plugin and authenticated at use time.', href: repository + '/blob/main/mcp.json' },
  { name: 'Hooks', count: hookCommands, description: 'Advisory runtime hooks used for passive capability diagnostics.', href: repository + '/blob/main/hooks.json' },
  { name: 'Roadmap', count: null, description: 'The durable plan for clone maintenance, governance experiments, and incubation work.', href: repository + '/blob/main/ROADMAP.md' },
];

const resourceCards = resources.map(renderResourceCard).join('\n');
const marketplaceCards = data.plugins.map(renderPluginCard).join('\n');
let html = await readFile(path.join(source, 'template.html'), 'utf8');

const replacements = {
  '<!-- RESOURCE_CARDS -->': resourceCards,
  '<!-- MARKETPLACE_CARDS -->': marketplaceCards,
  '<!-- GENERATED_AT -->': escapeHtml(data.generatedAt),
  '<!-- UPSTREAM_REF -->': escapeHtml(baseline.ref),
  '<!-- UPSTREAM_REF_SHORT -->': escapeHtml(baseline.ref.slice(0, 7)),
};

for (const [token, value] of Object.entries(replacements)) {
  html = html.replace(token, value);
}

if (/<!-- [A-Z_]+ -->/.test(html)) {
  throw new Error('Generated site still contains unresolved template tokens');
}

await writeFile(path.join(dist, 'index.html'), html);
await cp(path.join(source, 'styles.css'), path.join(dist, 'styles.css'));
await cp(path.join(source, 'app.js'), path.join(dist, 'app.js'));

function renderResourceCard(resource) {
  const count = resource.count === null ? '' : `<span class="resource-count">${resource.count}</span>`;
  return `<article class="resource-card"><a class="resource-link" href="${escapeAttribute(resource.href)}"><div class="resource-heading"><h3>${escapeHtml(resource.name)}</h3>${count}</div><p>${escapeHtml(resource.description)}</p><span class="resource-arrow" aria-hidden="true">→</span><span class="sr-only">Explore ${escapeHtml(resource.name)}</span></a></article>`;
}

function renderPluginCard(plugin) {
  const capabilities = [
    [plugin.capabilities?.agents ?? 0, 'agent'],
    [plugin.capabilities?.skills ?? 0, 'skill'],
  ]
    .filter(([count]) => count > 0)
    .map(([count, label]) => `<span>${count} ${label}${count === 1 ? '' : 's'}</span>`)
    .join('');

  return `<article class="plugin-card"><p class="plugin-meta">${escapeHtml(plugin.source)} · v${escapeHtml(plugin.version)}</p><div class="plugin-title-row"><h3>${escapeHtml(plugin.name)}</h3><span class="local-pill">LOCAL</span></div><p class="plugin-description">${escapeHtml(plugin.description)}</p><div class="capability-list">${capabilities}</div><a class="text-link" href="${escapeAttribute(plugin.repository)}">View repository <span aria-hidden="true">↗</span></a></article>`;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
