import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { digest, safePath } from './vendor-upstream.mjs';

export function classifyPreflight(evidence, config, overlay) {
  const result = (classification, signals) => ({ classification, signals, candidateExecutionAllowed: ['routine', 'review'].includes(classification), automaticBaselineAdvancement: false });
  if (evidence.complete !== true || evidence.truncated !== false || !/^[0-9a-f]{40}$/.test(evidence.base || '') || !/^[0-9a-f]{40}$/.test(evidence.head || '') || evidence.base !== config.acceptedSha || !Array.isArray(evidence.files) || !Array.isArray(evidence.consumedPaths) || !evidence.basePackage || !evidence.headPackage) return result('indeterminate', ['Incomplete or unbound static evidence']);
  try {
    for (const file of evidence.files) {
      safePath(file.path);
      if (!['A', 'M', 'D', 'R', 'C', 'T'].includes(file.status)) throw new Error('Unknown status');
      if (['R', 'C'].includes(file.status)) safePath(file.previousPath);
    }
    evidence.consumedPaths.forEach(safePath);
  } catch { return result('indeterminate', ['Invalid path/status evidence']); }
  const architecture = [];
  const dependencies = pkg => ({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies });
  const before = dependencies(evidence.basePackage), after = dependencies(evidence.headPackage);
  for (const name of config.policy.frameworkDependencies) {
    const a = before[name], b = after[name];
    if (a === b) continue;
    if (!a || !b) { architecture.push(`Framework shape changed: ${name}`); continue; }
    // Reject ranges/aliases we cannot resolve statically rather than guessing.
    const major = value => typeof value === 'string' && /^(?:\^|~)?\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(value) ? Number(value.match(/\d+/)[0]) : null;
    if (major(a) === null || major(b) === null) return result('indeterminate', [`Unresolved framework version: ${name}`]);
    if (major(a) !== major(b)) architecture.push(`Framework major changed: ${name}`);
  }
  const targets = overlay.rules.filter(rule => rule.allowMissing !== true).map(rule => rule.target);
  const lost = targets.filter(target => evidence.files.some(file => (file.status === 'D' && file.path === target) || (file.status === 'R' && file.previousPath === target)));
  if (lost.length >= config.policy.lostIntegrationPoints) architecture.push(`Lost overlay integration points: ${lost.join(', ')}`);
  const implementation = file => config.policy.implementationExtensions.includes(path.posix.extname(file));
  const inside = (file, root) => file === root || file.startsWith(`${root}/`);
  const retained = file => config.copy.some(root => inside(file, root)) && (!config.prune.some(root => inside(file, root)) || config.keep.some(root => inside(file, root)));
  const consumed = evidence.consumedPaths.filter(file => retained(file) && implementation(file));
  const changed = new Set(evidence.files.flatMap(file => [file.path, file.previousPath].filter(Boolean)).filter(file => consumed.includes(file) || (implementation(file) && retained(file))));
  if (changed.size >= config.policy.architectureMinimumFiles && changed.size / Math.max(consumed.length, 1) >= config.policy.architectureShare) architecture.push('Consumed implementation surface replaced');
  if (architecture.length) return result('architecture', architecture);
  const review = [];
  for (const file of evidence.files) {
    const ext = path.posix.extname(file.path);
    const allowlisted = config.policy.routinePrefixes.some(prefix => file.path.startsWith(prefix)) && config.policy.routineExtensions.includes(ext);
    const denied = config.policy.reviewPrefixes.some(prefix => file.path.startsWith(prefix)) || config.policy.reviewPaths.includes(file.path) || targets.includes(file.path);
    if (denied || !allowlisted || !['M', 'A', 'D'].includes(file.status)) review.push(`Review surface: ${file.path}`);
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) review.push('Dependency metadata changed');
  return result(review.length ? 'review' : 'routine', review);
}

export function capturePreflight(repository, base, head) {
  const evidence = { schemaVersion: 1, base, head, complete: false, truncated: false, files: [], consumedPaths: [] };
  try {
    if (![base, head].every(ref => /^[0-9a-f]{40}$/.test(ref))) throw new Error('Immutable SHA required');
    const git = (...args) => execFileSync('git', ['-C', repository, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    for (const ref of [base, head]) if (git('rev-parse', `${ref}^{commit}`).trim() !== ref) throw new Error('Commit binding failed');
    const fields = git('diff', '--find-renames', '--find-copies', '--name-status', '-z', base, head).split('\0');
    if (fields.pop() !== '') throw new Error('Truncated diff');
    while (fields.length) {
      const status = fields.shift()[0];
      const first = fields.shift();
      if (!first) throw new Error('Truncated path');
      if (['R', 'C'].includes(status)) {
        const destination = fields.shift();
        if (!destination) throw new Error('Truncated rename');
        evidence.files.push({ status, path: destination, previousPath: first });
      } else evidence.files.push({ status, path: first });
    }
    evidence.consumedPaths = git('ls-tree', '-r', '--name-only', '-z', base, '--', 'website/').split('\0').filter(Boolean);
    evidence.basePackage = JSON.parse(git('show', `${base}:website/package.json`));
    evidence.headPackage = JSON.parse(git('show', `${head}:website/package.json`));
    evidence.complete = true;
  } catch (error) { evidence.error = error.message; }
  return evidence;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(await readFile('website/vendor.config.json', 'utf8'));
  const overlay = JSON.parse(await readFile(config.overlay, 'utf8'));
  const evidence = capturePreflight(process.env.UPSTREAM_REPO_DIR, config.acceptedSha, process.env.UPSTREAM_HEAD);
  const report = { evidence, result: classifyPreflight(evidence, config, overlay) };
  const bytes = `${JSON.stringify(report, null, 2)}\n`;
  const file = `${process.env.UPSTREAM_REPORT || 'vendor-preflight'}.${digest(bytes)}.json`;
  await writeFile(file, bytes, { flag: 'wx' });
  console.log(file);
  console.log(report.result.classification);
  if (!report.result.candidateExecutionAllowed) process.exitCode = 1;
}
