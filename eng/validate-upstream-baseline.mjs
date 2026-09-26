import { readFile } from 'node:fs/promises';

const env = await readFile('.env.example', 'utf8');
const baseline = JSON.parse(await readFile('website/upstream-baseline.json', 'utf8'));
const match = env.match(/^UPSTREAM_AWESOME_COPILOT_REF=([0-9a-f]{40})$/m);

if (!match) {
  throw new Error('UPSTREAM_AWESOME_COPILOT_REF must be a 40-character commit SHA');
}

if (baseline.schemaVersion !== 1) {
  throw new Error('Unsupported website upstream baseline schema');
}

if (baseline.repository !== 'github/awesome-copilot') {
  throw new Error('Website upstream baseline must identify github/awesome-copilot');
}

if (baseline.ref !== match[1]) {
  throw new Error(
    `Website upstream baseline ref ${baseline.ref} does not match reviewed pin ${match[1]}`,
  );
}

if (!baseline.architecture?.framework || !baseline.architecture?.layout) {
  throw new Error('Website upstream baseline is missing architecture identity');
}

if (!Array.isArray(baseline.sourceFiles) || baseline.sourceFiles.length < 4) {
  throw new Error('Website upstream baseline must identify the reviewed structural source files');
}

console.log(
  `Validated Awesome Copilot website baseline ${baseline.ref} (${baseline.architecture.framework}, ${baseline.architecture.layout}).`,
);
