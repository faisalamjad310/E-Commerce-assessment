#!/usr/bin/env bash
# PreToolUse[Write,Edit] — block edits to sensitive and generated files.

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\([^"]*\)"/\1/')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Files Claude should never modify without explicit user action
PROTECTED=(
  "backend/.env"
  "frontend/.env"
  ".claude/hooks/"
  ".claude/settings.json"
)

for protected in "${PROTECTED[@]}"; do
  if echo "$FILE_PATH" | grep -q "$protected"; then
    echo "⛔  Protected file: $FILE_PATH" >&2
    echo "   This file should not be edited by Claude. Make this change manually." >&2
    exit 1
  fi
done

exit 0
