import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distributionArg = process.argv.indexOf('--distribution-root');
const distributionRoot = distributionArg >= 0 ? path.resolve(root, process.argv[distributionArg + 1]) : root;
const plugin = JSON.parse(await readFile(path.join(distributionRoot, 'plugin.json'), 'utf8'));
const marketplace = JSON.parse(await readFile(path.join(root, 'marketplace', 'index.json'), 'utf8'));
const contract = JSON.parse(await readFile(path.join(root, 'marketplace.contract.json'), 'utf8'));
if (plugin['$schema'] !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') throw new Error('Invalid plugin schema');
if (marketplace.schemaVersion !== 1 || marketplace.plugins.length === 0) throw new Error('Marketplace index is empty or invalid');
for (const output of contract.expectedOutputs ?? []) {
  try { await readFile(path.join(root, output)); }
  catch { throw new Error(`Required generated output is missing: ${output}`); }
}
if (contract.schemaVersion !== 1 || !Array.isArray(contract.expectedOutputs) || !Array.isArray(contract.expectedDistribution)) throw new Error('Invalid marketplace contract');
if (distributionArg >= 0) {
  for (const output of contract.expectedDistribution) {
    try { await stat(path.join(distributionRoot, output)); }
    catch { throw new Error(`Required distribution output is missing: ${output}`); }
  }
}
for (const item of marketplace.plugins) {
  if (!item.name || !item.version || !item.description || !item.source) throw new Error(`Incomplete marketplace entry: ${item.name}`);
}
console.log(`Validated ${marketplace.plugins.length} marketplace plugin(s).`);
