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

    def test_scans_an_explicit_mcp_configuration_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            config = Path(temp_dir) / "mcp-config.json"
            config.write_text(json.dumps({"mcpServers": {"github": {"url": "https://example.test/mcp"}}}))

            inventory = scanner.find_capabilities(config)

        self.assertEqual(inventory[0].capability_type, "mcp-server")
        self.assertEqual(inventory[0].identity, "github")

    def test_reads_vs_code_servers_and_reports_differently_named_mcp_aliases(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "first").mkdir()
            (root / "second" / ".vscode").mkdir(parents=True)
            configuration = {"type": "http", "url": "https://example.test/mcp", "headers": {"X-Mode": "test"}}
            (root / "first" / "mcp.json").write_text(json.dumps({"mcpServers": {"github": configuration}}))
            (root / "second" / ".vscode" / "mcp.json").write_text(json.dumps({"servers": {"github-registry": configuration}}))

            inventory = scanner.deduplicate_capabilities(
                scanner.find_capabilities(root / "first") + scanner.find_capabilities(root / "second")
            )
            aliases = scanner.mcp_aliases(inventory)

        self.assertEqual(aliases[0]["identities"], ["github", "github-registry"])
        self.assertTrue(aliases[0]["configuration_match"])

    def test_accepts_incomplete_mcp_maps_without_aborting_the_scan(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "mcp.json").write_text(json.dumps({"mcpServers": None}))
            (root / "skills" / "review").mkdir(parents=True)
            (root / "skills" / "review" / "SKILL.md").write_text("---\nname: review\n---\n")

            inventory = scanner.find_capabilities(root)

        self.assertEqual([item.identity for item in inventory], ["review"])

    def test_parses_block_scalar_descriptions_for_overlap_detection(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            for name, description in {
                "first": "description: |\n  Inspect code changes for security and quality.",
                "second": "description: Inspect code changes for security and quality.",
            }.items():
                path = root / "skills" / name
                path.mkdir(parents=True)
                (path / "SKILL.md").write_text(f"---\nname: {name}\n{description}\n---\n")

            overlaps = scanner.possible_overlaps(scanner.find_capabilities(root), 0.72)

        self.assertEqual(overlaps[0]["similarity"], 1.0)

    def test_ignores_generated_descendants_without_ignoring_an_approved_build_root(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir) / "build" / "approved-source"
            skill = root / "skills" / "review"
            skill.mkdir(parents=True)
            (skill / "SKILL.md").write_text("---\nname: review\n---\n")
            generated = root / "node_modules" / "ignored"
            generated.mkdir(parents=True)
            (generated / "SKILL.md").write_text("---\nname: ignored\n---\n")

            inventory = scanner.find_capabilities(root)

        self.assertEqual([item.identity for item in inventory], ["review"])

    def test_deduplicates_capabilities_found_through_overlapping_roots(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            skill = root / "skills" / "review"
            skill.mkdir(parents=True)
            (skill / "SKILL.md").write_text("---\nname: review\n---\n")

            inventory = scanner.deduplicate_capabilities(
                scanner.find_capabilities(root) + scanner.find_capabilities(root / "skills")
            )

        self.assertEqual(len(inventory), 1)
        self.assertEqual(scanner.exact_collisions(inventory), [])


if __name__ == "__main__":
    unittest.main()
