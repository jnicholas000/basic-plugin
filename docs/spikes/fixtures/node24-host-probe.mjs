// Owned host-runtime availability control; no confinement or package qualification.
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
assert.equal(process.argv.length, 2);
assert.equal(process.platform, 'linux');
assert.equal(process.arch, 'x64');
assert.equal(Number(process.versions.node.split('.')[0]), 24);
const uid = process.getuid(), gid = process.getgid();
assert.ok(uid > 0 && gid > 0);
const cwd = process.cwd(), envKeys = Object.keys(process.env).sort();
assert.deepEqual(envKeys, ['HOME', 'OPENSSL_CONF', 'PATH', 'TMPDIR']);
assert.ok(!Object.hasOwn(process.env, 'NODE_OPTIONS'));
assert.ok(process.env.HOME === path.join(cwd, 'home'));
assert.ok(process.env.TMPDIR === path.join(cwd, 'tmp'));
const marker = path.join(cwd, 'owned-runtime-marker');
const body = Buffer.from('owned-node-runtime-fixture\n');
let syntheticSha512;
writeFileSync(marker, body, { flag: 'wx', mode: 0o600 });
try {
  const readback = readFileSync(marker);
  assert.deepEqual(readback, body);
  syntheticSha512 = createHash('sha512').update(readback).digest('hex');
  assert.equal(syntheticSha512, createHash('sha512').update(body).digest('hex'));
} finally { unlinkSync(marker); }
assert.equal(existsSync(marker), false);
process.stdout.write(`${JSON.stringify({ status: 'INERT_NODE24_HOST_PROBE_PASSED', node: process.version, platform: process.platform, arch: process.arch, uid, gid, envKeys, markerRemoved: true, syntheticSha512 })}\n`);
