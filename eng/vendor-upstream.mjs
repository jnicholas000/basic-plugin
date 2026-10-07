import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function safePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes('\0') || path.posix.isAbsolute(value) || value.split('/').some(p => p === '..' || p === '.' || !p)) throw new Error(`Unsafe path: ${value}`);
  return value;
}
const inside = (file, root) => file === root || file.startsWith(`${root}/`);
export function applyOverlay(files, overlay, sources) {
  const result = new Map(files);
  const names = new Set();
  for (const rule of overlay.rules) {
    safePath(rule.target);
    if (!rule.name || names.has(rule.name) || !rule.intent) throw new Error('Overlay rules require unique names and intent');
    names.add(rule.name);
    const before = result.get(rule.target);
    if (before === undefined) {
      if (rule.allowMissing === true) continue;
      throw new Error(`Missing overlay target: ${rule.target}`);
    }
    if (rule.operation === 'replaceFile') {
      safePath(rule.source);
      if (!sources.has(rule.source)) throw new Error(`Missing overlay source: ${rule.source}`);
      result.set(rule.target, sources.get(rule.source));
    } else if (rule.operation === 'replaceText') {
      const text = before.toString('utf8');
      if (typeof rule.expected !== 'string' || !rule.expected || typeof rule.replacement !== 'string' || text.split(rule.expected).length !== 2) throw new Error(`Overlay match must occur exactly once: ${rule.name}`);
      result.set(rule.target, Buffer.from(text.replace(rule.expected, rule.replacement)));
    } else throw new Error(`Unknown overlay operation: ${rule.operation}`);
  }
  return result;
}
export async function vendor({ repository, config, overlay, ref = config.acceptedSha, role = 'accepted', output, localRoot = process.cwd() }) {
  if (!/^[0-9a-f]{40}$/.test(ref) || !['accepted', 'candidate'].includes(role) || (role === 'accepted' && ref !== config.acceptedSha)) throw new Error('Invalid immutable ref or provenance role');
  for (const value of [...config.copy, ...config.prune, ...config.keep]) safePath(value);
  const git = (...args) => execFileSync('git', ['-C', repository, ...args], { maxBuffer: 64 * 1024 * 1024 });
  if (git('rev-parse', `${ref}^{commit}`).toString().trim() !== ref) throw new Error('Ref is not an exact commit');
  const entries = git('ls-tree', '-r', '-z', ref).toString('utf8').split('\0').filter(Boolean);
  const files = new Map();
  for (const entry of entries) {
    const split = entry.indexOf('\t');
    const [mode, type, sha] = entry.slice(0, split).split(' ');
    const file = safePath(entry.slice(split + 1));
    if (!config.copy.some(root => inside(file, root))) continue;
    if (config.prune.some(root => inside(file, root)) && !config.keep.some(root => inside(file, root))) continue;
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) throw new Error(`Unsupported vendor entry: ${file}`);
    files.set(file, git('cat-file', 'blob', sha));
  }
  for (const root of config.copy) if (!entries.some(e => inside(e.slice(e.indexOf('\t') + 1), root))) throw new Error(`Missing copied root: ${root}`);
  const sources = new Map();
  for (const rule of overlay.rules) if (rule.source) {
    safePath(rule.source);
    const source = path.join(localRoot, rule.source);
    const resolvedSource = await realpath(source);
    const resolvedRoot = await realpath(localRoot);
    if (!resolvedSource.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error(`Overlay source escapes local root: ${rule.source}`);
    if (!(await lstat(source)).isFile()) throw new Error(`Overlay source must be an ordinary file: ${rule.source}`);
    sources.set(rule.source, await readFile(source));
  }
  const overlaid = applyOverlay(files, overlay, sources);
  const inventory = [...overlaid].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, bytes]) => ({ path: file, sha256: digest(bytes), bytes: bytes.length }));
  const overlaySources = [...sources].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([file, bytes]) => ({ path: file, sha256: digest(bytes), bytes: bytes.length }));
  const provenance = { schemaVersion: 1, overlaySources, repository: config.repository, upstreamSha: ref, role, copy: config.copy, prune: config.prune, keep: config.keep, overlayRuleCount: overlay.rules.length, configDigest: digest(JSON.stringify(config)), overlayDigest: digest(JSON.stringify(overlay)), fileCount: inventory.length, contentDigest: digest(JSON.stringify(inventory)), files: inventory };
  const target = path.resolve(output);
  if (target === path.resolve(localRoot) || !target.startsWith(`${path.resolve(localRoot)}${path.sep}`)) throw new Error('Output must be an owned child of localRoot');
  const staging = `${target}.staging`;
  await rm(staging, { recursive: true, force: true });
  for (const [file, bytes] of overlaid) {
    await mkdir(path.dirname(path.join(staging, file)), { recursive: true });
    await writeFile(path.join(staging, file), bytes);
  }
  await mkdir(staging, { recursive: true });
  await writeFile(path.join(staging, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`);
  await rm(target, { recursive: true, force: true });
  await rename(staging, target);
  return provenance;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = JSON.parse(await readFile('website/vendor.config.json', 'utf8'));
  const overlay = JSON.parse(await readFile(config.overlay, 'utf8'));
  if (!process.env.UPSTREAM_REPO_DIR) throw new Error('UPSTREAM_REPO_DIR is required; no network/install/build commands are run');
  await vendor({ repository: process.env.UPSTREAM_REPO_DIR, config, overlay, ref: process.env.UPSTREAM_HEAD || config.acceptedSha, role: process.env.UPSTREAM_HEAD ? 'candidate' : 'accepted', output: process.env.UPSTREAM_HEAD ? 'website/vendor-candidate' : 'website/vendor-generated' });
}
