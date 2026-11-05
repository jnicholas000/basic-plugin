"""DO_NOT_COPY: guarded one-transfer byte/layout experiment; never execute target code."""
import hashlib
import http.client
import importlib.util
import json
import os
from pathlib import Path
import platform
import signal
import select
import ssl
import stat
import subprocess
import sys
import tarfile
import time

MODULE_SHA = 'cd18361c2d6683b4ed7e3214938b5cd4e7c600d782b37b6fd1b429ce6f32aa02'
TEST_SHA = '17227f195521585826b485866773c4abb6568ad7efc2a6344b699b0762839af1'
OWNERSHIP_TEST_SHA = 'b0ebcd247d79ef218e6b3a55ee516ea59fab6a3c0a2673ef6509c47f446aa6a9'
PINS = {
    'docs/spikes/fixtures/run-npm-preparation-control.mjs': 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7',
    'docs/spikes/candidate-npm-preparation-first-receipt.json': 'eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e',
    'docs/spikes/candidate-npm-prerequisite-metadata-receipt.json': '98a50ed171e884f20384c31fc6928c4cd07a4bc29b9d28fcd81a41dec7cfd2cc'}
CACHE = Path('/opt/hostedtoolcache/node/24.22.1/x64')
MARKER = Path(str(CACHE) + '.complete')
MAX_DISK = 1288490188
MIB = 1048576
RESERVE = 16*MIB
CHUNK = MIB
BRANCH = 'feat/pinned-node-cache-availability-20261105'


def require(value):
    if not value:
        raise ValueError('pinned-availability-requirement')


def alarm(_signum, _frame):
    raise TimeoutError('pinned-availability-deadline')


