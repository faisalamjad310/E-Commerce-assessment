#!/usr/bin/env bash
# PreToolUse[Write,Edit] — detect hardcoded secrets before a file is written.
# Reads the full tool input JSON on stdin.

INPUT=$(cat)

SECRET_PATTERNS=(
  "sk_live_"                            # Stripe live secret key
  "pk_live_"                            # Stripe live publishable key
  "AKIA[0-9A-Z]{16}"                   # AWS access key ID
  "ghp_[A-Za-z0-9]{36}"               # GitHub personal access token
  "-----BEGIN (RSA |EC )?PRIVATE KEY"  # Private key block
  "JWT_SECRET\s*=\s*['\"][^'\"]{4,}"  # Hardcoded JWT secret
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$pattern"; then
    echo "⛔  Possible secret detected in file content." >&2
    echo "   Pattern matched: $pattern" >&2
    echo "   Use environment variables (.env) instead of hardcoding credentials." >&2
    exit 1
  fi
done

# Warn (but don't block) on MongoDB connection strings that look like they have credentials
if echo "$INPUT" | grep -qE "mongodb(\+srv)?://[^:@/]+:[^:@/]+@"; then
  echo "⚠️   Warning: MongoDB URI with embedded credentials detected." >&2
  echo "   Move this to MONGO_URI in your .env file." >&2
fi

exit 0
