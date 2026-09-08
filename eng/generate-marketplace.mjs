import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const marketplacePath = path.join(root, 'marketplace', 'index.json');
const manifest = JSON.parse(await readFile(path.join(root, 'plugin.json'), 'utf8'));
const entry = {
  name: manifest.name,
  version: manifest.version,
  description: manifest.description,
  repository: manifest.repository,
  homepage: manifest.homepage,
  source: 'local',
  capabilities: {
    agents: await countFiles(path.join(root, 'com.github.copilot', 'agents'), '.agent.md'),
    skills: await countDirectories(path.join(root, 'skills')),
    prompts: 0,
    instructions: 0
  }
};
const plugins = [entry];
const generatedAt = await resolveGeneratedAt(marketplacePath, plugins);
const output = { schemaVersion: 1, generatedAt, plugins };
await mkdir(path.dirname(marketplacePath), { recursive: true });
await writeFile(marketplacePath, `${JSON.stringify(output, null, 2)}\n`);

async function resolveGeneratedAt(file, nextPlugins) {
  try {
    const previous = JSON.parse(await readFile(file, 'utf8'));
    if (
      previous.schemaVersion === 1 &&
      typeof previous.generatedAt === 'string' &&
      JSON.stringify(previous.plugins) === JSON.stringify(nextPlugins)
    ) {
      return previous.generatedAt;
    }
  } catch {
    // First generation or invalid prior output gets a fresh timestamp.
  }
  return new Date().toISOString();
}

async function countFiles(dir, suffix) {
  try { return (await readdir(dir, { withFileTypes: true })).filter((x) => x.isFile() && x.name.endsWith(suffix)).length; }
  catch { return 0; }
}
async function countDirectories(dir) {
  try { return (await readdir(dir, { withFileTypes: true })).filter((x) => x.isDirectory()).length; }
  catch { return 0; }
}
