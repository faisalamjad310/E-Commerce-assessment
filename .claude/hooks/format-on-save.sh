#!/usr/bin/env bash
# PostToolUse[Write,Edit] — auto-format TypeScript/TSX files after each write.
# Runs Prettier silently; failures are non-fatal (don't block the write).

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"file_path"\s*:\s*"\([^"]*\)"/\1/')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format TypeScript/TSX files
if ! echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi

# Determine project root based on path
if echo "$FILE_PATH" | grep -q 'backend/'; then
  PROJECT_DIR=$(echo "$FILE_PATH" | sed 's|\(.*backend/\).*|\1|' | sed 's|backend/$|backend|')
  cd "$PROJECT_DIR" 2>/dev/null && npx prettier --write "$FILE_PATH" --log-level silent 2>/dev/null || true
elif echo "$FILE_PATH" | grep -q 'frontend/'; then
  PROJECT_DIR=$(echo "$FILE_PATH" | sed 's|\(.*frontend/\).*|\1|' | sed 's|frontend/$|frontend|')
  cd "$PROJECT_DIR" 2>/dev/null && npx prettier --write "$FILE_PATH" --log-level silent 2>/dev/null || true
fi

exit 0
