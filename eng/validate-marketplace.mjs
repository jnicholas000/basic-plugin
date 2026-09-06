import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const plugin = JSON.parse(await readFile(path.join(root, 'plugin.json'), 'utf8'));
const marketplace = JSON.parse(await readFile(path.join(root, 'marketplace', 'index.json'), 'utf8'));
if (plugin['$schema'] !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') throw new Error('Invalid plugin schema');
if (marketplace.schemaVersion !== 1 || marketplace.plugins.length === 0) throw new Error('Marketplace index is empty or invalid');
for (const item of marketplace.plugins) {
  if (!item.name || !item.version || !item.description || !item.source) throw new Error(`Incomplete marketplace entry: ${item.name}`);
}
console.log(`Validated ${marketplace.plugins.length} marketplace plugin(s).`);
