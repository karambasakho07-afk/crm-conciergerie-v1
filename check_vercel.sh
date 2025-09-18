#!/usr/bin/env bash
set -euo pipefail

URL="https://crm-conciergerie-v1-l87iajqdx-karambas-projects-40c79851.vercel.app"
BYPASS_TOKEN="${BYPASS_TOKEN:-}"

echo "[1/3] Hit homepage..."
if [[ -n "$BYPASS_TOKEN" ]]; then
  curl -sS -o /dev/null -w "HTTP:%{http_code}\n" -H "x-vercel-protection-bypass: $BYPASS_TOKEN" "$URL"
else
  curl -sS -o /dev/null -w "HTTP:%{http_code}\n" "$URL"
fi

echo "[2/3] Hit health (si présent)..."
if [[ -n "$BYPASS_TOKEN" ]]; then
  curl -sS -H "x-vercel-protection-bypass: $BYPASS_TOKEN" "$URL/api/health" || true
else
  curl -sS "$URL/api/health" || true
fi
echo

echo "[3/3] Fetch logs (dernières 10 minutes)..."
npx -y vercel@latest logs "$URL" --since 10m
