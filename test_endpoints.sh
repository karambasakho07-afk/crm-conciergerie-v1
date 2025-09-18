#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${BASE_URL:-https://crm-conciergerie-v1-l87iajqdx-karambas-projects-40c79851.vercel.app}"
BYPASS_TOKEN="${BYPASS_TOKEN:-karambasakho07032001076963789931}"
printf "🧪 Testing endpoints on: %s\n" "$BASE_URL"
printf "🔐 Using Vercel bypass token from BYPASS_TOKEN (length: %s)\n" "${#BYPASS_TOKEN}"
get_json() { local path="$1"; printf "\n>>> GET %s\n" "$path"; curl -sS -H "x-vercel-protection-bypass: ${BYPASS_TOKEN}" -H "Content-Type: application/json" "${BASE_URL}${path}" || true; printf "\n"; }
post_form() { local path="$1"; shift; printf "\n>>> POST (form) %s\n" "$path"; curl -sS -X POST -H "x-vercel-protection-bypass: ${BYPASS_TOKEN}" -H "Content-Type: application/x-www-form-urlencoded" "${BASE_URL}${path}" "$@" || true; printf "\n"; }
post_json() { local path="$1"; local body="$2"; printf "\n>>> POST (json) %s\n" "$path"; curl -sS -X POST -H "x-vercel-protection-bypass: ${BYPASS_TOKEN}" -H "Content-Type: application/json" -d "${body}" "${BASE_URL}${path}" || true; printf "\n"; }
get_json "/api/health"
get_json "/api/stats/summary"
post_form "/api/whatsapp" -d "From=whatsapp:+33612345678" -d "Body=Bonjour, je veux réserver Montparnasse"
post_json "/api/housekeeping/notify" '{"houseId":"montparnasse","message":"Nettoyage terminé ✅"}'
printf "\n✅ Done.\n"
