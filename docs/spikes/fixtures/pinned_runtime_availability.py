"""DO_NOT_COPY: pure closed-record contracts for one owned runtime-byte experiment."""
_MIB = 1048576
_CACHE = '/opt/hostedtoolcache/node/24.22.1/x64'
_PREFIX = 'node-v24.22.1-linux-x64'
_ARCHIVE_SHA = 'eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c'
_POLICY = dict(url='https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz',
               archive_sha256=_ARCHIVE_SHA, cache_path=_CACHE, marker_path=_CACHE + '.complete',
               max_download_bytes=96*_MIB, network_seconds=60, max_entries=32768, max_depth=32,
               max_path_bytes=4096, max_file_bytes=192*_MIB, max_unpacked_bytes=512*_MIB,
               max_peak_disk_bytes=1288490188, controller_seconds=180, cleanup_seconds=15,
               redirects=0, retries=0, resume=False)
_CACHE_HASHES = {
    'bin/node': 'e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb',
    'include/node/node_version.h': '0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad',
    'lib/node_modules/npm/package.json': 'f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6'}
_RUNTIME = [
    ('/runtime/node', 126879696, _CACHE_HASHES['bin/node']),
    ('/lib64/ld-linux-x86-64.so.2', 236616, 'c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da'),
    ('/lib/x86_64-linux-gnu/libdl.so.2', 14408, 'c2994527172cc23b7fb0f7d611b71e00a37da27af12c2e5e9e0dc1a742886c96'),
    ('/lib/x86_64-linux-gnu/libstdc++.so.6', 2592224, '1fd75fe70354a416d75aef22bcae68c47bd25d20e2d0568c30b1a9838cf62f11'),
    ('/lib/x86_64-linux-gnu/libm.so.6', 952616, 'fce00b6f25f459cf4ae0b7fae4257909a1a8a86f9149e7c029a5d617baf1ccd0'),
    ('/lib/x86_64-linux-gnu/libgcc_s.so.1', 183024, 'd93224d2b0dab4247598be683adca02f5cf00586f99c187579cd7e92058fb7cb'),
    ('/lib/x86_64-linux-gnu/libpthread.so.0', 14408, '90491a21ce44efcf3bd4b65ec82501c091d7ebe7f8d9b341dd01d721001d9ecd'),
    ('/lib/x86_64-linux-gnu/libc.so.6', 2129424, '3a15d66867d83762c7f2f1e37359cb8f6c5743edb369c65285cb0b1c4f7498bf'),
    ('/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2', 236616, 'c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da')]


def _require(value):
    if not value:
        raise ValueError('pinned-availability-requirement')


def _shape(value, keys):
    _require(type(value) is dict and set(value) == set(keys))


def _integer(value, maximum):
    return type(value) is int and 0 <= value <= maximum


def _text(value):
    if type(value) is not str or any(ord(c) < 32 or 127 <= ord(c) <= 159 for c in value):
        return False
    try:
        return len(value.encode('utf-8')) <= 4096
    except UnicodeError:
        return False


def validate_acquisition_policy(policy):
    _shape(policy, _POLICY)
    for key, expected in _POLICY.items():
        _require(type(policy[key]) is type(expected) and policy[key] == expected)
    return True


