// DO_NOT_COPY: mode correction for the exclusively owned inert npm rootfs only.
// Import is inert. No runtime, container, subprocess, umask or host permission change.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const requireFact = value => { if (!value) throw new Error('owned-rootfs-mode-requirement'); };
const requiredDirectories = ['', 'runtime', 'lib', 'lib64', 'lib/x86_64-linux-gnu', 'npm', 'npm/bin', 'config'];
const configPaths = ['config/user.npmrc', 'config/global.npmrc'];
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const sameIdentity = (a, b) => a.dev === b.dev && a.ino === b.ino;
const safeRelative = value => typeof value === 'string' && Buffer.byteLength(value) <= 4096
  && !/[\x00-\x1f\x7f\\]/.test(value) && (value === '' || (value.split('/').length <= 34
    && value.split('/').every(part => part && part !== '.' && part !== '..') && !path.isAbsolute(value)));

export function normalizeOwnedRootfsModes(root, expectedIdentity, expectedDirectories, checkDeadline) {
  requireFact(typeof root === 'string' && path.isAbsolute(root) && root !== '/' && path.normalize(root) === root
    && typeof checkDeadline === 'function' && expectedIdentity && typeof expectedIdentity === 'object'
    && !Array.isArray(expectedIdentity) && Object.keys(expectedIdentity).length === 2
    && Number.isSafeInteger(expectedIdentity.dev) && Number.isSafeInteger(expectedIdentity.ino)
    && expectedIdentity.dev >= 0 && expectedIdentity.ino >= 0 && typeof process.getuid === 'function');
  requireFact(Array.isArray(expectedDirectories) && expectedDirectories.length > 0 && expectedDirectories.length <= 8208
    && expectedDirectories.every(safeRelative));
  const expected = new Set(expectedDirectories);
  requireFact(expected.size === expectedDirectories.length && requiredDirectories.every(relative => expected.has(relative)));
  const uid = process.getuid(), entries = new Map();
  let visited = 0, rootFd;
  const checkRoot = () => {
    checkDeadline();
    requireFact(fs.realpathSync(root) === root);
    const stat = fs.lstatSync(root);
    requireFact(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === uid && sameIdentity(stat, expectedIdentity));
    if (rootFd !== undefined) requireFact(sameIdentity(fs.fstatSync(rootFd), expectedIdentity));
  };
  const checkEntry = (relative, before) => {
    checkRoot();
    const current = fs.lstatSync(path.join(root, relative));
    requireFact(!current.isSymbolicLink() && sameIdentity(current, before) && current.uid === uid
      && current.isDirectory() === before.isDirectory() && current.isFile() === before.isFile());
    return current;
  };
  const walk = (relative, depth) => {
    checkDeadline(); requireFact(depth <= 34 && ++visited <= 8208 && safeRelative(relative));
    const file = path.join(root, relative), stat = fs.lstatSync(file);
    requireFact(!stat.isSymbolicLink() && stat.uid === uid && (stat.isDirectory() || stat.isFile()));
    entries.set(relative, stat);
    if (stat.isDirectory()) {
      requireFact(expected.has(relative));
      const names = fs.readdirSync(file).sort(order);
      requireFact(names.length <= 8208);
      for (const name of names) walk(relative ? `${relative}/${name}` : name, depth + 1);
    }
  };
  const chmodOwned = (relative, before, mode) => {
    checkEntry(relative, before);
    const flags = fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW
      | (before.isDirectory() ? fs.constants.O_DIRECTORY : 0);
    const fd = fs.openSync(path.join(root, relative), flags);
    try {
      const held = fs.fstatSync(fd);
      requireFact(sameIdentity(held, before) && held.uid === uid && held.isDirectory() === before.isDirectory()
        && held.isFile() === before.isFile());
      if (before.isFile()) requireFact(held.nlink === 1 && held.size === 0);
      checkEntry(relative, before); checkDeadline();
      fs.fchmodSync(fd, mode);
      requireFact((fs.fstatSync(fd).mode & 0o777) === mode);
      requireFact((checkEntry(relative, before).mode & 0o777) === mode);
    } finally { fs.closeSync(fd); }
  };
  try {
    checkRoot();
    rootFd = fs.openSync(root, fs.constants.O_RDONLY | fs.constants.O_DIRECTORY | fs.constants.O_NOFOLLOW);
    checkRoot(); walk('', 0);
    const directories = [...entries].filter(([, stat]) => stat.isDirectory()).map(([relative]) => relative).sort(order);
    requireFact(directories.length === expected.size && directories.every(relative => expected.has(relative)));
    const records = directories.map(relative => ({ path: relative, mode: 0o755 }));
    const encoded = `${JSON.stringify(records)}\n`;
    requireFact(Buffer.byteLength(encoded) <= 1048576);
    for (const relative of configPaths) {
      const stat = entries.get(relative);
      requireFact(stat?.isFile() && stat.uid === uid && stat.nlink === 1 && stat.size === 0);
      checkEntry(relative, stat);
    }
    // Complete-tree and both config preflight precede the first permission mutation.
    for (const relative of directories) chmodOwned(relative, entries.get(relative), 0o755);
    for (const relative of configPaths) chmodOwned(relative, entries.get(relative), 0o444);
    for (const [relative, before] of entries) {
      const after = checkEntry(relative, before);
      if (before.isDirectory()) requireFact((after.mode & 0o777) === 0o755);
      else if (configPaths.includes(relative)) requireFact((after.mode & 0o777) === 0o444 && after.size === 0 && after.nlink === 1);
      else requireFact(after.mode === before.mode && after.size === before.size && after.nlink === before.nlink
        && after.mtimeMs === before.mtimeMs);
    }
    return { count: records.length, sha256: createHash('sha256').update(encoded).digest('hex'),
      required: requiredDirectories.map(relative => ({ path: relative, mode: 0o755 })),
      configFiles: configPaths.map(relative => ({ path: relative, mode: 0o444 })) };
  } finally { if (rootFd !== undefined) fs.closeSync(rootFd); }
}

export function classifyOwnedStartupError(stderr) {
  let text;
  if (Buffer.isBuffer(stderr)) {
    if (stderr.length > 65536) return 'UNCLASSIFIED';
    text = stderr.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(stderr)) return 'UNCLASSIFIED';
  } else if (typeof stderr === 'string' && Buffer.byteLength(stderr) <= 65536) {
    text = stderr;
    if (Buffer.from(text, 'utf8').toString('utf8') !== text) return 'UNCLASSIFIED';
  } else return 'UNCLASSIFIED';
  const denied = /permission denied/i.test(text), missing = /no such file or directory|not found/i.test(text);
  if (denied === missing) return 'UNCLASSIFIED';
  const native = /\bexec:\s*"\/runtime\/node":\s*(?:stat \/runtime\/node:\s*)?(permission denied|no such file or directory|not found)(?:: unknown)?\s*$/i.exec(text);
  if (!native) return 'UNCLASSIFIED';
  return /^permission denied$/i.test(native[1]) ? 'PERMISSION_DENIED_REPORTED' : 'NOT_FOUND_REPORTED';
}