class OwnedPaths:
    """Exclusive creation identities, bounded allocation checkpoints, and leaf-first cleanup."""
    def __init__(self, deadline):
        self.deadline = deadline
        self.paths = {}
        self.pending = set()
        self.anchors = {}
        self.blocks = {}
        self.allocated = 0
        self.peak = 0
        self.remaining = 0
        self.operations = 0
        self.uncertain = False

    def check_time(self):
        require(time.monotonic() < self.deadline)

    @staticmethod
    def identity(st):
        return (st.st_dev, st.st_ino, stat.S_IFMT(st.st_mode))

    def pin_anchor(self, path):
        st = os.lstat(path)
        require(stat.S_ISDIR(st.st_mode) and os.path.realpath(path) == str(path))
        self.anchors[path] = self.identity(st)
        fs = os.statvfs(path)
        require(0 < fs.f_frsize <= 4096)

    def verify(self, path):
        for parent, identity in self.anchors.items():
            require(self.identity(os.lstat(parent)) == identity)
        for parent in (path, *path.parents):
            if parent in self.paths:
                require(self.identity(os.lstat(parent)) == self.paths[parent])

    def refresh(self, path):
        self.verify(path)
        st = os.lstat(path)
        allocated = st.st_blocks * 512
        require(allocated >= 0)
        self.allocated += allocated - self.blocks.get(path, 0)
        self.blocks[path] = allocated
        self.peak = max(self.peak, self.allocated)

    def checkpoint(self, next_bytes=0):
        self.check_time()
        require(self.allocated + self.remaining + next_bytes + RESERVE <= MAX_DISK)

    def register(self, path):
        try:
            st = os.lstat(path)
            self.paths[path] = self.identity(st)
            self.pending.discard(path)
            self.refresh(path)
            if path.parent in self.paths:
                self.refresh(path.parent)
            self.operations += 1
            if self.operations % 128 == 0:
                for known in self.paths:
                    self.refresh(known)
            self.checkpoint()
        except BaseException:
            self.uncertain = True
            raise

    def begin(self, allowance):
        self.checkpoint()
        require(self.remaining >= allowance)
        self.remaining -= allowance

    def mkdir(self, path, allowance=0):
        self.check_time()
        self.verify(path.parent)
        if allowance:
            self.begin(allowance)
        self.checkpoint(8192)
        self.pending.add(path)
        try:
            os.mkdir(path, 0o700)
        except FileExistsError:
            # Exclusive creation reports no mutation; this grants no ownership over the path.
            self.pending.discard(path)
            raise
        except BaseException:
            self.uncertain = True
            raise
        self.register(path)

    def create_file(self, path, allowance=0):
        self.check_time()
        self.verify(path.parent)
        if allowance:
            self.begin(allowance)
        self.checkpoint(8192)
        fd = None
        self.pending.add(path)
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
        except FileExistsError:
            self.pending.discard(path)
            raise
        except BaseException:
            self.uncertain = True
            raise
        try:
            self.register(path)
            return fd
        except BaseException:
            os.close(fd)
            raise

    def write(self, path, fd, data):
        self.verify(path)
        self.checkpoint(((len(data)+4095)//4096)*4096 + 4096)
        view = memoryview(data)
        while view:
            self.check_time()
            n = os.write(fd, view)
            require(n > 0)
            view = view[n:]
        self.refresh(path)
        self.checkpoint()

    def symlink(self, path, target):
        self.verify(path.parent)
        self.begin(8192)
        self.checkpoint(8192)
        self.pending.add(path)
        try:
            os.symlink(target, path)
        except FileExistsError:
            self.pending.discard(path)
            raise
        except BaseException:
            self.uncertain = True
            raise
        self.register(path)

    def cleanup(self):
        failures = []
        # Only recorded directory identities may have their new-path modes adjusted for removal.
        for path in sorted(self.paths, key=lambda p: len(p.parts)):
            if self.paths[path][2] == stat.S_IFDIR:
                try:
                    self.check_time()
                    self.verify(path)
                    os.chmod(path, 0o700, follow_symlinks=False)
                except BaseException:
                    failures.append('owned-directory-unavailable')
        for path in sorted(self.paths, key=lambda p: len(p.parts), reverse=True):
            try:
                self.check_time()
                self.verify(path)
                if self.paths[path][2] == stat.S_IFDIR:
                    os.rmdir(path)
                else:
                    os.unlink(path)
                del self.paths[path]
            except BaseException:
                failures.append('owned-path-not-removed')
        self.uncertain = self.uncertain or bool(self.pending) or bool(failures)
        return dict(completed=not self.paths and not self.uncertain, uncertain=self.uncertain,
                    remaining_owned_paths=['OWNED_PATH'] * min(len(set(self.paths) | self.pending), 32))


def hash_file(path, maximum, deadline, expected_identity=None):
    require(time.monotonic() < deadline)
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and before.st_size <= maximum)
    if expected_identity:
        require(OwnedPaths.identity(before) == expected_identity)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        require(OwnedPaths.identity(os.fstat(fd)) == OwnedPaths.identity(before))
        digest, count = hashlib.sha256(), 0
        while True:
            require(time.monotonic() < deadline)
            chunk = os.read(fd, CHUNK)
            if not chunk:
                break
            count += len(chunk)
            require(count <= maximum)
            digest.update(chunk)
        after = os.fstat(fd)
        require(count == before.st_size == after.st_size and before.st_mtime_ns == after.st_mtime_ns
                and before.st_ctime_ns == after.st_ctime_ns)
        return dict(size=count, sha256=digest.hexdigest())
    finally:
        os.close(fd)


def read_bounded(path, maximum, deadline):
    observation = hash_file(path, maximum, deadline)
    with open(path, 'rb') as source:
        data = source.read(maximum+1)
    require(len(data) == observation['size'] and hashlib.sha256(data).hexdigest() == observation['sha256'])
    return data


def git(repo, arguments, deadline):
    # Call sites supply only fixed read-only Git operations, never target or caller-selected commands.
    remaining = min(10, deadline-time.monotonic())
    require(remaining > 0)
    command = ['/usr/bin/git', '--no-lazy-fetch', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', '-C', str(repo), *arguments]
    child = subprocess.Popen(command, env={'PATH': '/usr/bin:/bin', 'HOME': '/nonexistent', 'LC_ALL': 'C',
                                         'GIT_CONFIG_NOSYSTEM': '1', 'GIT_CONFIG_GLOBAL': '/dev/null',
                                         'GIT_TERMINAL_PROMPT': '0', 'GIT_OPTIONAL_LOCKS': '0'},
                             stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    output = bytearray()
    try:
        # A bounded temporary in-memory pipe reader; alarm also bounds a blocked read.
        end = time.monotonic()+remaining
        while True:
            require(time.monotonic() < end)
            readable, _, _ = select.select([child.stdout.fileno()], [], [], max(0, end-time.monotonic()))
            require(readable)
            part = os.read(child.stdout.fileno(), 65536)
            if not part:
                break
            output.extend(part)
            require(len(output) <= 2*MIB)
        require(child.wait(timeout=max(0.001, end-time.monotonic())) == 0)
        return bytes(output)
    finally:
        child.stdout.close()
        if child.poll() is None:
            child.kill()
            child.wait(timeout=1)


def snapshot(repo, deadline):
    names = git(repo, ['ls-files', '-z'], deadline).split(b'\0')
    require(len(names) <= 32769)
    result = {}
    for raw in names:
        if not raw:
            continue
        name = raw.decode('utf-8')
        require(not name.startswith('/') and all(p not in ('', '.', '..') for p in name.split('/')))
        path = repo / name
        st = os.lstat(path)
        require(stat.S_ISREG(st.st_mode))
        result[name] = dict(**hash_file(path, 192*MIB, deadline), mode=stat.S_IMODE(st.st_mode))
    return result


def runtime_records(module, deadline, system_only=False):
    records, observed = [], {}
    for destination, size, digest in module._RUNTIME:
        if destination == '/runtime/node':
            if system_only:
                continue
            source = str(CACHE / 'bin/node')
        else:
            source = '/usr/lib/x86_64-linux-gnu/' + ('libstdc++.so.6.0.33' if destination.endswith('/libstdc++.so.6') else destination.rsplit('/', 1)[1])
        require(os.path.realpath(source) == source)
        if source not in observed:
            observed[source] = hash_file(source, size, deadline)
        require(observed[source] == dict(size=size, sha256=digest))
        records.append(dict(source=source, destination=destination, **observed[source]))
    require(len(observed) == (7 if system_only else 8))
    return records


def cache_records(root, module, deadline):
    records = []
    for name, digest in module._CACHE_HASHES.items():
        observation = hash_file(root / name, 126879696 if name == 'bin/node' else 65536, deadline)
        require(observation['sha256'] == digest)
        if name == 'bin/node':
            require(observation['size'] == 126879696)
        records.append(dict(path=name, **observation))
    npm = json.loads(read_bounded(root / 'lib/node_modules/npm/package.json', 65536, deadline))
    require(npm['version'] == '11.19.1' and npm['engines']['node'] == '^20.17.0 || >=22.9.0')
    return records


def tar_record(member):
    if member.type in (tarfile.REGTYPE, tarfile.AREGTYPE):
        kind = 'file'
    elif member.type == tarfile.DIRTYPE:
        kind = 'directory'
    elif member.type == tarfile.SYMTYPE:
        kind = 'symlink'
    else:
        raise ValueError('unsupported-archive-type')
    require(member.sparse is None and not any('sparse' in key.lower() for key in member.pax_headers))
    return dict(name=member.name, kind=kind, size=member.size, mode=member.mode, linkname=member.linkname)


def tree_plan(records):
    directories = {''}
    explicit = {r['path']: r for r in records}
    for r in records:
        parts = r['path'].split('/')
        directories.update('/'.join(parts[:i]) for i in range(1, len(parts)))
        if r['kind'] == 'directory':
            directories.add(r['path'])
    allocations = {p: 4096+(4096 if p in explicit else 0) for p in directories}
    for r in records:
        if r['kind'] == 'file':
            allocations[r['path']] = max(4096, ((r['size']+4095)//4096)*4096)+4096
        elif r['kind'] == 'symlink':
            allocations[r['path']] = 8192
    return directories, allocations


def make_tree_dirs(root, directories, allocations, owned):
    for relative in sorted(directories, key=lambda p: (p.count('/'), p)):
        owned.mkdir(root / relative if relative else root, allocations[relative])


def copy_stream(source, destination, size, mode, allowance, owned):
    fd = owned.create_file(destination, allowance)
    digest, count = hashlib.sha256(), 0
    try:
        while count < size:
            chunk = source.read(min(CHUNK, size-count))
            require(chunk)
            owned.write(destination, fd, chunk)
            count += len(chunk)
            require(count <= size)
            digest.update(chunk)
        require(source.read(1) == b'')
        owned.verify(destination)
        os.fchmod(fd, mode)
    finally:
        os.close(fd)
    owned.refresh(destination)
    return dict(size=count, sha256=digest.hexdigest())


def finish_tree(root, records, owned, root_mode):
    for r in records:
        if r['kind'] == 'symlink':
            owned.symlink(root / r['path'], r['linkname'])
    for r in sorted(records, key=lambda r: r['path'].count('/'), reverse=True):
        if r['kind'] == 'directory':
            owned.verify(root / r['path'])
            os.chmod(root / r['path'], r['mode'], follow_symlinks=False)
    owned.verify(root)
    os.chmod(root, root_mode, follow_symlinks=False)


def main():
    start = time.monotonic()
    deadline = start+180
    receipt = dict(schemaVersion=1, status='INDETERMINATE', target_executed=False, network_gets=0)
    owned = OwnedPaths(deadline)
    stage = 'admission'
    complete_evidence = None
    manifest = None
    signal.signal(signal.SIGALRM, alarm)
    signal.setitimer(signal.ITIMER_REAL, 180)
    try:
        require(len(sys.argv) == 1 and sys.platform == 'linux' and platform.machine() == 'x86_64'
                and os.getuid() > 0 and os.getgid() > 0 and sys.flags.isolated and sys.flags.no_site and sys.dont_write_bytecode)
        e = os.environ
        require(e.get('GITHUB_ACTIONS') == 'true' and e.get('GITHUB_EVENT_NAME') == 'pull_request'
                and e.get('PINNED_RUNTIME_EVENT_ACTION') == 'opened' and e.get('GITHUB_HEAD_REF') == BRANCH
                and e.get('GITHUB_RUN_ATTEMPT') == '1' and e.get('GITHUB_JOB') == 'local'
                and e.get('GITHUB_WORKFLOW') == 'AQC quality gates' and e.get('GITHUB_REPOSITORY') == 'jnicholas000/basic-plugin'
                and e.get('RUNNER_OS') == 'Linux' and e.get('RUNNER_ARCH') == 'X64')
        def hex_value(name, length):
            value = e.get(name, '')
            require(len(value) == length and all(c in '0123456789abcdef' for c in value))
            return value
        source_commit = hex_value('GITHUB_SHA', 40)
        head = hex_value('PINNED_RUNTIME_HEAD_SHA', 40)
        base = hex_value('PINNED_RUNTIME_BASE_SHA', 40)
        expected_self = hex_value('PINNED_RUNTIME_SOURCE_SHA256', 64)
        here = Path(__file__).resolve()
        repo = here.parents[3]
        require(Path.cwd().resolve() == repo)
        stage = 'owned-source-bindings'
        require(hash_file(here, 65536, deadline)['sha256'] == expected_self)
        module_path = here.with_name('pinned_runtime_availability.py')
        require(hash_file(module_path, 65536, deadline)['sha256'] == MODULE_SHA)
        require(hash_file(here.with_name('test_pinned_runtime_availability.py'), 65536, deadline)['sha256'] == TEST_SHA)
        require(hash_file(here.with_name('test_pinned_runtime_ownership.py'), 65536, deadline)['sha256'] == OWNERSHIP_TEST_SHA)
        for name, digest in PINS.items():
            require(hash_file(repo / name, 65536, deadline)['sha256'] == digest)
        spec = importlib.util.spec_from_file_location('owned_pinned_runtime_availability', module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        policy = dict(module._POLICY)
        module.validate_acquisition_policy(policy)
        event = json.loads(read_bounded(e['GITHUB_EVENT_PATH'], MIB, deadline))
        require(event['action'] == 'opened' and type(event['number']) is int and event['number'] > 0
                and e.get('GITHUB_REF') == 'refs/pull/%s/merge' % event['number']
                and event['repository']['full_name'] == 'jnicholas000/basic-plugin'
                and event['pull_request']['head']['repo']['full_name'] == 'jnicholas000/basic-plugin'
                and event['pull_request']['base']['repo']['full_name'] == 'jnicholas000/basic-plugin'
                and event['pull_request']['head']['ref'] == BRANCH
                and event['pull_request']['head']['sha'] == head and event['pull_request']['base']['sha'] == base)
        require(git(repo, ['rev-parse', 'HEAD'], deadline).decode().strip() == source_commit)
        header = git(repo, ['cat-file', '-p', 'HEAD'], deadline).split(b'\n\n', 1)[0]
        require([line[7:].decode() for line in header.splitlines() if line.startswith(b'parent ')] == [base, head])
        require(git(repo, ['status', '--porcelain', '--untracked-files=normal'], deadline) == b'')
        before = snapshot(repo, deadline)
        for path in [here, module_path, here.with_name('test_pinned_runtime_availability.py'), here.with_name('test_pinned_runtime_ownership.py')]:
            relative = str(path.relative_to(repo))
            require(relative in before)
        run_id = e.get('GITHUB_RUN_ID', '')
        require(run_id.isascii() and run_id.isdigit() and 1 <= len(run_id) <= 30)
        image_os, image_version = e.get('ImageOS') or 'UNAVAILABLE', e.get('ImageVersion') or 'UNAVAILABLE'
        require(image_os in ('ubuntu22', 'ubuntu24', 'ubuntu26', 'UNAVAILABLE') and len(image_version) <= 40
                and (image_version == 'UNAVAILABLE' or all(part.isascii() and part.isdigit() for part in image_version.split('.'))))
        receipt['binding'] = dict(controller_sha256=expected_self, module_sha256=MODULE_SHA, test_sha256=TEST_SHA, ownership_test_sha256=OWNERSHIP_TEST_SHA,
                                  original_evidence=PINS, head_commit=head, base_commit=base, source_commit=source_commit,
                                  run_id=run_id, run_attempt=1, runner_os='Linux', runner_arch='X64', image_os=image_os, image_version=image_version)
        stage = 'seven-system-prerequisites'
        receipt['system_runtime_records'] = runtime_records(module, deadline, system_only=True)
        toolcache = Path('/opt/hostedtoolcache')
        require(e.get('RUNNER_TOOL_CACHE') == str(toolcache))
        owned.pin_anchor(toolcache)
        owned.pin_anchor(toolcache / 'node')
        version_parent = CACHE.parent
        version_exists = os.path.lexists(version_parent)
        if version_exists:
            owned.pin_anchor(version_parent)
        require(not os.path.lexists(CACHE) and not os.path.lexists(MARKER))
        runner_temp = Path(e['RUNNER_TEMP'])
        require(runner_temp.is_absolute() and os.path.realpath(runner_temp) == str(runner_temp))
        owned.pin_anchor(runner_temp)
        root = runner_temp / ('owned-pinned-runtime-' + os.urandom(16).hex())
        owned.mkdir(root)
        archive = root / 'official.tar.gz'
        stage_root = root / 'stage'
        archive_fd = owned.create_file(archive)
        stage = 'one-anonymous-https-get'
        connection = None
        network_error = None
        try:
            network_deadline = min(deadline, time.monotonic()+60)
            signal.setitimer(signal.ITIMER_REAL, max(0.001, network_deadline-time.monotonic()))
            connection = http.client.HTTPSConnection('nodejs.org', 443, timeout=max(0.001, network_deadline-time.monotonic()), context=ssl.create_default_context())
            receipt['network_gets'] = 1
            connection.request('GET', '/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz', headers={'Accept-Encoding': 'identity'})
            response = connection.getresponse()
            lengths = [value for name, value in response.getheaders() if name.lower() == 'content-length']
            require(response.status == 200 and len(lengths) == 1 and lengths[0].isascii() and lengths[0].isdigit()
                    and 0 < int(lengths[0]) <= 96*MIB and response.getheader('Transfer-Encoding') is None
                    and response.getheader('Content-Encoding') in (None, 'identity'))
            length, received, digest = int(lengths[0]), 0, hashlib.sha256()
            receipt['content_length'] = length
            while received < length:
                require(time.monotonic() < network_deadline)
                if connection.sock:
                    connection.sock.settimeout(max(0.001, network_deadline-time.monotonic()))
                data = response.read(min(CHUNK, length-received))
                require(data)
                received += len(data)
                require(received <= length)
                digest.update(data)
                owned.write(archive, archive_fd, data)
            require(received == length and digest.hexdigest() == policy['archive_sha256'])
            receipt['archive_sha256'] = digest.hexdigest()
        except BaseException as error:
            network_error = error
        finally:
            try:
                os.close(archive_fd)
            except BaseException as error:
                if network_error is None:
                    network_error = error
            if connection:
                try:
                    connection.close()
                except BaseException as error:
                    if network_error is None:
                        network_error = error
            signal.setitimer(signal.ITIMER_REAL, max(0.001, deadline-time.monotonic()))
        if network_error is not None:
            raise network_error
        owned.verify(archive)
        os.chmod(archive, 0o400, follow_symlinks=False)
        stage = 'complete-table-before-member-writes'
        entries = []
        with tarfile.open(archive, mode='r|gz') as stream:
            for member in stream:
                owned.check_time()
                require(len(entries) < 32768)
                entries.append(tar_record(member))
        records = module.validate_archive_entries(entries)
        root_mode = next(r['mode'] for r in entries if r['name'].rstrip('/') == module._PREFIX)
        manifest = dict(schemaVersion=1, archive_sha256=policy['archive_sha256'], entries=records)
        # Reserve hashes before extraction so the final inert manifest cannot exceed its cap.
        projected = [{**r, **({'sha256': '0'*64} if r['kind'] == 'file' else {})} for r in records]
        require(len(json.dumps({**manifest, 'entries': projected}, separators=(',', ':')).encode())+1 <= 2*MIB)
        directories, allocations = tree_plan(records)
        footprint = sum(allocations.values())
        require(96*MIB + 2*footprint + RESERVE <= MAX_DISK)
        owned.remaining = 2*footprint
        owned.checkpoint()
        receipt['table'] = dict(entries=len(records), file_bytes=sum(r['size'] for r in records), footprint_4k=footprint,
                                peak_bound=96*MIB+2*footprint+RESERVE)
        make_tree_dirs(stage_root, directories, allocations, owned)
        expected = {r['path']: r for r in records}
        staged_hashes = {}
        stage = 'sequential-owned-staging'
        require(hash_file(archive, 96*MIB, deadline, owned.paths[archive])['sha256'] == policy['archive_sha256'])
        with tarfile.open(archive, mode='r|gz') as stream:
            second = []
            for member in stream:
                owned.check_time()
                item = tar_record(member)
                second.append(item)
                require(len(second) <= 32768)
                if item['kind'] != 'file':
                    continue
                relative = item['name'][len(module._PREFIX)+1:]
                require(relative in expected and expected[relative] == dict(path=relative, **{k: item[k] for k in ('kind', 'size', 'mode', 'linkname')}))
                source = stream.extractfile(member)
                require(source is not None)
                with source:
                    staged_hashes[relative] = copy_stream(source, stage_root / relative, item['size'], item['mode'], allocations[relative], owned)
            require(second == entries)
        finish_tree(stage_root, records, owned, root_mode)
        receipt['staged_cache_files'] = cache_records(stage_root, module, deadline)
        stage = 'exclusive-temporary-cache'
        require(not os.path.lexists(CACHE) and not os.path.lexists(MARKER))
        if not version_exists:
            owned.mkdir(version_parent)
        make_tree_dirs(CACHE, directories, allocations, owned)
        for r in records:
            if r['kind'] != 'file':
                continue
            source_path = stage_root / r['path']
            owned.verify(source_path)
            source_fd = os.open(source_path, os.O_RDONLY | os.O_NOFOLLOW)
            with os.fdopen(source_fd, 'rb') as source:
                copied = copy_stream(source, CACHE / r['path'], r['size'], r['mode'], allocations[r['path']], owned)
            require(copied == staged_hashes[r['path']])
        finish_tree(CACHE, records, owned, root_mode)
        require(owned.remaining == 0)
        stage = 'installed-three-and-nine-byte-identities'
        cache_files = cache_records(CACHE, module, deadline)
        runtime_files = runtime_records(module, deadline)
        for path in owned.paths:
            owned.refresh(path)
        owned.checkpoint()
        stage = 'exclusive-completion-marker-last'
        marker_fd = owned.create_file(MARKER)
        os.close(marker_fd)
        require(os.lstat(MARKER).st_size == 0)
        stage = 'tracked-source-preservation'
        require(snapshot(repo, deadline) == before and git(repo, ['status', '--porcelain', '--untracked-files=normal'], deadline) == b'')
        receipt['tracked_source_files_unchanged'] = len(before)
        complete_evidence = dict(archive_sha256=policy['archive_sha256'], cache_files=cache_files, runtime_files=runtime_files,
                                 marker_empty=True, source_unchanged=True)
        manifest['entries'] = [{**r, **({'sha256': staged_hashes[r['path']]['sha256']} if r['kind'] == 'file' else {})} for r in records]
        stage = 'inert-evidence'
        encoded_manifest = (json.dumps(manifest, separators=(',', ':'), ensure_ascii=True)+'\n').encode()
        require(len(encoded_manifest) <= 2*MIB)
        target = runner_temp / 'basic-pinned-runtime-availability-manifest.json'
        owned.verify(runner_temp)
        fd = owned.create_file(target)
        data_identity = owned.paths[target]
        try:
            view = memoryview(encoded_manifest)
            while view:
                chunk = view[:CHUNK]
                owned.write(target, fd, chunk)
                view = view[len(chunk):]
            require(OwnedPaths.identity(os.lstat(target)) == data_identity)
        finally:
            os.close(fd)
        manifest_observation = hash_file(target, 2*MIB, deadline, data_identity)
        require(manifest_observation == dict(size=len(encoded_manifest), sha256=hashlib.sha256(encoded_manifest).hexdigest()))
        require(stat.S_IMODE(os.lstat(target).st_mode) == 0o600)
        receipt['retained_data_allowlist'] = ['basic-pinned-runtime-availability-manifest.json']
        receipt['manifest'] = dict(name=target.name, **manifest_observation, device=data_identity[0], inode=data_identity[1],
                                   file_type='regular', mode=0o600, retained_data=True)
        # Record complete retained-data evidence before release; keep its measured blocks accounted.
        owned.verify(target)
        del owned.paths[target]
    except BaseException as error:
        receipt['failure'] = dict(stage=stage, reason='pinned-availability-requirement', error_type=type(error).__name__,
                                  errno=error.errno if isinstance(error, OSError) and type(error.errno) is int else None)
    finally:
        # A fresh cleanup deadline never extends collection; uncertainty cannot become success.
        owned.deadline = time.monotonic()+15
        signal.setitimer(signal.ITIMER_REAL, 15)
        try:
            ownership_hash = hashlib.sha256()
            for path, identity in sorted(owned.paths.items()):
                owned.check_time()
                ownership_hash.update((str(path)+':'+str(identity)+'\n').encode())
            receipt['ownership'] = dict(exclusive_paths=len(owned.paths), pending_creations=len(owned.pending), identity_sha256=ownership_hash.hexdigest(),
                roots=[dict(label=label, device=owned.paths[path][0], inode=owned.paths[path][1])
                       for label, path in [('scratch', locals().get('root')), ('stage', locals().get('stage_root')),
                                           ('cache', CACHE), ('marker', MARKER), ('version-parent', CACHE.parent)]
                       if path in owned.paths])
        except BaseException:
            owned.uncertain = True
            receipt['ownership'] = dict(uncertain=True)
        try:
            cleanup = owned.cleanup()
        except BaseException:
            owned.uncertain = True
            cleanup = dict(completed=False, uncertain=True, remaining_owned_paths=['OWNED_PATH'] * min(len(set(owned.paths) | owned.pending), 32))
        finally:
            signal.setitimer(signal.ITIMER_REAL, 0)
        receipt['cleanup'] = cleanup
        receipt['measured_peak_owned_bytes'] = owned.peak
        if complete_evidence and 'failure' not in receipt:
            try:
                complete_evidence['cleanup'] = cleanup
                module.validate_availability_evidence(complete_evidence)
                receipt['evidence'] = complete_evidence
                receipt['status'] = 'PINNED_CACHE_BYTES_VERIFIED'
            except BaseException:
                receipt['failure'] = dict(stage='final-evidence', reason='pinned-availability-requirement')
        receipt['elapsed_ms'] = (time.monotonic()-start)*1000
    encoded = (json.dumps(receipt, separators=(',', ':'), ensure_ascii=True)+'\n').encode()
    if len(encoded) > 65536:
        receipt = dict(status='INDETERMINATE', failure=dict(stage='receipt-limit', reason='pinned-availability-requirement'), cleanup=cleanup)
        encoded = (json.dumps(receipt, separators=(',', ':'))+'\n').encode()
    sys.stdout.buffer.write(encoded)
    return 0 if receipt['status'] == 'PINNED_CACHE_BYTES_VERIFIED' else 1


if __name__ == '__main__':
    sys.exit(main())
