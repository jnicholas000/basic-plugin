import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { classifyWebsiteChange } from './upstream-website-classifier.mjs';

const repositoryDirectory = process.env.UPSTREAM_REPO_DIR;
const base = process.env.UPSTREAM_BASE;
const head = process.env.UPSTREAM_HEAD;
const reportPath = process.env.UPSTREAM_REPORT;

if (!repositoryDirectory || !base || !head || !reportPath) {
  throw new Error('UPSTREAM_REPO_DIR, UPSTREAM_BASE, UPSTREAM_HEAD, and UPSTREAM_REPORT are required');
}

function git(...args) {
  return execFileSync('git', ['-C', repositoryDirectory, ...args], { encoding: 'utf8' });
}

function readPackage(ref) {
  try {
    return JSON.parse(git('show', `${ref}:website/package.json`));
  } catch {
    return null;
  }
}

function changedFiles() {
  const output = git('diff', '--name-status', base, head, '--', 'website/').trim();
  if (!output) return [];

  return output.split('\n').map((line) => {
    const parts = line.split('\t');
    const rawStatus = parts[0];
    const status = rawStatus[0];
    const filePath = status === 'R' || status === 'C' ? parts[2] : parts[1];
    return { status, path: filePath };
  });
}

function lineStats() {
  const output = git('diff', '--numstat', base, head, '--', 'website/').trim();
  if (!output) return { additions: 0, deletions: 0 };

  return output.split('\n').reduce(
    (stats, line) => {
      const [added, removed] = line.split('\t');
      stats.additions += /^\d+$/.test(added) ? Number(added) : 0;
      stats.deletions += /^\d+$/.test(removed) ? Number(removed) : 0;
      return stats;
    },
    { additions: 0, deletions: 0 },
  );
}

const files = changedFiles();
const basePackage = readPackage(base);
const headPackage = readPackage(head);
const result = classifyWebsiteChange({ files, basePackage, headPackage });
const lines = lineStats();

const signals =
  result.classification === 'architecture'
    ? result.architectureSignals
    : result.reviewSignals;

const report = [
  '# Awesome Copilot upstream website change',
  '',
  `- Baseline: \`${base}\``,
  `- Candidate: \`${head}\``,
  `- Classification: **${result.classification}**`,
  `- Website files changed: ${result.counts.changed}`,
  `- Added / removed / modified: ${result.counts.added} / ${result.counts.removed} / ${result.counts.modified}`,
  `- Line additions / deletions: ${lines.additions} / ${lines.deletions}`,
  '',
  '## Signals',
  '',
  ...(signals.length > 0 ? signals.map((signal) => `- ${signal}`) : ['- No elevated-risk signals detected.']),
  '',
  result.classification === 'architecture'
    ? 'The reviewed upstream pin must not advance automatically. Rebase the local adaptation layer onto the new upstream architecture in a dedicated migration PR.'
    : result.classification === 'review'
      ? 'The change may be synchronized, but the resulting PR requires human review before merge.'
      : 'The change is eligible for the routine automated synchronization path.',
  '',
].join('\n');

await writeFile(reportPath, report);

if (process.env.GITHUB_OUTPUT) {
  await writeFile(
    process.env.GITHUB_OUTPUT,
    [
      `classification=${result.classification}`,
      `website_changed=${result.counts.changed > 0}`,
      `changed_files=${result.counts.changed}`,
      `added_files=${result.counts.added}`,
      `removed_files=${result.counts.removed}`,
      `modified_files=${result.counts.modified}`,
      `line_additions=${lines.additions}`,
      `line_deletions=${lines.deletions}`,
      '',
    ].join('\n'),
    { flag: 'a' },
  );
}

if (process.env.GITHUB_STEP_SUMMARY) {
  const summary = await readFile(reportPath, 'utf8');
  await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' });
}

console.log(report);
