import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCANNER = ROOT / "skills" / "capability-collision-detection" / "scripts" / "scan_capabilities.py"
SPEC = importlib.util.spec_from_file_location("scan_capabilities", SCANNER)
scanner = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = scanner
SPEC.loader.exec_module(scanner)


class CapabilityCollisionDetectionTests(unittest.TestCase):
    def test_detects_exact_cross_type_and_mcp_collisions(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            first = root / "first"
            second = root / "second"
            for source in (first, second):
                (source / "skills" / "review").mkdir(parents=True)
                (source / "skills" / "review" / "SKILL.md").write_text(
                    "---\nname: review\ndescription: Inspect code changes for quality and security.\n---\n"
                )
            (first / "com.github.copilot" / "agents").mkdir(parents=True)
            (first / "com.github.copilot" / "agents" / "review.agent.md").write_text(
                "---\nname: Review\ndescription: Review incoming changes.\n---\n"
            )
            for source in (first, second):
                (source / "mcp.json").write_text(
                    json.dumps({"mcpServers": {"github": {"url": "https://example.test/mcp"}}})
                )

            inventory = scanner.find_capabilities(first) + scanner.find_capabilities(second)
            exact = scanner.exact_collisions(inventory)
            cross_type = scanner.cross_type_collisions(inventory)

        self.assertEqual({item["identity"] for item in exact}, {"github", "review"})
        self.assertEqual(cross_type[0]["identity"], "review")
        self.assertEqual(cross_type[0]["types"], ["agent", "skill"])

    def test_requires_explicit_existing_roots(self):
        with self.assertRaises(FileNotFoundError):
            scanner.find_capabilities(Path("/does-not-exist"))


if __name__ == "__main__":
    unittest.main()
