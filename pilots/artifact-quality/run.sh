#!/usr/bin/env bash
set -euo pipefail
# No checkout, credentials, installation, publication, or consumer source mutation.
# Install the pinned AQC lockfile separately with npm ci --ignore-scripts first.
if [[ $# != 2 ]]; then
  echo 'Usage: bash pilots/artifact-quality/run.sh AQC_CHECKOUT NEW_OUTPUT_DIRECTORY' >&2
  exit 2
fi
implementation_root=$(cd "$1" && pwd)
pilot_root=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
output=$(node -e 'const p=require("node:path"),f=require("node:fs"),v=p.resolve(process.argv[1]);console.log(p.join(f.realpathSync(p.dirname(v)),p.basename(v)))' "$2")
consumer_root=$(cd "$pilot_root/../.." && pwd)
case "$output/" in
  "$consumer_root/"*|"$implementation_root/"*) echo 'Output must be outside both source checkouts.' >&2; exit 2 ;;
esac
expected_sha=ccad08bf9e3b90456d4f3b138707d5131c49a70b
[[ $(git -C "$implementation_root" rev-parse HEAD) == "$expected_sha" ]]
git -C "$implementation_root" diff --exit-code HEAD
mkdir "$output"
node "$pilot_root/pilot.mjs" prepare "$output/inputs" > "$output/preparation.json"
mkdir "$output/results"
git -C "$implementation_root" rev-parse HEAD > "$output/results/aqc-commit.txt"
for case_name in baseline fixture-valid missing-agent-procedure missing-skill-procedure invalid-tools duplicate-tools unknown-tool missing-resource escaping-resource malformed-reference; do
  root="$output/inputs/$case_name"
  mkdir "$root/contracts"
  cp "$implementation_root/fixtures/valid/artifact-validation/agent.contract.json" "$root/contracts/agent.json"
  cp "$implementation_root/fixtures/valid/artifact-validation/skill.contract.json" "$root/contracts/skill.json"
  status=0
  node "$implementation_root/src/cli/aqc.mjs" validate "$root" --profile artifact-quality --format json > "$output/results/$case_name.raw.json" 2> "$output/results/$case_name.stderr.txt" || status=$?
  printf '%s\n' "$status" > "$output/results/$case_name.exit.txt"
  if [[ $status -gt 1 ]]; then
    cat "$output/results/$case_name.stderr.txt" >&2
    exit 1
  fi
done
node "$pilot_root/pilot.mjs" assess "$output/inputs" "$output/results" > "$output/summary.json"
cat "$output/summary.json"
