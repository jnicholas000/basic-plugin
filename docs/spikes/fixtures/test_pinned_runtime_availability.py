"""Independent Odo contract frozen before producer; inert record data only.

No runtime archive, filesystem cache, acquisition, extraction or target invocation.
Operational ordering/ownership/deadline assertions belong to independent wrapper review.
"""
import copy
import unittest

from pinned_runtime_availability import (
    validate_acquisition_policy,
    validate_archive_entries,
    validate_availability_evidence,
)

MIB = 1024 * 1024
PREFIX = "node-v24.22.1-linux-x64"
CACHE = "/opt/hostedtoolcache/node/24.22.1/x64"
ARCHIVE_SHA = "eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c"
NODE_SHA = "e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb"
HEADER_SHA = "0f37dafb4917e62582daa0dc51ee3e3f9d0636dc1d822c23a1a23af112ddbfad"
NPM_SHA = "f6478d5600180a23f73e4217610c7709a71cedb4ae13f6c3e15ecb457f5d4fd6"


def policy():
    return {
        "url": "https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.gz",
        "archive_sha256": ARCHIVE_SHA, "cache_path": CACHE, "marker_path": CACHE + ".complete",
        "max_download_bytes": 96 * MIB, "network_seconds": 60, "max_entries": 32768,
        "max_depth": 32, "max_path_bytes": 4096, "max_file_bytes": 192 * MIB,
        "max_unpacked_bytes": 512 * MIB, "max_peak_disk_bytes": 1288490188,
        "controller_seconds": 180, "cleanup_seconds": 15,
        "redirects": 0, "retries": 0, "resume": False,
    }


def entry(path="", kind="directory", size=0, mode=None, linkname=""):
    return {"name": PREFIX + ("/" + path if path else "/"), "kind": kind,
            "size": size, "mode": mode if mode is not None else (0o755 if kind == "directory" else 0o644),
            "linkname": linkname}


def archive():
    return [entry(), entry("bin"), entry("bin/node", "file", 8, 0o755),
            entry("include"), entry("include/node"), entry("include/node/node_version.h", "file", 7),
            entry("lib"), entry("lib/node_modules"), entry("lib/node_modules/npm"),
            entry("lib/node_modules/npm/bin"), entry("lib/node_modules/npm/bin/npm-cli.js", "file", 6),
            entry("lib/node_modules/npm/package.json", "file", 5),
            entry("bin/npm", "symlink", mode=0o777, linkname="../lib/node_modules/npm/bin/npm-cli.js")]


def runtime_files():
    values = [
        ("/runtime/node", 126879696, NODE_SHA),
        ("/lib64/ld-linux-x86-64.so.2", 236616, "c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da"),
        ("/lib/x86_64-linux-gnu/libdl.so.2", 14408, "c2994527172cc23b7fb0f7d611b71e00a37da27af12c2e5e9e0dc1a742886c96"),
        ("/lib/x86_64-linux-gnu/libstdc++.so.6", 2592224, "1fd75fe70354a416d75aef22bcae68c47bd25d20e2d0568c30b1a9838cf62f11"),
        ("/lib/x86_64-linux-gnu/libm.so.6", 952616, "fce00b6f25f459cf4ae0b7fae4257909a1a8a86f9149e7c029a5d617baf1ccd0"),
        ("/lib/x86_64-linux-gnu/libgcc_s.so.1", 183024, "d93224d2b0dab4247598be683adca02f5cf00586f99c187579cd7e92058fb7cb"),
        ("/lib/x86_64-linux-gnu/libpthread.so.0", 14408, "90491a21ce44efcf3bd4b65ec82501c091d7ebe7f8d9b341dd01d721001d9ecd"),
        ("/lib/x86_64-linux-gnu/libc.so.6", 2129424, "3a15d66867d83762c7f2f1e37359cb8f6c5743edb369c65285cb0b1c4f7498bf"),
        ("/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2", 236616, "c20a2dc8917c755f02b94049356320fe1f62ac7d9f8994731f807d9df39302da"),
    ]
    return [{"source": CACHE + "/bin/node" if dest == "/runtime/node" else
             "/usr/lib/x86_64-linux-gnu/" + ("libstdc++.so.6.0.33" if dest.endswith("/libstdc++.so.6") else dest.rsplit("/", 1)[1]),
             "destination": dest, "size": size, "sha256": digest} for dest, size, digest in values]


