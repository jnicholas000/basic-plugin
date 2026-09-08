#!/usr/bin/env python3
"""Read-only capability inventory for explicitly supplied source roots."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable


IGNORED_DIRECTORIES = {
    ".git",
    ".next",
    ".venv",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "vendor",
}
TOKEN_PATTERN = re.compile(r"[a-z0-9][a-z0-9-]{2,}")
FRONTMATTER_PATTERN = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)


@dataclass(frozen=True)
class Capability:
    capability_type: str
    identity: str
    display_name: str
    description: str
    source_root: str
    path: str
    mcp_target: str = ""
    mcp_configuration_hash: str = ""


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def parse_frontmatter(text: str) -> dict[str, str]:
    match = FRONTMATTER_PATTERN.match(text)
    if not match:
        return {}
    values: dict[str, str] = {}
    lines = match.group(1).splitlines()
    index = 0
    while index < len(lines):
        line = lines[index]
        key, separator, value = line.partition(":")
        if not separator or line.startswith((" ", "\t")):
            index += 1
            continue
        value = value.strip()
        if value not in {"|", ">", "|-", ">-", "|+", ">+"}:
            values[key.strip()] = value.strip("'\"")
            index += 1
            continue

        block_lines: list[str] = []
        block_indent: int | None = None
        index += 1
        while index < len(lines):
            continuation = lines[index]
            if continuation.strip() == "":
                block_lines.append("")
                index += 1
                continue
            indent = len(continuation) - len(continuation.lstrip())
            if indent == 0:
                break
            if block_indent is None:
                block_indent = indent
            if indent < block_indent:
                break
            block_lines.append(continuation[block_indent:])
            index += 1
        if value.startswith(">"):
            values[key.strip()] = " ".join(part.strip() for part in block_lines if part.strip())
        else:
            values[key.strip()] = "\n".join(block_lines).strip()
    return values


def text_tokens(text: str) -> set[str]:
    return {token for token in TOKEN_PATTERN.findall(text.lower()) if len(token) > 3}


def iter_files(root: Path) -> Iterable[Path]:
    if root.is_file():
        yield root
        return
    for path in root.rglob("*"):
        relative_path = path.relative_to(root)
        if any(part in IGNORED_DIRECTORIES for part in relative_path.parts):
            continue
        if path.is_file():
            yield path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def stable_value(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): stable_value(item) for key, item in sorted(value.items())}
    if isinstance(value, list):
        return [stable_value(item) for item in value]
    return value


def mcp_target(server: dict[str, Any]) -> str:
    if isinstance(server.get("url"), str):
        return f"url:{server['url']}"
    if isinstance(server.get("command"), str):
        arguments = json.dumps(stable_value(server.get("args", [])), separators=(",", ":"))
        return f"stdio:{server['command']}:{arguments}"
    return ""


def mcp_configuration_hash(server: dict[str, Any]) -> str:
    serialized = json.dumps(stable_value(server), sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def mcp_servers(config: dict[str, Any]) -> dict[str, Any]:
    servers = config.get("mcpServers", config.get("servers", {}))
    return servers if isinstance(servers, dict) else {}


def find_capabilities(root: Path) -> list[Capability]:
    if not root.exists():
        raise FileNotFoundError(f"scan root does not exist: {root}")
    capabilities: list[Capability] = []
    for path in iter_files(root):
        relative_path = path.name if root.is_file() else str(path.relative_to(root))
        if path.name == "SKILL.md":
            frontmatter = parse_frontmatter(read_text(path))
            display_name = frontmatter.get("name", path.parent.name)
            capabilities.append(
                Capability(
                    "skill",
                    normalize(display_name),
                    display_name,
                    frontmatter.get("description", ""),
                    str(root),
                    relative_path,
                )
            )
        elif path.name.endswith(".agent.md"):
            frontmatter = parse_frontmatter(read_text(path))
            display_name = frontmatter.get("name", path.name.removesuffix(".agent.md"))
            capabilities.append(
                Capability(
                    "agent",
                    normalize(display_name),
                    display_name,
                    frontmatter.get("description", ""),
                    str(root),
                    relative_path,
                )
            )
        elif path.name == "plugin.json":
            try:
                manifest = json.loads(read_text(path))
            except json.JSONDecodeError:
                continue
            display_name = str(manifest.get("name", path.parent.name))
            capabilities.append(
                Capability(
                    "plugin",
                    normalize(display_name),
                    display_name,
                    str(manifest.get("description", "")),
                    str(root),
                    relative_path,
                )
            )
        elif path.name in {"mcp.json", ".mcp.json", "mcp-config.json"}:
            try:
                config = json.loads(read_text(path))
            except json.JSONDecodeError:
                continue
            for name, server in mcp_servers(config).items():
                description = ""
                if isinstance(server, dict):
                    description = str(server.get("description", server.get("url", "")))
                capabilities.append(
                    Capability(
                        "mcp-server",
                        normalize(str(name)),
                        str(name),
                        description,
                        str(root),
                        f"{relative_path}#{name}",
                        mcp_target(server) if isinstance(server, dict) else "",
                        mcp_configuration_hash(server) if isinstance(server, dict) else "",
                    )
                )
    return capabilities


def resolved_capability_path(capability: Capability) -> str:
    relative_path = capability.path.partition("#")[0]
    root = Path(capability.source_root)
    path = root if root.is_file() else root / relative_path
    return str(path.resolve())


def deduplicate_capabilities(capabilities: Iterable[Capability]) -> list[Capability]:
    unique: dict[tuple[str, str, str], Capability] = {}
    for capability in capabilities:
        key = (capability.capability_type, capability.identity, resolved_capability_path(capability))
        unique.setdefault(key, capability)
    return list(unique.values())


def exact_collisions(capabilities: list[Capability]) -> list[dict]:
    groups: dict[tuple[str, str], list[Capability]] = defaultdict(list)
    for capability in capabilities:
        groups[(capability.capability_type, capability.identity)].append(capability)
    return [
        {
            "type": capability_type,
            "identity": identity,
            "capabilities": [asdict(item) for item in items],
        }
        for (capability_type, identity), items in sorted(groups.items())
        if len({(item.source_root, item.path) for item in items}) > 1
    ]


def cross_type_collisions(capabilities: list[Capability]) -> list[dict]:
    groups: dict[str, list[Capability]] = defaultdict(list)
    for capability in capabilities:
        groups[capability.identity].append(capability)
    return [
        {
            "identity": identity,
            "types": sorted({item.capability_type for item in items}),
            "capabilities": [asdict(item) for item in items],
        }
        for identity, items in sorted(groups.items())
        if len({item.capability_type for item in items}) > 1
    ]


def mcp_aliases(capabilities: list[Capability]) -> list[dict]:
    groups: dict[str, list[Capability]] = defaultdict(list)
    for capability in capabilities:
        if capability.capability_type == "mcp-server" and capability.mcp_target:
            groups[capability.mcp_target].append(capability)
    return [
        {
            "identities": sorted({item.identity for item in items}),
            "configuration_match": len({item.mcp_configuration_hash for item in items}) == 1,
            "capabilities": [asdict(item) for item in items],
        }
        for items in groups.values()
        if len({item.identity for item in items}) > 1
    ]


def possible_overlaps(capabilities: list[Capability], threshold: float) -> list[dict]:
    findings: list[dict] = []
    for index, first in enumerate(capabilities):
        first_tokens = text_tokens(first.description)
        if len(first_tokens) < 4:
            continue
        for second in capabilities[index + 1 :]:
            if first.capability_type != second.capability_type or first.identity == second.identity:
                continue
            second_tokens = text_tokens(second.description)
            if len(second_tokens) < 4:
                continue
            similarity = len(first_tokens & second_tokens) / len(first_tokens | second_tokens)
            if similarity >= threshold:
                findings.append(
                    {
                        "type": first.capability_type,
                        "similarity": round(similarity, 2),
                        "capabilities": [asdict(first), asdict(second)],
                    }
                )
    return sorted(findings, key=lambda item: item["similarity"], reverse=True)


def render_markdown(report: dict) -> str:
    counts = Counter(item["capability_type"] for item in report["inventory"])
    lines = ["# Capability Collision Report", "", "## Coverage"]
    lines.extend(f"- Scanned root: `{root}`" for root in report["roots"])
    lines.extend(["", "## Inventory", "| Type | Count |", "| --- | ---: |"])
    lines.extend(f"| {kind} | {count} |" for kind, count in sorted(counts.items()))
    if not counts:
        lines.append("| None found | 0 |")

    lines.extend(["", "## Exact collisions"])
    if not report["exact_collisions"]:
        lines.append("No exact same-type collisions found.")
    for finding in report["exact_collisions"]:
        sources = "; ".join(f"`{item['source_root']}/{item['path']}`" for item in finding["capabilities"])
        lines.append(f"- **{finding['type']} `{finding['identity']}`**: {sources}")

    lines.extend(["", "## Cross-type name collisions"])
    if not report["cross_type_collisions"]:
        lines.append("No cross-type name collisions found.")
    for finding in report["cross_type_collisions"]:
        lines.append(f"- **`{finding['identity']}`**: {', '.join(finding['types'])}")

    lines.extend(["", "## MCP aliases"])
    if not report["mcp_aliases"]:
        lines.append("No differently named MCP servers sharing a target found.")
    for finding in report["mcp_aliases"]:
        match = "matching configurations" if finding["configuration_match"] else "different configurations"
        lines.append(f"- **{', '.join(finding['identities'])}**: same target, {match}.")

    lines.extend(["", "## Possible responsibility overlaps"])
    if not report["possible_overlaps"]:
        lines.append("No high-similarity description overlaps found.")
    for finding in report["possible_overlaps"]:
        names = " and ".join(f"`{item['display_name']}`" for item in finding["capabilities"])
        lines.append(f"- **{finding['type']} ({finding['similarity']:.0%})**: {names}")

    lines.extend([
        "",
        "## Interpretation",
        "Exact collisions require a source-and-precedence review. Cross-type and similarity findings are review candidates, not proof that a capability should be removed.",
    ])
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", action="append", required=True, help="Explicit root to inspect. Repeat for each source.")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    parser.add_argument("--similarity-threshold", type=float, default=0.72)
    args = parser.parse_args()
    if not 0 < args.similarity_threshold <= 1:
        parser.error("--similarity-threshold must be greater than 0 and at most 1")

    roots = [Path(value).resolve() for value in args.root]
    missing = [str(root) for root in roots if not root.exists()]
    if missing:
        parser.error(f"scan roots do not exist: {', '.join(missing)}")

    inventory = deduplicate_capabilities(capability for root in roots for capability in find_capabilities(root))
    report = {
        "roots": [str(root) for root in roots],
        "inventory": [asdict(item) for item in inventory],
        "exact_collisions": exact_collisions(inventory),
        "cross_type_collisions": cross_type_collisions(inventory),
        "mcp_aliases": mcp_aliases(inventory),
        "possible_overlaps": possible_overlaps(inventory, args.similarity_threshold),
    }
    print(json.dumps(report, indent=2, sort_keys=True) if args.format == "json" else render_markdown(report), end="")
    return 0


if __name__ == "__main__":
    sys.exit(main())
