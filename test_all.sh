#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://crm-conciergerie-v1-l87iajqdx-karambas-projects-40c79851.vercel.app}"
BYPASS_TOKEN="${BYPASS_TOKEN:-karambasakho07032001076963789931}"

if [ -z "$BASE_URL" ] || [ -z "$BYPASS_TOKEN" ]; then
  printf "Erreur: BASE_URL ou BYPASS_TOKEN vide\n" >&2
  exit 1
fi

printf "BASE_URL=%s\n" "$BASE_URL"
printf "BYPASS_TOKEN=%d chars\n" "${#BYPASS_TOKEN}"

COOKIE_JAR="$(mktemp)"
printf "COOKIE_JAR=%s\n" "$COOKIE_JAR"

curl -sS -L -c "$COOKIE_JAR" -o /dev/null "$BASE_URL/api/health?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=$BYPASS_TOKEN"

curl -sS -b "$COOKIE_JAR" -H "Content-Type: application/json" -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/health"

curl -sS -b "$COOKIE_JAR" -H "Content-Type: application/json" -w "\nHTTP:%{http_code}\n" "$BASE_URL/api/stats/summary"

curl -sS -b "$COOKIE_JAR" -H "Content-Type: application/x-www-form-urlencoded" -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/whatsapp" \
  --data-urlencode "From=whatsapp:+33612345678" \
  --data-urlencode "Body=Bonjour, je veux réserver Montparnasse"

curl -sS -b "$COOKIE_JAR" -H "Content-Type: application/json" -w "\nHTTP:%{http_code}\n" -X POST "$BASE_URL/api/housekeeping/notify" \
  -d '{"houseId":"montparnasse","message":"Nettoyage terminé ✅"}'

rm -f "$COOKIE_JAR"
