"""Independent Odo contract, frozen before the same-job producer.

Pure record predicates only. No wrapper, subprocess, network, target runtime,
archive, cache path, Docker or owned probe is imported or executed here.
"""
from copy import deepcopy
import hashlib
from pathlib import Path
import unittest
import npm_same_job as same_job_contract

from npm_same_job import (
    validate_same_job_policy,
    validate_phase_admission,
    validate_same_job_evidence,
)

validate_ci_capacity = getattr(same_job_contract, 'validate_ci_capacity', None)


MIB = 1048576
CEILING = 1288490188
SAFETY = 16 * MIB
HERE = Path(__file__).parent
POLICY = {
    'archive_url': 'https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz',
    'archive_sha256': 'eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c',
    'branch': 'feat/owned-npm-witness-observation-20261106',
    'download_bytes': 96 * MIB,
    'network_seconds': 60,
    'preparation_seconds': 120,
    'child_seconds': 90,
    'child_cleanup_seconds': 10,
    'owner_cleanup_seconds': 15,
    'overall_seconds': 235,
    'step_seconds': 240,
    'max_peak_bytes': CEILING,
    'retries': 0,
    'redirects': 0,
    'target_on_host': False,
    'upstream_execution': False,
}


def phase():
    return {
        'cache_verified': True,
        'archive_released': True,
        'stage_released': True,
        'ownership_uncertain': False,
        'filesystem_live_bytes': 220 * MIB,
        'filesystem_remaining_bytes': 200 * MIB,
        'tar_bytes': 200 * MIB,
        'docker_reserve_bytes': 416 * MIB,
        'remaining_ms': 115000,
    }


def evidence():
    return {
        'preparation_verified': True,
        'npm_verified': True,
        'source_unchanged': True,
        'target_only_in_child': True,
        'network_gets': 1,
        'retries': 0,
        'peak_admitted_bytes': CEILING,
        'cleanup': {'completed': True, 'uncertain': False, 'remaining_owned_paths': []},
    }


