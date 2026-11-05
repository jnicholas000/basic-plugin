// DO_NOT_COPY: one fixed read-only metadata observation on the admitted existing CI route.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { observeFixedPrerequisites, serializeReceipt } from './npm-prerequisite-metadata.mjs';

const moduleSha256 = 'a13e9643b05f1fbe50aa6aa2d4c88889149eda27767a8860ad0d48c7af97109d';
const originalRunnerSha256 = 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7';
const firstReceiptSha256 = 'eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e';
const requireFact = value => { if (!value) throw new Error('fixed-metadata-requirement'); };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function readOwned(p, limit) {
  const stat = fs.lstatSync(p); requireFact(stat.isFile() && !stat.isSymbolicLink() && stat.size <= limit);
  const bytes = fs.readFileSync(p); requireFact(bytes.length === stat.size && bytes.length <= limit); return bytes;
}
function main() {
  let stage = 'admission';
  try {
    requireFact(process.argv.length === 2 && process.platform === 'linux' && process.arch === 'x64'
      && /^22\./.test(process.versions.node) && process.env.GITHUB_ACTIONS === 'true'
      && process.env.RUNNER_OS === 'Linux' && process.env.RUNNER_ARCH === 'X64'
      && process.env.GITHUB_JOB === 'local' && process.env.GITHUB_WORKFLOW === 'AQC quality gates'
      && process.env.GITHUB_REPOSITORY === 'jnicholas000/basic-plugin'
      && process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.NPM_METADATA_EVENT_ACTION === 'opened'
      && process.env.GITHUB_HEAD_REF === 'feat/npm-runtime-prerequisite-metadata-20261105'
      && process.env.GITHUB_RUN_ATTEMPT === '1');
    for (const k of ['GITHUB_SHA', 'NPM_METADATA_HEAD_SHA', 'NPM_METADATA_BASE_SHA']) requireFact(/^[a-f0-9]{40}$/.test(process.env[k] ?? ''));
    requireFact(/^[a-f0-9]{64}$/.test(process.env.NPM_METADATA_SOURCE_SHA256 ?? '') && /^[0-9]{1,30}$/.test(process.env.GITHUB_RUN_ID ?? ''));
    const repo = fileURLToPath(new URL('../../../', import.meta.url));
    requireFact(path.resolve(process.cwd()) === path.resolve(repo));
    stage = 'owned-source-bindings';
    const controllerSha256 = hash(readOwned(fileURLToPath(import.meta.url), 65536));
    requireFact(controllerSha256 === process.env.NPM_METADATA_SOURCE_SHA256
      && hash(readOwned(new URL('./npm-prerequisite-metadata.mjs', import.meta.url), 65536)) === moduleSha256
      && hash(readOwned(new URL('./run-npm-preparation-control.mjs', import.meta.url), 65536)) === originalRunnerSha256
      && hash(readOwned(new URL('../candidate-npm-preparation-first-receipt.json', import.meta.url), 65536)) === firstReceiptSha256);
    stage = 'public-event-binding';
    const event = JSON.parse(readOwned(process.env.GITHUB_EVENT_PATH, 1048576));
    requireFact(event.action === 'opened' && Number.isSafeInteger(event.number) && event.number > 0
      && process.env.GITHUB_REF === `refs/pull/${event.number}/merge`
      && event.repository?.full_name === 'jnicholas000/basic-plugin'
      && event.pull_request?.head?.repo?.full_name === 'jnicholas000/basic-plugin'
      && event.pull_request?.base?.repo?.full_name === 'jnicholas000/basic-plugin'
      && event.pull_request?.head?.ref === 'feat/npm-runtime-prerequisite-metadata-20261105'
      && event.pull_request.head.sha === process.env.NPM_METADATA_HEAD_SHA
      && event.pull_request.base.sha === process.env.NPM_METADATA_BASE_SHA);
    const imageOS = process.env.ImageOS || 'UNAVAILABLE', imageVersion = process.env.ImageVersion || 'UNAVAILABLE';
    requireFact(['ubuntu22', 'ubuntu24', 'ubuntu26', 'UNAVAILABLE'].includes(imageOS)
      && imageVersion.length <= 40 && (imageVersion === 'UNAVAILABLE' || /^[0-9]+(?:\.[0-9]+)*$/.test(imageVersion)));
    const binding = { controllerSha256, originalRunnerSha256, firstReceiptSha256, runId: process.env.GITHUB_RUN_ID,
      runAttempt: 1, headCommit: process.env.NPM_METADATA_HEAD_SHA, baseCommit: process.env.NPM_METADATA_BASE_SHA,
      sourceCommit: process.env.GITHUB_SHA, runnerOS: 'Linux', runnerArch: 'X64', imageOS, imageVersion };
    stage = 'fixed-metadata-observation';
    const observation = observeFixedPrerequisites({ lstatSync: p => fs.lstatSync(p), realpathSync: p => fs.realpathSync(p) });
    process.stdout.write(serializeReceipt({ ...observation, binding }));
    if (!['METADATA_COMPLETE', 'MISSING_PREREQUISITES'].includes(observation.status)) process.exitCode = 1;
  } catch {
    process.stdout.write(`${JSON.stringify({ status: 'DIAGNOSTIC_STOPPED', stage, reason: 'fixed-metadata-requirement' })}\n`);
    process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
