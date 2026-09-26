import { readFile, writeFile } from 'node:fs/promises';

const envFile = '.env.example';
const baselineFile = 'website/upstream-baseline.json';
const latest = process.env.UPSTREAM_LATEST;

if (!latest || !/^[0-9a-f]{40}$/.test(latest)) {
  throw new Error('UPSTREAM_LATEST must be a 40-character commit SHA');
}

const env = await readFile(envFile, 'utf8');
await writeFile(
  envFile,
  env.replace(
    /^UPSTREAM_AWESOME_COPILOT_REF=.*$/m,
    `UPSTREAM_AWESOME_COPILOT_REF=${latest}`,
  ),
);

const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));
baseline.ref = latest;
baseline.reviewedOn = new Date().toISOString().slice(0, 10);
await writeFile(baselineFile, `${JSON.stringify(baseline, null, 2)}\n`);
