// Authored inert fixture only. No candidate/package code, shell or connections.
import fs from 'node:fs';
import os from 'node:os';
import process from 'node:process';

function demand(condition) { if (!condition) throw new Error('Inert Node fixture rejected.'); }
function pathAllowed(value) {
  return typeof value === 'string' && value.startsWith('/') && value !== '/' && value.length <= 4096
    && !/[\0\r\n,]/.test(value) && value.slice(1).split('/').every(part => part && part !== '.' && part !== '..');
}
function errno(error) { demand(Number.isInteger(error?.errno) && error.errno !== 0); return Math.abs(error.errno); }
function invalidFile() { const error = new Error('Ordinary owned fixture required.'); error.errno = -22; throw error; }
function readControl(file, expected) {
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    if (!fs.fstatSync(fd).isFile()) invalidFile();
    const bytes = Buffer.alloc(64);
    let used = 0;
    while (used < bytes.length) {
      const count = fs.readSync(fd, bytes, used, bytes.length - used, null);
      if (!count) break;
      used += count;
    }
    return { ok: used < bytes.length && bytes.subarray(0, used).equals(Buffer.from(expected)), errno: used < bytes.length && bytes.subarray(0, used).equals(Buffer.from(expected)) ? 0 : 22 };
  } catch (error) { return { ok: false, errno: errno(error) }; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
function writeControl(file, body, create = false) {
  let fd;
  try {
    const flags = fs.constants.O_WRONLY | fs.constants.O_NOFOLLOW | (create ? fs.constants.O_CREAT | fs.constants.O_EXCL : 0);
    fd = fs.openSync(file, flags, 0o600);
    if (!fs.fstatSync(fd).isFile()) invalidFile();
    fs.ftruncateSync(fd, 0);
    const bytes = Buffer.from(body);
    let used = 0;
    while (used < bytes.length) { const count = fs.writeSync(fd, bytes, used, bytes.length - used); demand(count > 0); used += count; }
    return 0;
  } catch (error) { return errno(error); }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
function selectedStatus() {
  const status = fs.readFileSync('/proc/self/status', 'utf8'); // Own selected metadata only; never emitted wholesale.
  function field(name, pattern) {
    const matches = [...status.matchAll(new RegExp(`^${name}:\\s+(${pattern})\\s*$`, 'gm'))];
    demand(matches.length === 1);
    return matches[0][1];
  }
  function cap(name) { const value = BigInt(`0x${field(name, '[0-9a-fA-F]+')}`); demand(value <= BigInt(Number.MAX_SAFE_INTEGER)); return Number(value); }
  return { effectiveCaps: cap('CapEff'), permittedCaps: cap('CapPrm'), inheritableCaps: cap('CapInh'), noNewPrivs: Number(field('NoNewPrivs', '[0-9]+')), seccomp: Number(field('Seccomp', '[0-9]+')) };
}
try {
  demand(process.platform === 'linux' && process.arch === 'x64' && Number(process.versions.node.split('.')[0]) === 24);
  demand(process.argv.length === 7);
  const [mode, input, output, rootControl, hostCanary] = process.argv.slice(2);
  demand(mode === 'host-positive' || mode === 'contained');
  const paths = [input, output, rootControl, hostCanary];
  demand(paths.every(pathAllowed) && new Set(paths).size === 4);
  if (mode === 'contained') demand(input === '/input/readable' && output === '/output/result.txt' && rootControl === '/root-write-control');
  const uid = process.getuid(), gid = process.getgid();
  demand(uid > 0 && gid > 0);
  const network = os.networkInterfaces();
  const names = Object.keys(network).filter(name => Array.isArray(network[name]) && network[name].length > 0);
  const interfaces = names.length;
  const nonLoopback = names.filter(name => network[name].some(item => item.internal === false)).length; // No address fields read or emitted.
  const ownStatus = selectedStatus();
  const fakeEnv = Object.hasOwn(process.env, 'FIXTURE_FAKE_TOKEN');
  const envKeys = Object.keys(process.env).sort();
  const inputRead = readControl(input, 'readable-input\n');
  const allowedRead = inputRead.ok;
  const allowedWrite = writeControl(output, 'controlled-output\n', true) === 0;
  const hostReadResult = readControl(hostCanary, 'owned-host-canary\n');
  const hostRead = hostReadResult.ok;
  const inputWriteErrno = writeControl(input, 'control-write\n');
  const rootWriteErrno = writeControl(rootControl, 'control-write\n');
  const hostWriteErrno = writeControl(hostCanary, 'control-write\n');
  const hostReadErrno = hostReadResult.errno;
  process.stdout.write(`${JSON.stringify({ mode, node: process.version, uid, gid, pid: process.pid, allowedRead, allowedWrite, hostRead, inputWriteErrno, rootWriteErrno, hostReadErrno, hostWriteErrno, interfaces, nonLoopback, ...ownStatus, fakeEnv, envKeys })}\n`);
  const hostPassed = allowedRead && allowedWrite && hostRead && inputWriteErrno === 0 && rootWriteErrno === 0 && hostWriteErrno === 0 && nonLoopback >= 1 && fakeEnv;
  const containedPassed = process.pid === 1 && allowedRead && allowedWrite && !hostRead && inputWriteErrno === 30 && rootWriteErrno === 30 && hostReadErrno === 2 && hostWriteErrno === 2 && interfaces >= 1 && nonLoopback === 0 && ownStatus.effectiveCaps === 0 && ownStatus.permittedCaps === 0 && ownStatus.inheritableCaps === 0 && ownStatus.noNewPrivs === 1 && ownStatus.seccomp === 2 && !fakeEnv && JSON.stringify(envKeys) === JSON.stringify(['FIXTURE_VISIBLE', 'HOME', 'HOSTNAME', 'PATH']);
  process.exitCode = (mode === 'host-positive' ? hostPassed : containedPassed) ? 0 : 1;
} catch { process.stderr.write('Inert Node confinement fixture failed.\n'); process.exitCode = 1; }
