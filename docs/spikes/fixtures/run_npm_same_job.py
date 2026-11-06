"""DO_NOT_COPY: one exact same-job preparation and owned empty npm control; guarded CI main only."""
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
CLEANUP_TEST_SHA = '1d754c29bb19fad671c953d8ead2c9f227bd0bd20b5d7575a3159cdc574a9399'
PINS = {
    'docs/spikes/fixtures/owned-rootfs-modes.mjs': '47b544208400dcf72ab38a74f8b335061c7e51e3f17aa51b88dc5aaa9362dc4b',
    'docs/spikes/fixtures/test-rootfs-directory-modes.mjs': '7fb1e1be8f5f67c2f7a3b1fa241593e4ab24678bc64c0c1dced67249ae7efe5d',
    'docs/spikes/fixtures/run-npm-preparation-control.mjs': 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7',
    'docs/spikes/fixtures/npm-preparation-probe.mjs': '18800d03a5f86171c2eb96631a54e7a3b4e1aaa1f65f25d5d402067ec96ebb5c',
    'docs/spikes/fixtures/npm-lifecycle-observer.mjs': 'a3059404cb6f0cfcc861d00a53a471e8f7dc90632d5e8b9b02f68d88b7f9fcb9',
    'docs/spikes/fixtures/test-npm-preparation-control.mjs': '5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972',
    'docs/spikes/candidate-npm-preparation-first-receipt.json': 'eb9b1f3d493c79c55bcc0646507c84831f2797d7ee55def6fcbdc9a9f8602f0e',
    'docs/spikes/candidate-npm-prerequisite-metadata-receipt.json': '98a50ed171e884f20384c31fc6928c4cd07a4bc29b9d28fcd81a41dec7cfd2cc',
    'docs/spikes/candidate-pinned-runtime-availability-receipt.json': 'd8c14eab91e6486ae2cc9ff6e236024af8fd2a13fbee22d93d5fc63a27a74226'}
CACHE = Path('/opt/hostedtoolcache/node/24.22.1/x64')
MARKER = Path(str(CACHE)+'.complete')
MAX_DISK = 1288490188
MIB = 1048576
RESERVE = 16*MIB
CHUNK = MIB
BRANCH = 'feat/owned-npm-corrected-observation-20261106'


def require(value):
    if not value:
        raise ValueError('owned-npm-same-job-requirement')


def alarm(_signum, _frame):
    raise TimeoutError('owned-npm-same-job-deadline')


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_checked_helper():
    path = Path(__file__).with_name('run_pinned_runtime_availability.py')
    # Bounded read precedes import; the historical guarded main is never called.
    with open(path, 'rb') as stream:
        data = stream.read(65537)
    require(len(data) <= 65536 and hashlib.sha256(data).hexdigest() == '9aecd6d7e40c969cc5fa61a53b9bd2c9af02f450fe8bd1d2ad625bc56da20cc0')
    return load_module('owned_historical_runtime_helpers', path)


def release_owned(root, owned):
    paths = [p for p in owned.paths if p == root or root in p.parents]
    require(paths and root in owned.paths and not owned.pending and not owned.uncertain)
    for path in sorted(paths, key=lambda p: len(p.parts)):
        owned.check_time()
        owned.verify(path)
        if owned.paths[path][2] == stat.S_IFDIR:
            os.chmod(path, 0o700, follow_symlinks=False)
    for path in sorted(paths, key=lambda p: len(p.parts), reverse=True):
        owned.check_time()
        owned.verify(path)
        if owned.paths[path][2] == stat.S_IFDIR:
            os.rmdir(path)
        else:
            os.unlink(path)
        del owned.paths[path]
        owned.allocated -= owned.blocks.pop(path, 0)
    require(not os.path.lexists(root))
    if root.parent in owned.paths:
        owned.refresh(root.parent)
    owned.checkpoint()


