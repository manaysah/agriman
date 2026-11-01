#!/usr/bin/env bash
# Create or update draft PR: feature/agriman-platform-upgrades -> main
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
HEAD=feature/agriman-platform-upgrades

if ! command -v gh >/dev/null; then
  echo "Install GitHub CLI: brew install gh && gh auth login" >&2
  exit 1
fi

git fetch origin
git checkout "$HEAD"
git push origin "$HEAD"

if gh pr view --head "$HEAD" --base main >/dev/null 2>&1; then
  gh pr edit --draft \
    --title "AgriMan: multi-farm platform, Resend email, and admin" \
    --body-file "$ROOT/scripts/PR_BODY.md"
else
  gh pr create --base main --head "$HEAD" --draft \
    --title "AgriMan: multi-farm platform, Resend email, and admin" \
    --body-file "$ROOT/scripts/PR_BODY.md"
fi

gh pr view --web
