import { readFile, writeFile } from 'node:fs/promises';
const file = '.env.example';
const latest = process.env.UPSTREAM_LATEST;
if (!latest || !/^[0-9a-f]{40}$/.test(latest)) throw new Error('UPSTREAM_LATEST must be a 40-character commit SHA');
const current = await readFile(file, 'utf8');
await writeFile(file, current.replace(/^UPSTREAM_AWESOME_COPILOT_REF=.*$/m, `UPSTREAM_AWESOME_COPILOT_REF=${latest}`));
