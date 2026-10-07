import unittest
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


if __name__ == '__main__':
    unittest.main()
