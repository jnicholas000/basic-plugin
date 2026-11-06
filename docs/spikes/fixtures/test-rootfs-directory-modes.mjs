// Independent Odo regression: owned tiny data tree only, frozen before producer.
// Never imports a controller/main, executes target code, or calls external commands.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const source = fs.readFileSync(new URL('./run-npm-same-job-control.mjs', import.meta.url), 'utf8');
const mkdirStatement = 'mutateFs(() => fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 }));';
const rootModeStatement = 'fs.chmodSync(dirs.rootfs, 0o755);';
const configMkdirStatement = "mutateFs(() => fs.mkdirSync(path.join(dirs.rootfs, 'config'), { mode: 0o755 }));";
const configWriteStatement = "for (const name of ['user.npmrc', 'global.npmrc']) mutateFs(() => fs.writeFileSync(path.join(dirs.rootfs, 'config', name), '', { flag: 'wx', mode: 0o444 }));";
for (const statement of [mkdirStatement, rootModeStatement, configMkdirStatement, configWriteStatement]) {
  assert.ok(source.includes(statement), 'test extracts an actual source statement, not rewritten behavior');
}
const helperUrl = new URL('./owned-rootfs-modes.mjs', import.meta.url);
const helper = fs.existsSync(helperUrl) ? await import(helperUrl) : null;
const normalize = helper?.normalizeOwnedRootfsModes;
const classify = helper?.classifyOwnedStartupError;
if (helper) {
  assert.equal(typeof normalize, 'function');
  assert.equal(typeof classify, 'function');
}
const required = ['', 'runtime', 'lib', 'lib64', 'lib/x86_64-linux-gnu', 'npm', 'npm/bin', 'config'];
const configFiles = ['config/user.npmrc', 'config/global.npmrc'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const mode = file => fs.lstatSync(file).mode & 0o777;
const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function fixture(run) {
  const oldMask = process.umask(0o077);
  let parent;
  try {
    parent = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'owned-rootfs-mode-')));
    fs.chmodSync(parent, 0o700);
    const dirs = Object.fromEntries(['rootfs', 'input', 'output'].map(name => [name, path.join(parent, name)]));
    for (const directory of Object.values(dirs)) fs.mkdirSync(directory, { mode: 0o700 });
    for (const name of ['input', 'output']) fs.writeFileSync(path.join(dirs[name], 'owned.txt'), `inert-${name}\n`, { mode: 0o600 });
    const initial = fs.lstatSync(dirs.rootfs);
    const identity = { dev: initial.dev, ino: initial.ino };
    const context = vm.createContext({ fs, path, dirs, mutateFs: fn => fn() });
    vm.runInContext(rootModeStatement, context);
    const payloads = [
      ['runtime/node', 0o555], ['lib64/ld-linux-x86-64.so.2', 0o555],
      ['lib/x86_64-linux-gnu/libc.so.6', 0o555], ['npm/bin/npm-cli.js', 0o444],
      ['npm/lib/cli.js', 0o444], ['npm/node_modules/owned/index.js', 0o444],
      ['npm-probe.mjs', 0o444], ['lifecycle-observer.mjs', 0o555],
    ];
    for (const [relative, fileMode] of payloads) {
      context.destination = path.join(dirs.rootfs, relative);
      vm.runInContext(mkdirStatement, context);
      fs.writeFileSync(context.destination, `/* inert owned payload ${relative} */\n`, { flag: 'wx', mode: 0o600 });
      fs.chmodSync(context.destination, fileMode);
    }
    vm.runInContext(configMkdirStatement, context);
    vm.runInContext(configWriteStatement, context);
    const expectedDirectories = new Set(['']);
    for (const relative of [...payloads.map(([name]) => name), ...configFiles]) {
      const parts = relative.split('/');
      for (let i = 1; i < parts.length; i++) expectedDirectories.add(parts.slice(0, i).join('/'));
    }
    const files = [...payloads.map(([name]) => name), ...configFiles];
    return run({ parent, dirs, identity, expectedDirectories: [...expectedDirectories], files,
      normalize: () => normalize?.(dirs.rootfs, identity, [...expectedDirectories], () => {}) });
  } finally {
    process.umask(oldMask);
    if (parent) fs.rmSync(parent, { recursive: true, force: false });
  }
}

function treeSnapshot(root) {
  const records = [];
  function walk(file, relative) {
    const st = fs.lstatSync(file);
    const record = { path: relative, mode: st.mode & 0o777, dev: st.dev, ino: st.ino };
    if (st.isSymbolicLink()) record.link = fs.readlinkSync(file);
    else if (st.isFile()) record.sha256 = sha(fs.readFileSync(file));
    else assert.ok(st.isDirectory(), 'owned fixture contains only regular data and directories');
    records.push(record);
    if (st.isDirectory()) for (const name of fs.readdirSync(file).sort(ascii)) walk(path.join(file, name), relative ? `${relative}/${name}` : name);
  }
  walk(root, '');
  return records;
}

