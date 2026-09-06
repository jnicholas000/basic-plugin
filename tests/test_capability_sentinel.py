import importlib.util
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SENTINEL = ROOT / "hooks" / "capability_sentinel.py"
SPEC = importlib.util.spec_from_file_location("capability_sentinel", SENTINEL)
sentinel = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = sentinel
SPEC.loader.exec_module(sentinel)


class CapabilitySentinelTests(unittest.TestCase):
    def collision_roots(self, root: Path) -> list[Path]:
        first = root / "first" / "skills" / "review"
        second = root / "second" / "skills" / "review"
        for path in (first, second):
            path.mkdir(parents=True)
            (path / "SKILL.md").write_text("---\nname: review\ndescription: Review code safely.\n---\n")
        return [root / "first", root / "second"]

    def test_session_start_injects_collision_context_and_writes_state(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            state = root / "state"
            roots = self.collision_roots(root)
            with mock.patch.object(sentinel, "standard_roots", return_value=roots), mock.patch.dict(
                os.environ, {"COPILOT_PLUGIN_DATA": str(state)}, clear=False
            ):
                result = sentinel.run({"cwd": str(root)})

            self.assertIn("Exact collisions: skill:review", result["additionalContext"])
            self.assertNotIn("changed since its last recorded scan", result["additionalContext"])
            self.assertTrue((state / "capability-sentinel-state.json").is_file())

    def test_discovery_runs_only_after_multiple_capability_results(self):
        payload = {"toolResult": {"textResultForLlm": "skills/review/SKILL.md\nskills/deploy/SKILL.md"}}
        self.assertTrue(sentinel.discovery_mentions_multiple_capabilities(payload))
        self.assertFalse(
            sentinel.discovery_mentions_multiple_capabilities(
                {"toolResult": {"textResultForLlm": "src/components/button.tsx"}}
            )
        )

    def test_hook_contract_is_narrow_and_non_blocking(self):
        config = json.loads((ROOT / "hooks.json").read_text())
        hooks = config["hooks"]
        self.assertIn("sessionStart", hooks)
        self.assertEqual(hooks["postToolUse"][0]["matcher"], "glob|grep|view")
        self.assertNotIn("preToolUse", hooks)


if __name__ == "__main__":
    unittest.main()