class SameJobContract(unittest.TestCase):
    def rejected(self, function, original, changes):
        candidate = deepcopy(original)
        candidate.update(changes)
        before = deepcopy(candidate)
        with self.assertRaises(ValueError):
            function(candidate)
        self.assertEqual(candidate, before, 'rejection must not mutate caller records')

    def test_fixed_source_and_each_budget_reject_independent_drift(self):
        original = deepcopy(POLICY)
        self.assertIs(validate_same_job_policy(POLICY), True)
        self.assertEqual(POLICY, original)
        for key in ('archive_url', 'archive_sha256', 'branch'):
            with self.subTest(field=key):
                self.rejected(validate_same_job_policy, POLICY, {key: POLICY[key] + 'x'})
        for key in ('download_bytes', 'network_seconds', 'preparation_seconds', 'child_seconds',
                    'child_cleanup_seconds', 'owner_cleanup_seconds', 'overall_seconds',
                    'step_seconds', 'max_peak_bytes', 'retries', 'redirects'):
            for value in (POLICY[key] + 1, POLICY[key] - 1, True, float(POLICY[key]), None):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_same_job_policy, POLICY, {key: value})
        for key in ('target_on_host', 'upstream_execution'):
            for value in (True, 0, None):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_same_job_policy, POLICY, {key: value})

    @unittest.skipIf(validate_ci_capacity is None, 'capacity helper absent at pre-producer freeze')
    def test_ci_capacity_integer_boundary_supported_fragment_and_closed_record(self):
        def accepted(fragment, blocks):
            value = {'fragmentBytes': fragment, 'availableBlocks': blocks}
            before = deepcopy(value)
            actual = validate_ci_capacity(value)
            self.assertIs(type(actual), int)
            self.assertEqual(actual, fragment * blocks)
            self.assertEqual(value, before)

        accepted(1, CEILING)
        accepted(1, CEILING + 1)
        blocks = (CEILING + 4095) // 4096
        accepted(4096, blocks)
        accepted(4096, blocks + 1)
        accepted(4096, 9223372036854775807)
        good = {'fragmentBytes': 4096, 'availableBlocks': blocks}
        for changes in ({'availableBlocks': blocks - 1}, {'availableBlocks': 0},
                        {'fragmentBytes': 0}, {'fragmentBytes': -1}, {'fragmentBytes': 4097},
                        {'availableBlocks': -1}, {'availableBlocks': 9223372036854775808}):
            self.rejected(validate_ci_capacity, good, changes)
        for key in good:
            for value in (True, False, float(good[key]), str(good[key]), None):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_ci_capacity, good, {key: value})
            missing = deepcopy(good)
            del missing[key]
            with self.assertRaises(ValueError):
                validate_ci_capacity(missing)
        self.rejected(validate_ci_capacity, good, {'unknown': True})
        for nonrecord in (None, [], True, 'record'):
            with self.assertRaises(ValueError):
                validate_ci_capacity(nonrecord)
    def test_release_and_verified_cache_are_required_before_phase_admission(self):
        good = phase()
        before = deepcopy(good)
        self.assertIs(validate_phase_admission(good), True)
        self.assertEqual(good, before)
        for key in ('cache_verified', 'archive_released', 'stage_released'):
            for value in (False, 1, None):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_phase_admission, good, {key: value})
        for value in (True, 0, None):
            self.rejected(validate_phase_admission, good, {'ownership_uncertain': value})

    def test_aggregate_peak_boundary_counts_remaining_writes_and_both_reserves(self):
        good = phase()
        good['filesystem_live_bytes'] = CEILING - good['filesystem_remaining_bytes'] - good['docker_reserve_bytes'] - SAFETY
        self.assertIs(validate_phase_admission(good), True)
        self.rejected(validate_phase_admission, good, {'filesystem_live_bytes': good['filesystem_live_bytes'] + 1})
        self.rejected(validate_phase_admission, good, {'filesystem_remaining_bytes': good['filesystem_remaining_bytes'] + 1})
        self.rejected(validate_phase_admission, good, {'docker_reserve_bytes': good['docker_reserve_bytes'] + 1})
        # Independently require two tar copies + Docker metadata, even with ample total room.
        self.rejected(validate_phase_admission, phase(), {'docker_reserve_bytes': 2 * phase()['tar_bytes'] + SAFETY - 1})
        self.rejected(validate_phase_admission, phase(), {'tar_bytes': 200 * MIB + 1})
        minimum = phase()
        minimum.update(filesystem_live_bytes=0, filesystem_remaining_bytes=0, tar_bytes=0,
                       docker_reserve_bytes=SAFETY)
        self.assertIs(validate_phase_admission(minimum), True)

    def test_child_deadline_and_byte_fields_have_independent_type_and_range_gates(self):
        good = phase()
        self.assertIs(validate_phase_admission(good), True)
        self.rejected(validate_phase_admission, good, {'remaining_ms': 114999})
        for key in ('filesystem_live_bytes', 'filesystem_remaining_bytes', 'tar_bytes',
                    'docker_reserve_bytes', 'remaining_ms'):
            for value in (-1, True, 1.0, None, '115000'):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_phase_admission, good, {key: value})

    def test_composite_success_requires_each_actual_phase_and_single_attempt(self):
        good = evidence()
        before = deepcopy(good)
        self.assertIs(validate_same_job_evidence(good), True)
        self.assertEqual(good, before)
        for key in ('preparation_verified', 'npm_verified', 'source_unchanged', 'target_only_in_child'):
            for value in (False, 1, None):
                with self.subTest(field=key, value=value):
                    self.rejected(validate_same_job_evidence, good, {key: value})
        for key, values in {'network_gets': (0, 2, True, 1.0), 'retries': (1, False, 0.0),
                            'peak_admitted_bytes': (CEILING + 1, -1, True, float(CEILING))}.items():
            for value in values:
                with self.subTest(field=key, value=value):
                    self.rejected(validate_same_job_evidence, good, {key: value})

    def test_cleanup_failure_or_unknown_mutation_cannot_be_promoted_to_success(self):
        good = evidence()
        for cleanup in ({'completed': False, 'uncertain': False, 'remaining_owned_paths': []},
                        {'completed': True, 'uncertain': True, 'remaining_owned_paths': []},
                        {'completed': True, 'uncertain': False, 'remaining_owned_paths': ['OWNED_PATH']},
                        {'completed': 1, 'uncertain': False, 'remaining_owned_paths': []},
                        {'completed': True, 'uncertain': 0, 'remaining_owned_paths': []},
                        {'completed': True, 'uncertain': False, 'remaining_owned_paths': ()},
                        {'completed': True, 'uncertain': False},
                        {'completed': True, 'uncertain': False, 'remaining_owned_paths': [], 'assumed': True}):
            with self.subTest(cleanup=cleanup):
                self.rejected(validate_same_job_evidence, good, {'cleanup': cleanup})

    def test_closed_shapes_reject_missing_extra_and_nonrecord_inputs(self):
        for function, value in ((validate_same_job_policy, POLICY), (validate_phase_admission, phase()),
                                (validate_same_job_evidence, evidence())):
            for key in value:
                missing = deepcopy(value)
                del missing[key]
                with self.subTest(function=function.__name__, missing=key):
                    with self.assertRaises(ValueError):
                        function(missing)
            self.rejected(function, value, {'unknown': True})
            for nonrecord in (None, [], True, 'record'):
                with self.subTest(function=function.__name__, value=nonrecord):
                    with self.assertRaises(ValueError):
                        function(nonrecord)

    def test_original_controls_and_current_probe_match_exact_source_versions(self):
        expected = {
            'run-npm-preparation-control.mjs': 'efeebb36b8768d1df8ec10cb786382f2b8301cd7d2eb519ff6afbbe322bc15c7',
            'npm-preparation-probe.mjs': 'fd905605bd8d9b80c1f493d1726f9aad9e876eadb6ee57b41f8b93bbe1298cb3',
            'npm-lifecycle-observer.mjs': 'a3059404cb6f0cfcc861d00a53a471e8f7dc90632d5e8b9b02f68d88b7f9fcb9',
            'test-npm-preparation-control.mjs': '5e0ba660f7214ed5613b757f86df9eaf53c33cd7480988b2681718003d8ed972',
            'run_pinned_runtime_availability.py': '9aecd6d7e40c969cc5fa61a53b9bd2c9af02f450fe8bd1d2ad625bc56da20cc0',
        }
        for name, digest in expected.items():
            with self.subTest(source=name):
                self.assertEqual(hashlib.sha256((HERE / name).read_bytes()).hexdigest(), digest)


if __name__ == '__main__':
    unittest.main()
