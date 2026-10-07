import unittest
import hashlib
import io
import os
import subprocess
import tarfile
import tempfile
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]


class VendorWorkflowBoundaryTests(unittest.TestCase):
    def load(self, name):
        return yaml.safe_load((ROOT / '.github/workflows' / name).read_text())

    def test_publication_build_has_no_write_permissions_or_private_credentials(self):
        workflow = self.load('publish.yml')
        self.assertEqual(workflow['permissions'], {'contents': 'read'})
        prepare = workflow['jobs']['prepare']
        self.assertNotIn('permissions', prepare)
        self.assertNotIn('secrets.', str(prepare))
        self.assertIn('persist-credentials', str(prepare))
        self.assertIn('npm run build', str(prepare))
        self.assertEqual(workflow['jobs']['validate']['needs'], 'prepare')
        self.assertEqual(workflow['jobs']['publish']['needs'], 'validate')

    def test_credentialed_jobs_never_reexecute_candidate_code(self):
        jobs = self.load('publish.yml')['jobs']
        for name in ['validate', 'publish']:
            scripts = '\n'.join(step.get('run', '') for step in jobs[name]['steps'])
            self.assertNotIn('npm run', scripts)
            self.assertNotIn('node eng/', scripts)
            self.assertNotIn('npm ci --prefix prepared', scripts)
            self.assertIn('sha256sum --check', scripts)
            self.assertIn('promotion-source-sha', scripts)
            self.assertIn("filter='data'", scripts)
        self.assertIn('validated-promotion-', str(jobs['publish']))
        self.assertIn('core.hooksPath=/dev/null', str(jobs['publish']))
        aqc = self.load('quality.yml')['jobs']['aqc']
        self.assertNotIn('npm run', str(aqc))
        self.assertIn('validated-artifacts', str(aqc))

    def test_preflight_is_read_only_and_never_advances_or_executes_upstream(self):
        workflow = self.load('sync-awesome-copilot.yml')
        self.assertEqual(workflow['permissions'], {'contents': 'read'})
        scripts = '\n'.join(step.get('run', '') for step in workflow['jobs']['preflight']['steps'])
        self.assertNotIn('npm run build', scripts)
        self.assertNotIn('gh pr merge', scripts)
        self.assertNotIn('sync-upstream-ref', scripts)
        self.assertNotIn('secrets.', str(workflow))
        self.assertIn('node eng/vendor-preflight.mjs', scripts)

    def run_artifact_check(self, members, source_sha):
        script = next(step['run'] for step in self.load('publish.yml')['jobs']['validate']['steps'] if step.get('name') == 'Check digest and source binding')
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            prepared = root / 'prepared'
            prepared.mkdir()
            archive = prepared / 'promotion.tgz'
            with tarfile.open(archive, 'w:gz') as output:
                for name, content in members.items():
                    info = tarfile.TarInfo(name)
                    data = content.encode()
                    info.size = len(data)
                    output.addfile(info, io.BytesIO(data))
            (prepared / 'promotion.sha256').write_text(hashlib.sha256(archive.read_bytes()).hexdigest() + '  promotion.tgz\n')
            result = subprocess.run(['bash', '-e', '-c', script], cwd=root, env={**os.environ, 'GITHUB_SHA': source_sha}, text=True, capture_output=True)
            self.assertFalse((root / 'escaped').exists())
            return result

    def test_promotion_requires_exact_source_binding(self):
        source = 'a' * 40
        result = self.run_artifact_check({'promotion-source-sha': source + '\n'}, source)
        self.assertEqual(result.returncode, 0, result.stderr)
        wrong = self.run_artifact_check({'promotion-source-sha': 'b' * 40}, source)
        self.assertNotEqual(wrong.returncode, 0)

    def test_archive_escape_is_rejected_before_private_validation(self):
        result = self.run_artifact_check({'../escaped': 'untrusted', 'promotion-source-sha': 'a' * 40}, 'a' * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('OutsideDestinationError', result.stderr)


if __name__ == '__main__':
    unittest.main()