def evidence():
    return {"archive_sha256": ARCHIVE_SHA,
            "cache_files": [{"path": "bin/node", "size": 126879696, "sha256": NODE_SHA},
                            {"path": "include/node/node_version.h", "size": 17, "sha256": HEADER_SHA},
                            {"path": "lib/node_modules/npm/package.json", "size": 29, "sha256": NPM_SHA}],
            "runtime_files": runtime_files(), "marker_empty": True, "source_unchanged": True,
            "cleanup": {"completed": True, "uncertain": False, "remaining_owned_paths": []}}


class PinnedRuntimeAvailabilityContract(unittest.TestCase):
    def test_01_exact_policy_sources_budgets_and_no_fallback(self):
        good = policy()
        before = copy.deepcopy(good)
        self.assertIs(validate_acquisition_policy(good), True)
        self.assertEqual(good, before)
        changes = {
            "url": "https://nodejs.org/dist/latest/node.tar.gz", "archive_sha256": "a" * 64,
            "cache_path": CACHE + "-other", "marker_path": CACHE + "/.complete",
            "max_download_bytes": 96 * MIB + 1, "network_seconds": 61, "max_entries": 32769,
            "max_depth": 33, "max_path_bytes": 4097, "max_file_bytes": 192 * MIB + 1,
            "max_unpacked_bytes": 512 * MIB + 1, "max_peak_disk_bytes": 1288490189,
            "controller_seconds": 181, "cleanup_seconds": 16, "redirects": 1, "retries": 1, "resume": True,
        }
        for key, value in changes.items():
            with self.subTest(field=key), self.assertRaises(ValueError):
                validate_acquisition_policy({**good, key: value})
        for key in good:
            missing = dict(good)
            del missing[key]
            with self.subTest(missing=key), self.assertRaises(ValueError):
                validate_acquisition_policy(missing)
        for changed in [{**good, "mirror": "https://other.invalid"}, {**good, "retries": False},
                        {**good, "resume": 0}, {**good, "network_seconds": 60.0}]:
            with self.assertRaises(ValueError):
                validate_acquisition_policy(changed)

    def test_02_valid_table_strips_one_root_and_orders_writes_before_links(self):
        entries = archive()
        before = copy.deepcopy(entries)
        result = validate_archive_entries(list(reversed(entries)))
        self.assertEqual(entries, before)
        self.assertEqual(len(result), len(entries) - 1)
        actual = {r["path"]: r for r in result}
        for record in before[1:]:
            path = record["name"][len(PREFIX) + 1:]
            self.assertEqual(actual[path], {"path": path, **{k: record[k] for k in ("kind", "size", "mode", "linkname")}})
        link_index = next(i for i, r in enumerate(result) if r["kind"] == "symlink")
        self.assertTrue(all(r["kind"] != "symlink" for r in result[:link_index]))
        self.assertTrue(all(r["kind"] == "symlink" for r in result[link_index:]))
        positions = {r["path"]: i for i, r in enumerate(result)}
        for path, i in positions.items():
            parent = path.rsplit("/", 1)[0] if "/" in path else ""
            if parent in positions:
                self.assertLess(positions[parent], i)
        root_without_slash = archive()
        root_without_slash[0]["name"] = PREFIX
        self.assertEqual(len(validate_archive_entries(root_without_slash)), len(entries) - 1)

    def test_03_unsafe_paths_types_duplicates_and_modes_reject(self):
        for name in ["/absolute", PREFIX + "/../escape", PREFIX + "/./x", PREFIX + "//x",
                     "other/x", PREFIX + "/x\x00y", PREFIX + "/x\ny", PREFIX + "/x\\y"]:
            bad = entry("x", "file", 1)
            bad["name"] = name
            with self.subTest(name=name), self.assertRaises(ValueError):
                validate_archive_entries([entry(), bad])
        for changes in [{"kind": "hardlink", "linkname": "bin/node"}, {"kind": "fifo"}, {"kind": "device"},
                        {"kind": "socket"}, {"mode": 0o4755}, {"mode": 0o2755}, {"mode": -1},
                        {"size": True}, {"size": -1}, {"size": 1.5}, {"mode": True},
                        {"linkname": "unexpected"}, {"extra": True}]:
            with self.subTest(change=changes), self.assertRaises(ValueError):
                validate_archive_entries([entry(), {**entry("x", "file", 1), **changes}])
        for entries in [[], [entry(), entry()], [entry(), entry("x"), entry("x", "file", 1)],
                        [entry(), entry("x", "file", 1), entry("x/y", "file", 1)],
                        [entry(), entry("dir", "directory", 1)], [entry(), entry("x", "file", 1), entry("x", "file", 1)]]:
            with self.subTest(entries=entries), self.assertRaises(ValueError):
                validate_archive_entries(entries)

    def test_04_internal_npm_links_resolve_and_unsafe_link_graphs_reject(self):
        good = archive() + [entry("lib/node_modules/npm/node_modules"),
                            entry("lib/node_modules/npm/node_modules/.bin"),
                            entry("lib/node_modules/npm/node_modules/.bin/npm", "symlink", mode=0o777, linkname="../../bin/npm-cli.js"),
                            entry("bin/npm-alias", "symlink", mode=0o777, linkname="npm")]
        result = validate_archive_entries(good)
        self.assertEqual(sum(r["kind"] == "symlink" for r in result), 3)
        bad_links = ["/bin/node", "../../outside", "missing", "npm", "../lib/missing", "bad\x00target"]
        for target in bad_links:
            bad = archive()
            bad[-1]["linkname"] = target
            with self.subTest(target=target), self.assertRaises(ValueError):
                validate_archive_entries(bad)
        for more in [
            [entry("bin/a", "symlink", linkname="b"), entry("bin/b", "symlink", linkname="a")],
            [entry("alias", "symlink", linkname="bin"), entry("alias/injected", "file", 1)],
            [entry("bin/escape-alias", "symlink", linkname="../../../escape")],
        ]:
            with self.subTest(more=more), self.assertRaises(ValueError):
                validate_archive_entries(archive() + more)

    def test_05_entry_depth_path_file_and_aggregate_limits(self):
        self.assertEqual(len(validate_archive_entries([entry(), entry("bounded", "file", 192 * MIB)])), 1)
        self.assertEqual(len(validate_archive_entries([entry(), entry("/".join(["d"] * 32), "file", 1)])), 1)
        self.assertEqual(len(validate_archive_entries([entry(), entry("a", "file", 192 * MIB),
                                                     entry("b", "file", 192 * MIB), entry("c", "file", 128 * MIB)])), 3)
        for entries in [
            [entry(), entry("too-big", "file", 192 * MIB + 1)],
            [entry(), entry("a", "file", 192 * MIB), entry("b", "file", 192 * MIB), entry("c", "file", 128 * MIB + 1)],
            [entry(), entry("/".join(["d"] * 33), "file", 1)],
            [entry(), entry("x" * 4097, "file", 1)],
            [entry(), entry("é" * 2049, "file", 1)],
            [entry()] + [entry("f" + str(i), "file", 0) for i in range(32768)],
            # Count/data limits pass, but archive+two copies+allocation reserves exceed1.2GiB.
            [entry(), entry("a", "file", 192 * MIB), entry("b", "file", 192 * MIB),
             entry("c", "file", 128 * MIB)] + [entry("zero" + str(i), "file", 0) for i in range(8192)],
        ]:
            with self.subTest(count=len(entries)), self.assertRaises(ValueError):
                validate_archive_entries(entries)

    def test_06_three_cache_and_nine_runtime_identities_are_exact(self):
        good = evidence()
        before = copy.deepcopy(good)
        self.assertEqual(sum(r["size"] for r in good["runtime_files"]), 133239032)
        self.assertEqual(len({r["source"] for r in good["runtime_files"]}), 8)
        self.assertIs(validate_availability_evidence(good), True)
        self.assertEqual(good, before)
        reordered = copy.deepcopy(good)
        reordered["cache_files"].reverse()
        reordered["runtime_files"].reverse()
        self.assertIs(validate_availability_evidence(reordered), True)
        for which in ["cache_files", "runtime_files"]:
            for field, replacement in [("sha256", "a" * 64), ("size", -1), ("size", True), ("extra", True)]:
                bad = copy.deepcopy(good)
                bad[which][0][field] = replacement
                with self.subTest(which=which, field=field), self.assertRaises(ValueError):
                    validate_availability_evidence(bad)
            for mutation in ["missing", "extra", "duplicate"]:
                bad = copy.deepcopy(good)
                if mutation == "missing":
                    bad[which].pop()
                elif mutation == "extra":
                    bad[which].append(copy.deepcopy(bad[which][0]))
                else:
                    bad[which][-1] = copy.deepcopy(bad[which][0])
                with self.subTest(which=which, mutation=mutation), self.assertRaises(ValueError):
                    validate_availability_evidence(bad)
        for which, index, field, value in [
            ("cache_files", 0, "path", "bin/other"), ("cache_files", 0, "size", 126879697),
            ("cache_files", 1, "size", 192 * MIB + 1),
            ("runtime_files", 0, "source", "/other/node"), ("runtime_files", 1, "destination", "/other/loader"),
            ("runtime_files", 3, "source", "/usr/lib/x86_64-linux-gnu/libstdc++.so.6"),
            ("runtime_files", 4, "size", 952617),
        ]:
            bad = copy.deepcopy(good)
            bad[which][index][field] = value
            with self.subTest(field=field, which=which), self.assertRaises(ValueError):
                validate_availability_evidence(bad)
        for change in [{"archive_sha256": "a" * 64}, {"archive_sha256": ARCHIVE_SHA.upper()}, {"extra": True}]:
            with self.assertRaises(ValueError):
                validate_availability_evidence({**good, **change})

    def test_07_marker_source_and_cleanup_records_cannot_claim_unknown_success(self):
        good = evidence()
        for change in [{"marker_empty": False}, {"marker_empty": 1}, {"source_unchanged": False},
                       {"source_unchanged": 1}, {"cleanup": {"completed": False, "uncertain": False, "remaining_owned_paths": []}},
                       {"cleanup": {"completed": True, "uncertain": True, "remaining_owned_paths": []}},
                       {"cleanup": {"completed": True, "uncertain": False, "remaining_owned_paths": [CACHE]}},
                       {"cleanup": {"completed": True, "uncertain": False, "remaining_owned_paths": [], "ownership": "assumed"}}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                validate_availability_evidence({**good, **change})
        for key in good:
            missing = copy.deepcopy(good)
            del missing[key]
            with self.subTest(missing=key), self.assertRaises(ValueError):
                validate_availability_evidence(missing)
        for key in good["cleanup"]:
            bad = copy.deepcopy(good)
            del bad["cleanup"][key]
            with self.subTest(missing_cleanup=key), self.assertRaises(ValueError):
                validate_availability_evidence(bad)


if __name__ == "__main__":
    unittest.main()
