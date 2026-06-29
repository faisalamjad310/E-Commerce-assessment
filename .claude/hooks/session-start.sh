#!/usr/bin/env bash
# SessionStart — print project context at the start of every Claude session.

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║          CartVerse — Session Context             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "none")
CHANGED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')

echo "  Branch:      $BRANCH"
echo "  Last commit: $LAST_COMMIT"

if [ "$CHANGED" -gt 0 ]; then
  echo "  Status:      ⚠️  $CHANGED uncommitted file(s)"
  git status --short 2>/dev/null | head -8 | sed 's/^/             /'
else
  echo "  Status:      ✅ Working tree clean"
fi

echo ""
echo "  ── Hard Rules (from CLAUDE.md) ─────────────────"
echo "  • Money = integer cents  (price: 4999 = £49.99)"
echo "  • Stock decrement is atomic  (\\$gte guard)"
echo "  • Order totals computed SERVER-SIDE only"
echo "  • Admin routes need JwtAuthGuard + RolesGuard"
echo "  • Passwords → bcrypt only, never stored plain"
echo "  • No secrets in code → use .env"
echo "  ────────────────────────────────────────────────"
echo ""
echo "  Run commands:"
echo "  • Backend:  cd backend && npm run start:dev"
echo "  • Frontend: cd frontend && npm run dev"
echo "  • Tests BE: cd backend && npm test"
echo "  • Tests FE: cd frontend && npm test"
echo "  • Seed:     cd backend && npm run seed"
echo ""
