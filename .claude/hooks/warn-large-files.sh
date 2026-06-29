#!/usr/bin/env bash
# PreToolUse[Write,Edit] — block writes to build artifacts and dependency directories.

INPUT=$(cat)

# Extract file_path from JSON input (simple grep, avoids requiring jq)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\([^"]*\)"/\1/')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BLOCKED_PATHS=(
  "node_modules/"
  "/dist/"
  "/.next/"
  "/coverage/"
  "/build/"
  "backend/public/uploads/"
)

for blocked in "${BLOCKED_PATHS[@]}"; do
  if echo "$FILE_PATH" | grep -q "$blocked"; then
    echo "⛔  Cannot write to: $FILE_PATH" >&2
    echo "   Path is inside a blocked directory ($blocked)." >&2
    exit 1
  fi
done

exit 0
