import { lstat, readFile, readdir } from 'node:fs/promises';
import { digest, safePath } from './vendor-upstream.mjs';
const root = 'website/vendor-generated';
const config = JSON.parse(await readFile('website/vendor.config.json', 'utf8'));
const overlay = JSON.parse(await readFile(config.overlay, 'utf8'));
const baseline = JSON.parse(await readFile('website/upstream-baseline.json', 'utf8'));
if (config.acceptedSha !== baseline.ref) throw new Error('Vendor accepted SHA must match the reviewed site baseline');
const manifest = JSON.parse(await readFile(`${root}/provenance.json`, 'utf8'));
if (manifest.role !== 'accepted' || manifest.upstreamSha !== config.acceptedSha || manifest.repository !== config.repository || manifest.configDigest !== digest(JSON.stringify(config)) || manifest.overlayDigest !== digest(JSON.stringify(overlay)) || manifest.overlayRuleCount !== overlay.rules.length || manifest.contentDigest !== digest(JSON.stringify(manifest.files)) || manifest.fileCount !== manifest.files.length) throw new Error('Vendor provenance does not match accepted configuration');
async function inventory(dir, prefix = '') {
  const paths = [];
  for (const name of await readdir(dir)) {
    const relative = prefix ? `${prefix}/${name}` : name;
    const stat = await lstat(`${dir}/${name}`);
    if (stat.isSymbolicLink() || (!stat.isDirectory() && !stat.isFile())) throw new Error('Vendor tree must contain ordinary files only');
    if (stat.isDirectory()) paths.push(...await inventory(`${dir}/${name}`, relative));
    else if (relative !== 'provenance.json') paths.push(relative);
  }
  return paths.sort();
}
if (JSON.stringify(await inventory(root)) !== JSON.stringify(manifest.files.map(file => file.path).sort())) throw new Error('Stale or missing generated vendor files');
for (const file of manifest.files) {
  safePath(file.path);
  const bytes = await readFile(`${root}/${file.path}`);
  if (bytes.length !== file.bytes || digest(bytes) !== file.sha256) throw new Error(`Vendor drift: ${file.path}`);
}
console.log(`Validated ${manifest.fileCount} generated upstream files at ${manifest.upstreamSha}.`);
