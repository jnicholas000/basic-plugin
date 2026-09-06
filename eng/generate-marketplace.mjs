import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
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
const output = { schemaVersion: 1, generatedAt: new Date().toISOString(), plugins: [entry] };
await mkdir(path.join(root, 'marketplace'), { recursive: true });
await writeFile(path.join(root, 'marketplace', 'index.json'), `${JSON.stringify(output, null, 2)}\n`);

async function countFiles(dir, suffix) {
  try { return (await readdir(dir, { withFileTypes: true })).filter((x) => x.isFile() && x.name.endsWith(suffix)).length; }
  catch { return 0; }
}
async function countDirectories(dir) {
  try { return (await readdir(dir, { withFileTypes: true })).filter((x) => x.isDirectory()).length; }
  catch { return 0; }
}