def invoke_owned_controller(host_node, controller, repo, env, deadline):
    child = None
    outputs = {1: bytearray(), 2: bytearray()}
    uncertain = True
    result = dict(exit=None, timed_out=False, receipt=None)
    try:
        child = subprocess.Popen([host_node, str(controller)], cwd=repo, env=env, stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
        streams = {child.stdout.fileno(): (child.stdout, 1), child.stderr.fileno(): (child.stderr, 2)}
        while streams:
            remaining = deadline-time.monotonic()
            require(remaining > 0)
            readable, _, _ = select.select(list(streams), [], [], remaining)
            require(readable)
            for fd in readable:
                stream, key = streams[fd]
                chunk = os.read(fd, 65536)
                if not chunk:
                    stream.close()
                    del streams[fd]
                else:
                    outputs[key].extend(chunk)
                    require(len(outputs[key]) <= 65536)
        result['exit'] = child.wait(timeout=max(0.001, deadline-time.monotonic()))
        require(not outputs[2])
        result['receipt'] = json.loads(outputs[1])
        require(type(result['receipt']) is dict)
        uncertain = False
    except BaseException as error:
        result['timed_out'] = isinstance(error, (TimeoutError, subprocess.TimeoutExpired))
        result['error_type'] = type(error).__name__
        if isinstance(error, OSError) and error.errno in (2, 13) and child is None:
            uncertain = False
    finally:
        if child is not None:
            if child.poll() is None:
                uncertain = True
                # Only the process group created above is signalled, never an unrelated process.
                try:
                    os.killpg(child.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                try:
                    child.wait(timeout=1)
                except BaseException:
                    pass
            for stream in (child.stdout, child.stderr):
                if stream and not stream.closed:
                    stream.close()
        result['stdout_bytes'] = len(outputs[1])
        result['stderr_bytes'] = len(outputs[2])
    return result, uncertain


def main():
    start = time.monotonic()
    overall_deadline = start+235
    deadline = start+120
    receipt = dict(schemaVersion=1, status='INDETERMINATE', target_execution='NOT_REACHED', network_gets=0, retries=0)
    child_uncertain = False
    npm_verified = False
    peak_admitted = 0
    owned = None
    stage = 'admission'
    complete_evidence = None
    manifest = None
    signal.signal(signal.SIGALRM, alarm)
    signal.signal(signal.SIGTERM, alarm)
    signal.setitimer(signal.ITIMER_REAL, 120)
    try:
        h = load_checked_helper()
        OwnedPaths = h.OwnedPaths
        hash_file, read_bounded, git, snapshot = h.hash_file, h.read_bounded, h.git, h.snapshot
        runtime_records, cache_records = h.runtime_records, h.cache_records
        tar_record, tree_plan, make_tree_dirs = h.tar_record, h.tree_plan, h.make_tree_dirs
        copy_stream, finish_tree = h.copy_stream, h.finish_tree
        owned = OwnedPaths(deadline)
        require(len(sys.argv) == 1 and sys.platform == 'linux' and platform.machine() == 'x86_64'
                and os.getuid() > 0 and os.getgid() > 0 and sys.flags.isolated and sys.flags.no_site and sys.dont_write_bytecode)
        e = os.environ
        require(e.get('GITHUB_ACTIONS') == 'true' and e.get('GITHUB_EVENT_NAME') == 'pull_request'
                and e.get('NPM_SAME_JOB_EVENT_ACTION') == 'opened' and e.get('GITHUB_HEAD_REF') == BRANCH
                and e.get('GITHUB_RUN_ATTEMPT') == '1' and e.get('GITHUB_JOB') == 'local'
                and e.get('GITHUB_WORKFLOW') == 'AQC quality gates' and e.get('GITHUB_REPOSITORY') == 'jnicholas000/basic-plugin'
                and e.get('RUNNER_OS') == 'Linux' and e.get('RUNNER_ARCH') == 'X64')
        def hex_value(name, length):
            value = e.get(name, '')
            require(len(value) == length and all(c in '0123456789abcdef' for c in value))
            return value
        source_commit = hex_value('GITHUB_SHA', 40)
        head = hex_value('NPM_SAME_JOB_HEAD_SHA', 40)
        base = hex_value('NPM_SAME_JOB_BASE_SHA', 40)
        expected_self = hex_value('NPM_SAME_JOB_SOURCE_SHA256', 64)
        here = Path(__file__).resolve()
        repo = here.parents[3]
        require(Path.cwd().resolve() == repo)
        stage = 'owned-source-bindings'
        require(hash_file(here, 65536, deadline)['sha256'] == expected_self)
        module_path = here.with_name('pinned_runtime_availability.py')
        pure_path = here.with_name('npm_same_job.py')
        require(hash_file(pure_path, 65536, deadline)['sha256'] == hex_value('NPM_SAME_JOB_MODULE_SHA256', 64))
        require(hash_file(here.with_name('test_npm_same_job.py'), 65536, deadline)['sha256'] == hex_value('NPM_SAME_JOB_TEST_SHA256', 64))
        require(hash_file(here.with_name('test_npm_same_job_cleanup.py'), 65536, deadline)['sha256'] == CLEANUP_TEST_SHA)
        controller = here.with_name('run-npm-same-job-control.mjs')
        controller_sha = hex_value('NPM_SAME_JOB_CONTROLLER_SHA256', 64)
        require(hash_file(controller, 65536, deadline)['sha256'] == controller_sha)
        pure = load_module('owned_npm_same_job', pure_path)
        pure.validate_same_job_policy(dict(pure.POLICY))
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
        receipt['binding'] = dict(owner_sha256=expected_self, controller_sha256=controller_sha, pure_sha256=hex_value('NPM_SAME_JOB_MODULE_SHA256', 64), new_test_sha256=hex_value('NPM_SAME_JOB_TEST_SHA256', 64), cleanup_test_sha256=CLEANUP_TEST_SHA, module_sha256=MODULE_SHA, test_sha256=TEST_SHA, ownership_test_sha256=OWNERSHIP_TEST_SHA,
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
        root = runner_temp / ('owned-npm-corrected-' + os.urandom(16).hex())
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
        target = runner_temp / 'basic-npm-corrected-archive-manifest.json'
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
        receipt['retained_data_allowlist'] = ['basic-npm-corrected-archive-manifest.json']
        receipt['manifest'] = dict(name=target.name, **manifest_observation, device=data_identity[0], inode=data_identity[1],
                                   file_type='regular', mode=0o600, retained_data=True)
        # Record complete retained-data evidence before release; keep its measured blocks accounted.
        owned.verify(target)
        del owned.paths[target]
        stage = 'release-archive-and-stage-before-target'
        release_owned(stage_root, owned)
        release_owned(archive, owned)
        require(not os.path.lexists(stage_root) and not os.path.lexists(archive) and not owned.pending and not owned.uncertain)
        for path in owned.paths:
            owned.refresh(path)
        cache_live = owned.allocated
        phase = dict(cache_verified=True, archive_released=True, stage_released=True, ownership_uncertain=False,
            filesystem_live_bytes=cache_live, filesystem_remaining_bytes=512*MIB, tar_bytes=200*MIB,
            docker_reserve_bytes=416*MIB, remaining_ms=int((overall_deadline-time.monotonic())*1000))
        pure.validate_phase_admission(phase)
        receipt['phase_admission'] = phase
        peak_admitted = max(receipt['table']['peak_bound'], cache_live+512*MIB+416*MIB+RESERVE)
        receipt['preparation_elapsed_ms'] = (time.monotonic()-start)*1000
        stage = 'existing-host-node22-admission'
        host_node = e.get('NPM_SAME_JOB_HOST_NODE', '')
        require(host_node.startswith('/opt/hostedtoolcache/node/22.') and host_node.endswith('/x64/bin/node')
            and os.path.realpath(host_node) == host_node and host_node != str(CACHE / 'bin/node'))
        receipt['host_orchestrator'] = dict(version_major=22, **hash_file(host_node, 192*MIB, deadline))
        child_env = {k: e[k] for k in ('GITHUB_ACTIONS', 'GITHUB_EVENT_NAME', 'GITHUB_HEAD_REF', 'GITHUB_RUN_ATTEMPT',
            'GITHUB_JOB', 'GITHUB_WORKFLOW', 'GITHUB_REPOSITORY', 'GITHUB_SHA', 'GITHUB_REF', 'RUNNER_OS', 'RUNNER_ARCH',
            'RUNNER_TEMP', 'GITHUB_EVENT_PATH', 'NPM_SAME_JOB_EVENT_ACTION', 'NPM_SAME_JOB_HEAD_SHA',
            'NPM_SAME_JOB_BASE_SHA', 'NPM_SAME_JOB_CONTROLLER_SHA256')}
        child_env.update(HOME='/nonexistent', PATH='/usr/bin:/bin', LC_ALL='C', OPENSSL_CONF='/dev/null',
            NPM_SAME_JOB_CACHE_ALLOCATED_BYTES=str(cache_live), NPM_SAME_JOB_CACHE_VERIFIED='true',
            NPM_SAME_JOB_ARCHIVE_RELEASED='true', NPM_SAME_JOB_STAGE_RELEASED='true')
        deadline = overall_deadline-15
        owned.deadline = deadline
        signal.setitimer(signal.ITIMER_REAL, max(0.001, deadline-time.monotonic()))
        stage = 'one-owned-npm-controller'
        receipt['target_execution'] = 'UNKNOWN_UNTIL_CHILD_RECEIPT'
        child_result, child_uncertain = invoke_owned_controller(host_node, controller, repo, child_env, min(deadline, time.monotonic()+100))
        receipt['npm_controller'] = child_result
        npm = child_result.get('receipt')
        if type(npm) is dict:
            # A parsed receipt acknowledges daemon cleanup only with the complete exact success shape.
            # Preserve any prior transport/launch uncertainty; malformed/failed cleanup stays unknown.
            child_uncertain = child_uncertain or not (
                type(npm.get('cleanup')) is dict
                and npm['cleanup'].keys() == {'completed', 'mutationOutcomeUncertain', 'failures'}
                and npm['cleanup'].get('completed') is True
                and npm['cleanup'].get('mutationOutcomeUncertain') is False
                and type(npm['cleanup'].get('failures')) is list and npm['cleanup']['failures'] == [])
            receipt['npm'] = npm
            receipt['target_execution'] = 'INVOCATION_ATTEMPTED_IN_CHILD' if npm.get('targetInvocationAttempted') is True else 'NOT_REACHED'
            require(npm.get('headCommit') == head and npm.get('baseCommit') == base and npm.get('sourceCommit') == source_commit
                and npm.get('hostNodeVersion', '').startswith('v22.') and npm.get('upstreamExecuted') is False
                and npm.get('realCredentialsProbed') is False and npm.get('downloadsOrInstalls') is False)
        require(child_result['exit'] == 0 and not child_uncertain and type(npm) is dict
            and npm.get('status') == 'NPM11_OWNED_PREPARATION_CONTROL_PASSED'
            and npm.get('cleanup', {}).get('completed') is True and npm.get('cleanup', {}).get('failures') == [])
        require(npm.get('diskAdmission', {}).get('peakAdmittedBytes', MAX_DISK+1) <= MAX_DISK)
        peak_admitted = max(peak_admitted, npm['diskAdmission']['peakAdmittedBytes'])
        npm_verified = True
        stage = 'post-child-runtime-and-source-preservation'
        require(cache_records(CACHE, module, deadline) == cache_files and runtime_records(module, deadline) == runtime_files)
        require(snapshot(repo, deadline) == before and git(repo, ['status', '--porcelain', '--untracked-files=normal'], deadline) == b'')
        receipt['tracked_source_files_unchanged_after_child'] = len(before)
    except BaseException as error:
        receipt['failure'] = dict(stage=stage, reason='pinned-availability-requirement', error_type=type(error).__name__,
                                  errno=error.errno if isinstance(error, OSError) and type(error.errno) is int else None)
    finally:
        if owned is None:
            cleanup = dict(completed=True, uncertain=False, remaining_owned_paths=[])
            receipt['outer_path_cleanup'] = dict(cleanup)
            receipt['cleanup'] = cleanup
            signal.setitimer(signal.ITIMER_REAL, 0)
        else:
            # A fresh cleanup deadline never extends collection; uncertainty cannot become success.
            owned.deadline = min(time.monotonic()+15, overall_deadline)
            signal.setitimer(signal.ITIMER_REAL, max(0.001, owned.deadline-time.monotonic()))
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
                receipt['outer_path_cleanup'] = dict(cleanup)
                if child_uncertain:
                    cleanup = dict(completed=False, uncertain=True, remaining_owned_paths=cleanup['remaining_owned_paths'])
            except BaseException:
                owned.uncertain = True
                cleanup = dict(completed=False, uncertain=True, remaining_owned_paths=['OWNED_PATH'] * min(len(set(owned.paths) | owned.pending), 32))
                receipt['outer_path_cleanup'] = dict(cleanup)
            finally:
                signal.setitimer(signal.ITIMER_REAL, 0)
            receipt['cleanup'] = cleanup
            receipt['measured_peak_owned_bytes'] = owned.peak
        if complete_evidence and 'failure' not in receipt:
            try:
                complete_evidence['cleanup'] = cleanup
                module.validate_availability_evidence(complete_evidence)
                receipt['preparation_evidence'] = complete_evidence
                combined = dict(preparation_verified=True, npm_verified=npm_verified, source_unchanged=True, target_only_in_child=True,
                    network_gets=receipt['network_gets'], retries=0, peak_admitted_bytes=peak_admitted, cleanup=cleanup)
                pure.validate_same_job_evidence(combined)
                receipt['evidence'] = combined
                receipt['status'] = 'NPM11_SAME_JOB_OWNED_CONTROL_PASSED'
            except BaseException:
                receipt['failure'] = dict(stage='final-evidence', reason='pinned-availability-requirement')
        receipt['elapsed_ms'] = (time.monotonic()-start)*1000
    encoded = (json.dumps(receipt, separators=(',', ':'), ensure_ascii=True)+'\n').encode()
    if len(encoded) > 65536:
        receipt = dict(status='INDETERMINATE', failure=dict(stage='receipt-limit', reason='pinned-availability-requirement'), cleanup=cleanup)
        encoded = (json.dumps(receipt, separators=(',', ':'))+'\n').encode()
    sys.stdout.buffer.write(encoded)
    return 0 if receipt['status'] == 'NPM11_SAME_JOB_OWNED_CONTROL_PASSED' else 1


if __name__ == '__main__':
    sys.exit(main())
