import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../eng/sync-upstream-ref.mjs', import.meta.url));
const originalRef = '1111111111111111111111111111111111111111';
const nextRef = '2222222222222222222222222222222222222222';

function fixture(t) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'basic-plugin-sync-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(path.join(directory, 'website'));
  writeFileSync(
    path.join(directory, '.env.example'),
    `UPSTREAM_AWESOME_COPILOT_REF=${originalRef}\n`,
  );
  writeFileSync(
    path.join(directory, 'website/upstream-baseline.json'),
    JSON.stringify(
      {
        schemaVersion: 1,
        repository: 'github/awesome-copilot',
        ref: originalRef,
        capturedOn: '2026-09-01',
        architecture: { framework: 'Astro 7', layout: 'BaseLayout + React PageShell' },
        sourceFiles: ['a', 'b', 'c', 'd'],
      },
      null,
      2,
    ) + '\n',
  );
  return directory;
}

function run(directory, latest) {
  execFileSync(process.execPath, [script], {
    cwd: directory,
    env: { ...process.env, UPSTREAM_LATEST: latest },
    stdio: 'pipe',
  });
}

test('sync is a true no-op when the reviewed ref has not changed', (t) => {
  const directory = fixture(t);
  const envPath = path.join(directory, '.env.example');
  const baselinePath = path.join(directory, 'website/upstream-baseline.json');
  const beforeEnv = readFileSync(envPath, 'utf8');
  const beforeBaseline = readFileSync(baselinePath, 'utf8');

  run(directory, originalRef);

  assert.equal(readFileSync(envPath, 'utf8'), beforeEnv);
  assert.equal(readFileSync(baselinePath, 'utf8'), beforeBaseline);
});

test('sync advances the pin and baseline together when upstream changes', (t) => {
  const directory = fixture(t);
  run(directory, nextRef);

  assert.equal(
    readFileSync(path.join(directory, '.env.example'), 'utf8'),
    `UPSTREAM_AWESOME_COPILOT_REF=${nextRef}\n`,
  );

  const baseline = JSON.parse(
    readFileSync(path.join(directory, 'website/upstream-baseline.json'), 'utf8'),
  );
  assert.equal(baseline.ref, nextRef);
  assert.match(baseline.capturedOn, /^\d{4}-\d{2}-\d{2}$/);
});
