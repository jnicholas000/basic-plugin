import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const site = path.join(root, 'website');
const dist = path.join(root, 'site');
const data = JSON.parse(await readFile(path.join(root, 'marketplace', 'index.json'), 'utf8'));
await mkdir(dist, { recursive: true });
const cards = data.plugins.map((p) => `<article class="card"><div class="eyebrow">${p.source} · v${p.version}</div><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.description)}</p><div class="chips"><span>${p.capabilities.agents} agents</span><span>${p.capabilities.skills} skills</span></div><a href="${p.repository}">View plugin ↗</a></article>`).join('\n');
const html = (await readFile(path.join(site, 'template.html'), 'utf8')).replace('<!-- MARKETPLACE_CARDS -->', cards).replace('<!-- GENERATED_AT -->', data.generatedAt);
await writeFile(path.join(dist, 'index.html'), html);
await cp(path.join(site, 'styles.css'), path.join(dist, 'styles.css'));
await cp(path.join(site, 'app.js'), path.join(dist, 'app.js'));
function escapeHtml(value) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
