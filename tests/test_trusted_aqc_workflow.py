import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "trusted-aqc.yml"


class TrustedAqcWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workflow = WORKFLOW.read_text(encoding="utf-8")

    def test_requires_explicit_maintainer_label_for_untrusted_pull_requests(self):
        self.assertIn("pull_request_target:", self.workflow)
        self.assertIn("types: [labeled]", self.workflow)
        self.assertIn("github.event.label.name == 'aqc-trusted-validation'", self.workflow)
        self.assertIn("github.event.pull_request.head.repo.full_name != github.repository", self.workflow)
        self.assertIn("github.event.pull_request.user.login == 'dependabot[bot]'", self.workflow)

    def test_validates_one_exact_head_without_persisted_credentials(self):
        self.assertIn("CONTRIBUTION_SHA: '${{ github.event.pull_request.head.sha }}'", self.workflow)
        self.assertIn("ref: '${{ env.CONTRIBUTION_SHA }}'", self.workflow)
        self.assertIn("ref: a8a345b385d844e4857f97d86d43eac41b513732", self.workflow)
        self.assertGreaterEqual(self.workflow.count("persist-credentials: false"), 2)
        self.assertIn("path: trusted-aqc-engine", self.workflow)
        self.assertIn("path: contribution", self.workflow)

    def test_executes_only_the_trusted_engine_against_contribution_data(self):
        self.assertIn("npm ci --prefix trusted-aqc-engine --ignore-scripts", self.workflow)
        self.assertNotIn("npm run", self.workflow)
        self.assertIn("working-directory: contribution", self.workflow)
        self.assertIn("node ../trusted-aqc-engine/src/cli/aqc.mjs validate .", self.workflow)

    def test_publishes_an_exact_head_status(self):
        self.assertIn("statuses: write", self.workflow)
        self.assertEqual(self.workflow.count("statuses/${CONTRIBUTION_SHA}"), 2)
        self.assertEqual(self.workflow.count("context='Trusted AQC checks'"), 2)


if __name__ == "__main__":
    unittest.main()
