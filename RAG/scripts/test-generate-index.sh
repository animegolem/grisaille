#!/usr/bin/env bash
# Smoke test (AI-IMP-005): the script must survive a ticket tree whose
# frontmatter is fully canonical — zero legacy keys. Regression guard
# for the pipefail-kills-the-healthy-case bug (2026-08-16).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
t=$(mktemp -d); trap 'rm -rf "$t"' EXIT
mkdir -p "$t"/{AI-EPIC,AI-IMP,scripts}
cp "$here/generate-index.sh" "$t/scripts/"; chmod +x "$t/scripts/generate-index.sh"
printf -- '---\nnode_id: AI-EPIC-001\ntags:\n  - EPIC\ndate_created: 2026-08-16\ndate_completed:\nkanban_status: backlog\nai_imp_spawned: false\n---\n\n# AI-EPIC-001-x\n' > "$t/AI-EPIC/AI-EPIC-001-x.md"
"$t/scripts/generate-index.sh" >/dev/null
grep -q "AI-EPIC-001" "$t/INDEX.md" && echo "smoke: PASS (clean-frontmatter tree indexes, exit 0)"
