"""DO_NOT_COPY: pure records for one source-bound same-job owned npm control."""
MIB = 1048576
MAX_PEAK = 1288490188
POLICY = dict(archive_url='https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz',
    archive_sha256='eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c',
    branch='feat/owned-npm-corrected-observation-20261106', download_bytes=96*MIB,
    network_seconds=60, preparation_seconds=120, child_seconds=90, child_cleanup_seconds=10,
    owner_cleanup_seconds=15, overall_seconds=235, step_seconds=240,
    max_peak_bytes=MAX_PEAK, retries=0, redirects=0, target_on_host=False, upstream_execution=False)


def require(value):
    if not value:
        raise ValueError('owned-npm-same-job-requirement')


def shape(value, keys):
    require(type(value) is dict and set(value) == set(keys))


def integer(value, maximum):
    return type(value) is int and 0 <= value <= maximum


def validate_same_job_policy(policy):
    shape(policy, POLICY)
    require(all(type(policy[k]) is type(v) and policy[k] == v for k, v in POLICY.items()))
    return True


def validate_phase_admission(phase):
    shape(phase, ('cache_verified', 'archive_released', 'stage_released', 'ownership_uncertain',
        'filesystem_live_bytes', 'filesystem_remaining_bytes', 'tar_bytes', 'docker_reserve_bytes', 'remaining_ms'))
    require(all(phase[k] is True for k in ('cache_verified', 'archive_released', 'stage_released'))
        and phase['ownership_uncertain'] is False)
    require(all(integer(phase[k], MAX_PEAK) for k in ('filesystem_live_bytes', 'filesystem_remaining_bytes',
        'tar_bytes', 'docker_reserve_bytes')) and type(phase['remaining_ms']) is int and phase['remaining_ms'] >= 115000)
    require(phase['tar_bytes'] <= 200*MIB and phase['docker_reserve_bytes'] >= 2*phase['tar_bytes']+16*MIB)
    require(sum(phase[k] for k in ('filesystem_live_bytes', 'filesystem_remaining_bytes', 'docker_reserve_bytes'))+16*MIB <= MAX_PEAK)
    return True


def validate_same_job_evidence(evidence):
    shape(evidence, ('preparation_verified', 'npm_verified', 'source_unchanged', 'target_only_in_child',
        'network_gets', 'retries', 'peak_admitted_bytes', 'cleanup'))
    require(all(evidence[k] is True for k in ('preparation_verified', 'npm_verified', 'source_unchanged', 'target_only_in_child')))
    require(type(evidence['network_gets']) is int and evidence['network_gets'] == 1
        and type(evidence['retries']) is int and evidence['retries'] == 0
        and integer(evidence['peak_admitted_bytes'], MAX_PEAK))
    cleanup = evidence['cleanup']
    shape(cleanup, ('completed', 'uncertain', 'remaining_owned_paths'))
    require(cleanup['completed'] is True and cleanup['uncertain'] is False
        and type(cleanup['remaining_owned_paths']) is list and cleanup['remaining_owned_paths'] == [])
    return True