test('actual source requests become 0700 directories and 0400 configs under 077', () => fixture(f => {
  assert.equal(mode(f.dirs.rootfs), 0o755);
  for (const directory of f.expectedDirectories.filter(Boolean)) assert.equal(mode(path.join(f.dirs.rootfs, directory)), 0o700);
  for (const config of configFiles) assert.equal(mode(path.join(f.dirs.rootfs, config)), 0o400);
  // Tar's root-owned payload is intended for a different nonroot UID; inspect mode bits only.
  assert.equal((mode(path.join(f.dirs.rootfs, 'runtime')) & 0o001) !== 0, false);
  assert.equal((mode(path.join(f.dirs.rootfs, configFiles[0])) & 0o004) !== 0, false);
}));

test('owned rootfs directory correction makes the complete planned tree 0755', () => fixture(f => {
  f.normalize(); // Before producer exists this is intentionally a no-op, so real0700 fails.
  assert.deepEqual(f.expectedDirectories.map(relative => [relative, mode(path.join(f.dirs.rootfs, relative))]),
    f.expectedDirectories.map(relative => [relative, 0o755]));
  assert.equal((mode(path.join(f.dirs.rootfs, 'runtime')) & 0o001) !== 0, true);
}));

test('owned empty config correction makes both exact config files 0444', () => fixture(f => {
  f.normalize();
  assert.deepEqual(configFiles.map(relative => [relative, mode(path.join(f.dirs.rootfs, relative))]),
    configFiles.map(relative => [relative, 0o444]));
  assert.equal((mode(path.join(f.dirs.rootfs, configFiles[0])) & 0o004) !== 0, true);
}));

test('normalization preserves payloads, private siblings, umask and exact bounded summary', { skip: !normalize }, () => fixture(f => {
  const before = treeSnapshot(f.parent), oldMask = process.umask();
  const summary = f.normalize();
  assert.equal(process.umask(), oldMask);
  const after = treeSnapshot(f.parent);
  const allowedDirectories = new Set(f.expectedDirectories.map(relative => relative ? `rootfs/${relative}` : 'rootfs'));
  assert.deepEqual(after, before.map(record => ({ ...record,
    mode: allowedDirectories.has(record.path) ? 0o755 : configFiles.map(name => `rootfs/${name}`).includes(record.path) ? 0o444 : record.mode })));
  const records = f.expectedDirectories.sort(ascii).map(relative => ({ path: relative, mode: 0o755 }));
  assert.deepEqual(summary, { count: records.length, sha256: sha(`${JSON.stringify(records)}\n`),
    required: required.map(relative => ({ path: relative, mode: 0o755 })),
    configFiles: configFiles.map(relative => ({ path: relative, mode: 0o444 })) });
}));

test('wrong pin, unsafe directory list and replacement root reject before mutation', { skip: !normalize }, () => fixture(f => {
  const before = treeSnapshot(f.parent);
  for (const [pin, directories] of [
    [{ ...f.identity, ino: f.identity.ino + 1 }, f.expectedDirectories],
    [f.identity, [...f.expectedDirectories, '../foreign']], [f.identity, [...f.expectedDirectories, '/foreign']],
    [f.identity, [...f.expectedDirectories, 'npm/../foreign']], [f.identity, [...f.expectedDirectories, 'npm']],
    [f.identity, f.expectedDirectories.filter(name => name !== '')],
    [f.identity, [...f.expectedDirectories, Array(35).fill('deep').join('/')]],
    [f.identity, [...f.expectedDirectories, ...Array.from({ length: 8209 }, (_, i) => `many-${i}`)]],
  ]) {
    assert.throws(() => normalize(f.dirs.rootfs, pin, directories, () => {}));
    assert.deepEqual(treeSnapshot(f.parent), before);
  }
  fs.renameSync(f.dirs.rootfs, `${f.dirs.rootfs}-original`);
  fs.mkdirSync(f.dirs.rootfs, { mode: 0o700 });
  const replacement = treeSnapshot(f.parent);
  assert.throws(() => normalize(f.dirs.rootfs, f.identity, f.expectedDirectories, () => {}));
  assert.deepEqual(treeSnapshot(f.parent), replacement);
}));