def validate_archive_entries(entries):
    _require(type(entries) is list and 1 <= len(entries) <= 32768)
    records, directories, root_count, total = {}, {''}, 0, 0
    for item in entries:
        _shape(item, ('name', 'kind', 'size', 'mode', 'linkname'))
        name, kind, size, mode, link = (item[k] for k in ('name', 'kind', 'size', 'mode', 'linkname'))
        _require(_text(name) and _text(link) and kind in ('file', 'directory', 'symlink'))
        _require(_integer(size, 192*_MIB) and _integer(mode, 0o777))
        if kind == 'directory' and name.endswith('/'):
            name = name[:-1]
        if name == _PREFIX:
            _require(kind == 'directory' and size == 0 and link == '')
            root_count += 1
            continue
        _require(name.startswith(_PREFIX + '/'))
        stripped = name[len(_PREFIX)+1:]
        parts = stripped.split('/')
        _require(_text(stripped) and len(parts) <= 32 and all(p and p not in ('.', '..') for p in parts)
                 and '\\' not in stripped and stripped not in records)
        if kind != 'file':
            _require(size == 0)
        if kind == 'symlink':
            _require(link and not link.startswith('/') and '\\' not in link and all(link.split('/')))
        else:
            _require(link == '')
        total += size
        _require(total <= 512*_MIB)
        records[stripped] = dict(path=stripped, kind=kind, size=size, mode=mode, linkname=link)
        for i in range(1, len(parts)):
            directories.add('/'.join(parts[:i]))
        if kind == 'directory':
            directories.add(stripped)
    _require(root_count == 1)
    for directory in directories:
        _require(directory not in records or records[directory]['kind'] == 'directory')

    def resolve(target):
        # Resolve links before '..', matching filesystem semantics without filesystem access.
        pending, resolved, active = list(reversed(target.split('/'))), [], set()
        steps = 0
        while pending:
            steps += 1
            _require(steps <= 32768*64)
            part = pending.pop()
            if type(part) is tuple:
                active.remove(part[0])
                continue
            if part == '.':
                continue
            if part == '..':
                _require(resolved)
                resolved.pop()
                continue
            candidate = '/'.join(resolved + [part])
            item = records.get(candidate)
            if item and item['kind'] == 'symlink':
                _require(candidate not in active)
                active.add(candidate)
                pending.append((candidate,))
                pending.extend(reversed(item['linkname'].split('/')))
            else:
                _require(candidate in records or candidate in directories)
                if item and item['kind'] == 'file':
                    _require(not any(type(component) is str for component in pending))
                resolved.append(part)
        _require('/'.join(resolved) in records or '/'.join(resolved) in directories)
    for item in records.values():
        if item['kind'] == 'symlink':
            resolve(item['path'])
    files = sum(max(4096, ((r['size']+4095)//4096)*4096) for r in records.values() if r['kind'] == 'file')
    links = sum(r['kind'] == 'symlink' for r in records.values())
    footprint = files + 4096*len(directories) + 4096*links + 4096*len(records)
    _require(96*_MIB + 2*footprint + 16*_MIB <= 1288490188)
    return sorted(records.values(), key=lambda r: (r['kind'] == 'symlink', r['path'].count('/'), r['path']))


def validate_availability_evidence(evidence):
    _shape(evidence, ('archive_sha256', 'cache_files', 'runtime_files', 'marker_empty', 'source_unchanged', 'cleanup'))
    _require(evidence['archive_sha256'] == _ARCHIVE_SHA and evidence['marker_empty'] is True and evidence['source_unchanged'] is True)
    _shape(evidence['cleanup'], ('completed', 'uncertain', 'remaining_owned_paths'))
    _require(evidence['cleanup']['completed'] is True and evidence['cleanup']['uncertain'] is False
             and type(evidence['cleanup']['remaining_owned_paths']) is list and evidence['cleanup']['remaining_owned_paths'] == [])
    cache_files = evidence['cache_files']
    _require(type(cache_files) is list and len(cache_files) == 3)
    seen = set()
    for item in cache_files:
        _shape(item, ('path', 'size', 'sha256'))
        _require(type(item['path']) is str and item['path'] in _CACHE_HASHES and item['path'] not in seen)
        seen.add(item['path'])
        _require(item['sha256'] == _CACHE_HASHES[item['path']] and _integer(item['size'], 192*_MIB))
        if item['path'] == 'bin/node':
            _require(item['size'] == 126879696)
    runtime = evidence['runtime_files']
    _require(type(runtime) is list and len(runtime) == 9)
    seen = set()
    for item in runtime:
        _shape(item, ('source', 'destination', 'size', 'sha256'))
        _require(type(item['destination']) is str and item['destination'] not in seen)
        seen.add(item['destination'])
        expected = next((r for r in _RUNTIME if r[0] == item['destination']), None)
        _require(expected is not None)
        destination, size, digest = expected
        source = _CACHE + '/bin/node' if destination == '/runtime/node' else '/usr/lib/x86_64-linux-gnu/' + (
            'libstdc++.so.6.0.33' if destination.endswith('/libstdc++.so.6') else destination.rsplit('/', 1)[1])
        _require(item['source'] == source and type(item['size']) is int and item['size'] == size and item['sha256'] == digest)
    _require(sum(item['size'] for item in runtime) == 133239032)
    return True
