// app/api/stats/summary/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Lis les dates (yyyy-mm-dd). Si absentes, prend aujourd’hui.
  const url = new URL(req.url)
  const startStr = url.searchParams.get('start') ?? new Date().toISOString().slice(0, 10)
  const endStr   = url.searchParams.get('end')   ?? startStr

  // Normalise en ISO
  const start = new Date(`${startStr}T00:00:00.000Z`)
  const end   = new Date(`${endStr}T23:59:59.999Z`)

  // Réponse “safe” (pas d’accès DB) pour garantir 200 en prod
  const payload = {
    range: { start: start.toISOString(), end: end.toISOString() },
    tickets: { open: 0, resolvedCreated: 0, resolvedUpdated: 0, avgTTR: 0 },
    housekeeping: { total: 0, done: 0, compliancePct: 0 },
    reviews: { count: 0, csatPct: 0, avgScore: 0 },
  }

  return NextResponse.json(payload, { status: 200 })
}