export const runtime = 'nodejs'
// app/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DateFilters from './components/DateFilters'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

type Stats = {
  range: { start: string; end: string }
  tickets: { open: number; resolvedCreated: number; resolvedUpdated: number; avgTTR: number }
  housekeeping: { total: number; done: number; compliancePct: number }
  reviews: { count: number; csatPct: number; avgScore: number }
}

function todayISO() {
  const d = new Date()
  d.setHours(0,0,0,0)
  return d.toISOString().slice(0,10)
}

function toISODateOrUndefined(s?: string) {
  if (!s) return undefined
  try {
    const d = new Date(s + 'T00:00:00')
    if (isNaN(d.getTime())) return undefined
    return d.toISOString()
  } catch { return undefined }
}

// Détecte l’origine courante (dev, preview, prod) pour éviter 401/middleware
function getBaseUrl() {
  const h = headers()
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${proto}://${host}`
  // fallback local/dev
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/,'')
}

async function getStats(start?: string, end?: string): Promise<Stats> {
  const qs = new URLSearchParams()
  if (start) qs.set('start', start)
  if (end) qs.set('end', end)

  const url = `${getBaseUrl()}/api/stats/summary?${qs.toString()}`
  const res = await fetch(url, { cache: 'no-store' }) // <- pas de revalidate en plus
  const def = () => {
    const now = new Date().toISOString()
    return {
      range: { start: now, end: now },
      tickets: { open: 0, resolvedCreated: 0, resolvedUpdated: 0, avgTTR: 0 },
      housekeeping: { total: 0, done: 0, compliancePct: 0 },
      reviews: { count: 0, csatPct: 0, avgScore: 0 },
    }
  }
  const ct = res.headers.get('content-type') || ''
  if (!res.ok || !ct.includes('application/json')) return def()
  try { return await res.json() } catch { return def() }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { start?: string; end?: string }
}) {
  const startParam = searchParams.start || todayISO()
  const endParam   = searchParams.end   || todayISO()

  const startISOForPrisma = toISODateOrUndefined(startParam)
  const endISOForPrisma   = toISODateOrUndefined(endParam)

  const stats = await getStats(startParam, endParam)

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(startISOForPrisma && endISOForPrisma
        ? { createdAt: { gte: new Date(startISOForPrisma), lte: new Date(endISOForPrisma) } }
        : {}),
    },
    include: {
      property: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const reviews = await prisma.review.findMany({
    where: {
      ...(startISOForPrisma && endISOForPrisma
        ? { createdAt: { gte: new Date(startISOForPrisma), lte: new Date(endISOForPrisma) } }
        : {}),
    },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  const tasks = await prisma.task.findMany({
    where: {
      type: 'CLEANING',
      ...(startISOForPrisma && endISOForPrisma
        ? { dueAt: { gte: new Date(startISOForPrisma), lte: new Date(endISOForPrisma) } }
        : {}),
    },
    include: { property: true, assignee: true },
    orderBy: { dueAt: 'asc' },
    take: 8,
  })

  return (
    <>
      <div className="mb-6">
        <DateFilters />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card">
          <div className="opacity-60 text-sm">Tickets ouverts</div>
          <div className="text-2xl font-semibold">{stats.tickets.open}</div>
        </div>
        <div className="card">
          <div className="opacity-60 text-sm">CSAT (%)</div>
          <div className="text-2xl font-semibold">{Math.round(stats.reviews.csatPct)}</div>
        </div>
        <div className="card">
          <div className="opacity-60 text-sm">Ménage complété</div>
          <div className="text-2xl font-semibold">{Math.round(stats.housekeeping.compliancePct)}%</div>
        </div>
        <div className="card">
          <div className="opacity-60 text-sm">Avis (moy.)</div>
          <div className="text-2xl font-semibold">{stats.reviews.avgScore.toFixed(2)}</div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Derniers tickets</h2>
            <Link href="/tickets" className="btn btn-sm">Voir tout</Link>
          </div>
          <div className="card divide-y divide-white/10">
            {tickets.length === 0 && (
              <div className="p-3 opacity-60 text-sm">Aucun ticket sur la période</div>
            )}
            {tickets.map(t => {
              const last = t.messages[0]
              return (
                <div key={t.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm opacity-60">
                      {t.property?.name ?? '—'} • {t.type} • <b>{t.status}</b>
                    </div>
                    <div className="truncate">{last?.body || (last ? '[Pièce jointe]' : '—')}</div>
                  </div>
                  <Link href={`/tickets/${t.id}`} className="btn btn-sm">Ouvrir</Link>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Derniers avis</h2>
              <Link href="/reviews" className="btn btn-sm">Voir tout</Link>
            </div>
            <div className="card divide-y divide-white/10">
              {reviews.length === 0 && (
                <div className="p-3 opacity-60 text-sm">Aucun avis sur la période</div>
              )}
              {reviews.map(r => (
                <div key={r.id} className="p-3">
                  <div className="text-sm opacity-60">{r.property?.name ?? '—'}</div>
                  <div>Note : <b>{r.score}</b>/5</div>
                  {r.comment && <div className="opacity-80 text-sm mt-1">{r.comment}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Ménage (période)</h2>
              <Link href="/planning" className="btn btn-sm">Planning</Link>
            </div>
            <div className="card divide-y divide-white/10">
              {tasks.length === 0 && (
                <div className="p-3 opacity-60 text-sm">Aucune tâche ménage sur la période</div>
              )}
              {tasks.map(t => (
                <div key={t.id} className="p-3">
                  <div className="text-sm opacity-60">
                    {t.property?.name ?? '—'} • {new Date(t.dueAt).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Statut : <b>{t.status}</b></div>
                    <div className="opacity-70 text-sm">
                      Agent : {t.assignee?.name ?? '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}