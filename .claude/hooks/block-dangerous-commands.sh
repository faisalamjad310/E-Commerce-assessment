#!/usr/bin/env bash
# PreToolUse[Bash] — block destructive commands before they run.
# Claude Code passes the tool input JSON on stdin.

INPUT=$(cat)

BLOCKED_PATTERNS=(
  "git push --force"
  "git push -f "
  "git reset --hard"
  "git checkout -- \."
  "git clean -f"
  "git branch -D "
  "rm -rf /"
  "rm -rf /*"
  "npm run seed"
  "DROP TABLE"
  "TRUNCATE"
  "db.dropDatabase"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qi "$pattern"; then
    echo "⛔  Blocked: dangerous command matched pattern: \"$pattern\"" >&2
    echo "   Review CLAUDE.md rules before running destructive operations." >&2
    exit 1
  fi
done

exit 0
