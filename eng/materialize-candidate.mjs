import { execFileSync } from 'node:child_process';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safePath, vendor } from './vendor-upstream.mjs';

const copy = ['.all-contributorsrc', 'LICENSE', 'website/package.json', 'website/package-lock.json', 'website/astro.config.mjs', 'website/tsconfig.json', 'website/src', 'website/public/fonts', 'website/public/images'];
const prune = ['website/public/data', 'website/src/content', 'website/src/pages/learning-hub', 'website/public/images/learning-hub'];
const requiredPaths = ['.all-contributorsrc', 'LICENSE', 'website/package.json', 'website/package-lock.json', 'website/astro.config.mjs', 'website/tsconfig.json', 'website/src/pages/index.astro', 'website/src/lib/site-data.ts', 'website/src/integrations/pagefind-resources.ts', 'website/src/layouts/BaseLayout.astro', 'website/src/components/brand/HomePage.tsx', 'website/src/components/brand/PageShell.tsx'];
const inside = (file, root) => file === root || file.startsWith(`${root}/`);
const matches = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index]);
const reject = () => { throw new Error('Invalid candidate materialization input'); };

export async function materializeCandidate(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Reflect.ownKeys(options).some(key => !['repository', 'localRoot'].includes(key))) reject();
  const { repository, localRoot = process.cwd() } = options;
  if (typeof repository !== 'string' || !repository.trim() || repository.includes('\0') || typeof localRoot !== 'string' || !localRoot.trim() || Object.hasOwn(process.env, 'UPSTREAM_HEAD')) reject();
  const root = await realpath(localRoot);
  // Keep both the configuration reads and vendor's fixed output beneath the owned root.
  const website = path.join(root, 'website');
  if (await realpath(website) !== website || !(await lstat(website)).isDirectory()) reject();
  const readJson = async relative => {
    safePath(relative);
    const file = path.join(root, relative);
    if (!(await realpath(file)).startsWith(`${root}${path.sep}`) || !(await lstat(file)).isFile()) reject();
    return JSON.parse(await readFile(file, 'utf8'));
  };
  const accepted = await readJson('website/vendor.config.json');
  const config = await readJson('website/candidate-materialization.config.json');
  if (accepted?.schemaVersion !== 1 || typeof accepted.repository !== 'string' || !accepted.repository.trim() || !/^[0-9a-f]{40}$/.test(accepted.acceptedSha) || typeof accepted.overlay !== 'string') reject();
  safePath(accepted.overlay);
  const configKeys = ['schemaVersion', 'repository', 'acceptedSha', 'copy', 'prune', 'keep', 'overlay', 'policy', 'requiredPaths'];
  if (!config || config.schemaVersion !== 1 || Object.keys(config).some(key => !configKeys.includes(key)) || ['repository', 'acceptedSha', 'overlay'].some(key => config[key] !== accepted[key]) || !matches(config.copy, copy) || !matches(config.prune, prune) || !matches(config.keep, []) || !matches(config.requiredPaths, requiredPaths)) reject();
  const overlay = await readJson(accepted.overlay);

  // Read immutable Git objects as data; never import candidate configuration or scripts.
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const ref = accepted.acceptedSha;
  if (git('rev-parse', `${ref}^{commit}`).toString().trim() !== ref) reject();
  const retained = new Map();
  for (const entry of git('ls-tree', '-r', '-z', ref).toString('utf8').split('\0').filter(Boolean)) {
    const split = entry.indexOf('\t');
    const [mode, type, sha] = entry.slice(0, split).split(' ');
    const file = safePath(entry.slice(split + 1));
    if (!copy.some(prefix => inside(file, prefix)) || prune.some(prefix => inside(file, prefix))) continue;
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) reject();
    retained.set(file, sha);
  }
  for (const prefix of copy) if (![...retained.keys()].some(file => inside(file, prefix))) reject();
  for (const file of requiredPaths) {
    if (!retained.has(file) || Number(git('cat-file', '-s', retained.get(file)).toString().trim()) <= 0) reject();
  }
  const provenance = await vendor({ repository, config, overlay, ref, role: 'candidate', output: path.join(website, 'vendor-candidate'), localRoot: root });
  return { status: 'MATERIALIZED_UNVALIDATED_SITE', provenance };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2 || Object.hasOwn(process.env, 'UPSTREAM_HEAD')) reject();
    const result = await materializeCandidate({ repository: process.env.UPSTREAM_REPO_DIR });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch {
    process.stderr.write('Candidate materialization failed; check approved inputs.\n');
    process.exitCode = 1;
  }
}
