# CRM Conciergerie — V1 (MVP)

Stack: Next.js (App Router, TS), Prisma (Postgres/Supabase), Twilio WhatsApp, Supabase Storage, Tailwind.

## 🚀 Démarrage

1) Copier `.env.example` en `.env` et **remplir** les variables.
2) Installer deps:
```bash
npm i
```
3) Prisma:
```bash
npx prisma generate
npx prisma migrate dev -n init
```
4) Lancer en local:
```bash
npm run dev
```
5) Twilio webhook WhatsApp -> `https://<app>/api/whatsapp`

## 📦 Storage
Créer un bucket **public** `crm-photos` dans Supabase Storage.

## 🔐 Auth V1
Mot de passe unique via `ADMIN_PASSWORD` (cookie `admin_session`).

## 🧩 Modules couverts
- Tickets & WhatsApp webhook (basique)
- Dashboard KPI (TTR approx, CSAT simple, tâches du jour)
- Reviews (listing + API submit/trigger)
- Housekeeping (page upload + API -> Supabase Storage)
- Planning (placeholder Sprint V1-B)
- Audit logs (basique)

## 🔧 Crons (Vercel)
- `/api/reviews/trigger` — quotidien
- `/api/reports/daily` — quotidien
- `/api/tasks/housekeeping-reminder` — quotidien 17:00

## 🛡️ Sécurité
- RBAC minimal (à étendre)
- Audit basique
- Service role Supabase **uniquement côté serveur**

## 📝 À faire (prochain sprint)
- Vue planning + auto tâches ménage après check-out
- Thread ticket avec réponse côté staff + snippets
- Base de connaissances & templates
- Traductions (V2)
