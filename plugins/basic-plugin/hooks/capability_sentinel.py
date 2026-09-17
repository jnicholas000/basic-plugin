#!/usr/bin/env python3
"""Non-blocking Copilot hook that surfaces confirmed capability collisions."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Any, Iterable


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
SCANNER_PATH = (
    PLUGIN_ROOT
    / "skills"
    / "capability-collision-detection"
    / "scripts"
    / "scan_capabilities.py"
)
SCANNER_SPEC = importlib.util.spec_from_file_location("capability_scanner", SCANNER_PATH)
assert SCANNER_SPEC and SCANNER_SPEC.loader
scanner = importlib.util.module_from_spec(SCANNER_SPEC)
sys.modules[SCANNER_SPEC.name] = scanner
SCANNER_SPEC.loader.exec_module(scanner)

CAPABILITY_MARKERS = (
    ".agent.md",
    ".mcp.json",
    "agents/",
    "mcp-config.json",
    "mcp.json",
    "plugin.json",
    "skill.md",
    "skills/",
)


def standard_roots(cwd: str) -> list[Path]:
    home = Path.home()
    candidates = [
        Path(cwd),
        home / ".copilot" / "installed-plugins",
        home / ".copilot" / "skills",
        home / ".copilot" / "agents",
        home / ".copilot" / "mcp-config.json",
        home / ".agents" / "skills",
    ]
    configured_roots = os.environ.get("CAPABILITY_SENTINEL_ROOTS", "")
    candidates.extend(Path(value) for value in configured_roots.split(os.pathsep) if value)
    return [path.resolve() for path in candidates if path.exists()]


def inventory(roots: Iterable[Path]) -> dict[str, Any]:
    capabilities = scanner.deduplicate_capabilities(
        item for root in roots for item in scanner.find_capabilities(root)
    )
    return {
        "inventory": [scanner.asdict(item) for item in capabilities],
        "exact_collisions": scanner.exact_collisions(capabilities),
        "cross_type_collisions": scanner.cross_type_collisions(capabilities),
        "mcp_aliases": scanner.mcp_aliases(capabilities),
    }


def fingerprint(report: dict[str, Any]) -> str:
    stable = json.dumps(report, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(stable.encode("utf-8")).hexdigest()


def state_path() -> Path | None:
    data_directory = os.environ.get("COPILOT_PLUGIN_DATA")
    if not data_directory:
        return None
    return Path(data_directory) / "capability-sentinel-state.json"


def load_previous_fingerprint(path: Path | None) -> str | None:
    if not path or not path.is_file():
        return None
    try:
        return str(json.loads(path.read_text(encoding="utf-8")).get("fingerprint", "")) or None
    except (OSError, json.JSONDecodeError):
        return None


def save_fingerprint(path: Path | None, value: str) -> None:
    if not path:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"fingerprint": value}) + "\n", encoding="utf-8")


def collision_context(report: dict[str, Any], changed: bool) -> str | None:
    exact = report["exact_collisions"]
    cross_type = report["cross_type_collisions"]
    aliases = report["mcp_aliases"]
    if not exact and not cross_type and not aliases:
        return None
    exact_names = ", ".join(f"{item['type']}:{item['identity']}" for item in exact[:3])
    cross_names = ", ".join(item["identity"] for item in cross_type[:3])
    alias_names = ", ".join("/".join(item["identities"]) for item in aliases[:3])
    parts = ["Capability Sentinel detected active collisions."]
    if changed:
        parts.append("The capability inventory changed since its last recorded scan.")
    if exact_names:
        parts.append(f"Exact collisions: {exact_names}.")
    if cross_names:
        parts.append(f"Cross-type name collisions: {cross_names}.")
    if alias_names:
        parts.append(f"MCP aliases sharing a target: {alias_names}.")
    parts.append(
        "Do not assume precedence. Before selecting, renaming, disabling, or removing a capability, use the capability-collision-detection skill for the detailed report."
    )
    return " ".join(parts)


def result_text(payload: dict[str, Any]) -> str:
    tool_result = payload.get("toolResult") or payload.get("tool_result") or {}
    return str(tool_result.get("textResultForLlm") or tool_result.get("text_result_for_llm") or "")


def discovery_mentions_multiple_capabilities(payload: dict[str, Any]) -> bool:
    text = result_text(payload).lower()
    if sum(marker in text for marker in CAPABILITY_MARKERS) < 2:
        return False
    paths = {line.strip() for line in text.splitlines() if any(marker in line.lower() for marker in CAPABILITY_MARKERS)}
    return len(paths) >= 2


def run(payload: dict[str, Any], after_discovery: bool = False) -> dict[str, str]:
    if after_discovery and not discovery_mentions_multiple_capabilities(payload):
        return {}
    cwd = str(payload.get("cwd") or Path.cwd())
    report = inventory(standard_roots(cwd))
    path = state_path()
    previous = load_previous_fingerprint(path)
    current = fingerprint(report)
    save_fingerprint(path, current)
    context = collision_context(report, changed=previous is not None and previous != current)
    return {"additionalContext": context} if context else {}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--after-discovery", action="store_true")
    args = parser.parse_args()
    try:
        payload = json.load(sys.stdin)
        print(json.dumps(run(payload, after_discovery=args.after_discovery)))
    except (json.JSONDecodeError, OSError, ValueError) as error:
        print(json.dumps({"warning": f"Capability Sentinel skipped: {error}"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