test('symlinks and extra or missing directories reject without partial chmod', { skip: !normalize }, () => {
  for (const [kind, change] of [
    ['symlink', f => fs.symlinkSync(f.dirs.input, path.join(f.dirs.rootfs, 'foreign-link'))],
    ['extra', f => fs.mkdirSync(path.join(f.dirs.rootfs, 'extra'), { mode: 0o700 })],
    ['missing', f => fs.rmdirSync(path.join(f.dirs.rootfs, 'npm/node_modules/owned'))],
  ]) fixture(f => {
    if (kind === 'missing') fs.unlinkSync(path.join(f.dirs.rootfs, 'npm/node_modules/owned/index.js'));
    change(f);
    const before = treeSnapshot(f.parent);
    assert.throws(() => f.normalize());
    assert.deepEqual(treeSnapshot(f.parent), before);
  });
});

test('nonempty, hard-linked, missing and replaced configs reject before chmod', { skip: !normalize }, () => {
  for (const kind of ['nonempty', 'hardlink', 'missing', 'symlink']) fixture(f => {
    const file = path.join(f.dirs.rootfs, configFiles[0]);
    if (kind === 'nonempty') { fs.chmodSync(file, 0o600); fs.writeFileSync(file, 'unapproved-config\n'); }
    if (kind === 'hardlink') fs.linkSync(file, path.join(f.parent, 'linked-config'));
    if (kind === 'missing' || kind === 'symlink') fs.unlinkSync(file);
    if (kind === 'symlink') fs.symlinkSync(path.join(f.dirs.input, 'owned.txt'), file);
    const before = treeSnapshot(f.parent);
    assert.throws(() => f.normalize());
    assert.deepEqual(treeSnapshot(f.parent), before);
  });
});

test('expired deadline and noncanonical root reject without mutation', { skip: !normalize }, () => fixture(f => {
  const before = treeSnapshot(f.parent);
  assert.throws(() => normalize(f.dirs.rootfs, f.identity, f.expectedDirectories, () => { throw new Error('owned-deadline'); }));
  assert.throws(() => normalize(`${f.dirs.rootfs}/../rootfs`, f.identity, f.expectedDirectories, () => {}));
  const alias = path.join(f.parent, 'root-alias'); fs.symlinkSync(f.dirs.rootfs, alias);
  const withAlias = treeSnapshot(f.parent);
  assert.throws(() => normalize(alias, f.identity, f.expectedDirectories, () => {}));
  assert.deepEqual(treeSnapshot(f.parent), withAlias);
  fs.unlinkSync(alias); assert.deepEqual(treeSnapshot(f.parent), before);
}));

test('native startup classification emits only bounded explicit error enums', { skip: !classify }, () => {
  const denied = 'OCI runtime create failed: unable to start container process: exec: "/runtime/node": permission denied: unknown';
  const missing = 'OCI runtime create failed: exec: "/runtime/node": stat /runtime/node: no such file or directory: unknown';
  assert.equal(classify(denied), 'PERMISSION_DENIED_REPORTED');
  assert.equal(classify(Buffer.from(missing)), 'NOT_FOUND_REPORTED');
  for (const text of [null, {}, 1, '/runtime/node exists but permission denied elsewhere',
    'exec: "/other/node": permission denied', 'permission denied', 'exec: "/runtime/node": ambiguous',
    `exec: "/runtime/node": permission denied; no such file or directory`, 'x'.repeat(65537)]) {
    assert.equal(classify(text), 'UNCLASSIFIED');
  }
});

test('ancestor redirection after preflight cannot chmod a moved directory outside rootfs', { skip: !normalize }, () => fixture(f => {
  const npm = path.join(f.dirs.rootfs, 'npm');
  const originalNpm = fs.lstatSync(npm);
  const moved = path.join(f.parent, 'moved-owned-npm');
  const originalFchmod = fs.fchmodSync;
  let npmChmodCompleted = false, checksAfterNpm = 0, swapped = false;
  fs.fchmodSync = (fd, nextMode) => {
    const held = fs.fstatSync(fd);
    originalFchmod(fd, nextMode);
    if (held.dev === originalNpm.dev && held.ino === originalNpm.ino) npmChmodCompleted = true;
  };
  const checkDeadline = () => {
    if (!npmChmodCompleted || swapped) return;
    checksAfterNpm++;
    // The first callback checks npm after its chmod; the next begins a later entry check.
    if (checksAfterNpm === 2) {
      fs.renameSync(npm, moved);
      fs.symlinkSync(moved, npm);
      swapped = true;
    }
  };
  try {
    assert.throws(() => normalize(f.dirs.rootfs, f.identity, f.expectedDirectories, checkDeadline));
    assert.equal(swapped, true, 'the controlled ancestor replacement must actually occur');
    assert.equal(mode(path.join(moved, 'bin')), 0o700,
      'a final-component NOFOLLOW must not permit chmod through a redirected ancestor');
  } finally {
    fs.fchmodSync = originalFchmod;
  }
}));
