import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "skill-creator"
PLUGIN_MANIFEST = ROOT / "plugin.json"
MCP_CONFIG = ROOT / "mcp.json"
COPILOT_AGENT = (
    ROOT / "com.github.copilot" / "agents" / "custom-agent-foundry.agent.md"
)
sys.path.insert(0, str(SKILL))


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class CopilotCompatibilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.run_eval = load_module("run_eval", SKILL / "scripts" / "run_eval.py")
        cls.viewer = load_module(
            "generate_review", SKILL / "eval-viewer" / "generate_review.py"
        )
        cls.aggregate = load_module(
            "aggregate_benchmark", SKILL / "scripts" / "aggregate_benchmark.py"
        )
        cls.improve = load_module(
            "improve_description", SKILL / "scripts" / "improve_description.py"
        )

    def test_agent_plugins_1_layout_and_mcp_contract(self):
        manifest = json.loads(PLUGIN_MANIFEST.read_text())
        self.assertEqual(
            manifest["$schema"],
            "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
        )
        self.assertNotIn("agents", manifest)
        self.assertNotIn("skills", manifest)
        self.assertNotIn("mcpServers", manifest)

        self.assertTrue(COPILOT_AGENT.is_file())
        self.assertFalse((ROOT / "agents").exists())
        self.assertFalse((ROOT / ".mcp.json").exists())

        mcp_config = json.loads(MCP_CONFIG.read_text())
        self.assertEqual(
            mcp_config["$schema"],
            "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
        )
        self.assertEqual(set(mcp_config), {"$schema", "mcpServers"})
        self.assertEqual(
            mcp_config["mcpServers"]["io.github.github/github-mcp-server"],
            {
                "type": "streamable-http",
                "url": "https://api.githubcopilot.com/mcp/",
            },
        )

    def test_documented_layout_is_consumed_by_aggregator(self):
        skill_text = (SKILL / "SKILL.md").read_text()
        self.assertIn("with_skill/run-1/outputs/", skill_text)
        self.assertIn("without_skill/run-1/outputs/", skill_text)

        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            eval_dir = root / "eval-example"
            run_dir = eval_dir / "with_skill" / "run-1"
            run_dir.mkdir(parents=True)
            (eval_dir / "eval_metadata.json").write_text(
                json.dumps({"eval_id": 7, "eval_name": "example"})
            )
            (run_dir / "grading.json").write_text(
                json.dumps(
                    {
                        "summary": {"pass_rate": 1.0, "passed": 1, "failed": 0, "total": 1},
                        "timing": {"total_duration_seconds": 0.1},
                    }
                )
            )
            results = self.aggregate.load_run_results(root)

        self.assertEqual(len(results["with_skill"]), 1)
        self.assertEqual(results["with_skill"][0]["eval_id"], 7)

    def test_viewer_escapes_script_terminators_in_generated_output(self):
        attack = "</script><script>alert('review')</script>"
        html = self.viewer.generate_html(
            [{"id": "malicious", "output": attack}], "test-skill"
        )
        self.assertNotIn(attack, html)
        self.assertIn("\\u003c/script\\u003e", html)

    def test_copilot_trigger_evaluation_uses_plugin_and_otel_event(self):
        observed = {}

        def fake_run(cmd, **kwargs):
            observed["cmd"] = cmd
            observed["env"] = kwargs["env"]
            plugin_dir = Path(cmd[cmd.index("--plugin-dir") + 1])
            skills = list((plugin_dir / "skills").iterdir())
            self.assertEqual(len(skills), 1)
            skill_name = skills[0].name
            otel_path = Path(kwargs["env"]["COPILOT_OTEL_FILE_EXPORTER_PATH"])
            otel_path.write_text(
                json.dumps(
                    {
                        "events": [
                            {
                                "name": "github.copilot.skill.invoked",
                                "attributes": {"github.copilot.skill.name": skill_name},
                            }
                        ]
                    }
                )
                + "\n"
            )
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

        with mock.patch.object(self.run_eval.subprocess, "run", side_effect=fake_run):
            triggered = self.run_eval._run_copilot_query(
                "Create a skill",
                "skill-creator",
                "Create and improve agent skills.",
                30,
                str(ROOT),
                None,
                "/usr/local/bin/copilot",
            )

        self.assertTrue(triggered)
        self.assertIn("--output-format", observed["cmd"])
        self.assertEqual(observed["env"]["COPILOT_OTEL_EXPORTER_TYPE"], "file")

    def test_copilot_is_preferred_and_missing_clis_fail_clearly(self):
        with mock.patch.object(
            self.run_eval.shutil,
            "which",
            side_effect=lambda name: "/bin/copilot" if name == "copilot" else None,
        ):
            self.assertEqual(self.run_eval.find_model_cli(), ("copilot", "/bin/copilot"))

        with mock.patch.object(self.run_eval.shutil, "which", return_value=None):
            with self.assertRaisesRegex(RuntimeError, "requires GitHub Copilot CLI"):
                self.run_eval.find_model_cli()

    def test_description_improvement_uses_copilot_when_available(self):
        completed = subprocess.CompletedProcess(
            ["copilot"], 0, stdout="<new_description>Improved</new_description>\n", stderr=""
        )
        with mock.patch.object(
            self.improve.shutil,
            "which",
            side_effect=lambda name: "/bin/copilot" if name == "copilot" else None,
        ), mock.patch.object(
            self.improve.subprocess, "run", return_value=completed
        ) as run:
            output = self.improve._call_model_cli("Improve this", None)

        self.assertIn("Improved", output)
        command = run.call_args.args[0]
        self.assertEqual(command[:3], ["/bin/copilot", "-p", "Improve this"])
        self.assertIsNone(run.call_args.kwargs["input"])


if __name__ == "__main__":
    unittest.main()
