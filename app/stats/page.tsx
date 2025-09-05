import { prisma } from '@/lib/prisma'
import Filters from './Filters'
import { startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function parseDateInput(v?: string): Date | null {
  if (!v) return null
  // "YYYY-MM-DD" -> date locale à minuit
  const d = new Date(v + 'T00:00:00')
  return isNaN(+d) ? null : d
}

function getRange(sp: { start?: string; end?: string }) {
  // défaut : 7 derniers jours (aujourd'hui inclus)
  const defEnd = endOfDay(new Date())
  const defStart = startOfDay(subDays(defEnd, 6))

  const s = parseDateInput(sp.start) ?? defStart
  const e = parseDateInput(sp.end)   ?? defEnd

  return { start: startOfDay(s), end: endOfDay(e) }
}

async function getStats(start: Date, end: Date) {
  // Tickets
  const [open, resolvedCreated, resolvedUpdated, withFirstResp] = await Promise.all([
    prisma.ticket.count({ where: { createdAt: { gte: start, lte: end }, status: 'OPEN' as any } }),
    prisma.ticket.count({ where: { createdAt: { gte: start, lte: end }, status: 'RESOLVED' as any } }),
    prisma.ticket.count({ where: { updatedAt: { gte: start, lte: end }, status: 'RESOLVED' as any } }),
    prisma.ticket.findMany({
      where: { createdAt: { gte: start, lte: end }, firstResponseAt: { not: null } },
      select: { createdAt: true, firstResponseAt: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  const ttrs = withFirstResp
    .map(t => differenceInMinutes(t.firstResponseAt as Date, t.createdAt))
    .filter(n => Number.isFinite(n) && n >= 0)
  const avgTTR = ttrs.length ? Math.round(ttrs.reduce((a,b)=>a+b,0)/ttrs.length) : 0

  // Housekeeping
  const cleanings = await prisma.task.findMany({
    where: { type: 'CLEANING' as any, dueAt: { gte: start, lte: end } },
    select: { id: true, status: true },
  })
  const hkChecks = await prisma.hK_Check.findMany({
    where: { taskId: { in: cleanings.map(c => c.id) } },
    select: { id: true },
  })
  const housekeepingCompliance = cleanings.length
    ? Math.round((hkChecks.length / cleanings.length) * 100)
    : 0
  const cleaningDone = cleanings.filter(c => c.status === 'DONE').length

  // Reviews
  const periodReviews = await prisma.review.findMany({
    where: { createdAt: { gte: start, lte: end }, score: { gt: 0 } },
    select: { score: true },
  })
  const csatPct = periodReviews.length
    ? Math.round((periodReviews.reduce((a, r) => a + (r.score || 0), 0) / (periodReviews.length * 5)) * 100)
    : 0
  const avgScore = periodReviews.length
    ? (periodReviews.reduce((a, r) => a + (r.score || 0), 0) / periodReviews.length).toFixed(2)
    : '0.00'

  return {
    open,
    resolvedCreated,
    resolvedUpdated,
    avgTTR,
    housekeepingCompliance,
    cleaningTotal: cleanings.length,
    cleaningDone,
    csatPct,
    avgScore,
  }
}

export default async function StatsPage({ searchParams }: { searchParams: { start?: string, end?: string } }) {
  const { start, end } = getRange(searchParams)
  const stats = await getStats(start, end)
  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-xl font-semibold">Stats</h1>

      {/* Filtres dynamiques (auto-soumission) */}
      <Filters />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="opacity-60 text-sm">Tickets ouverts (créés dans période)</div>
          <div className="text-2xl font-semibold">{stats.open}</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">Tickets résolus (créés dans période)</div>
          <div className="text-2xl font-semibold">{stats.resolvedCreated}</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">Tickets résolus (maj dans période)</div>
          <div className="text-2xl font-semibold">{stats.resolvedUpdated}</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">TTR moyen (min)</div>
          <div className="text-2xl font-semibold">{stats.avgTTR}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="opacity-60 text-sm">CLEANING (total)</div>
          <div className="text-2xl font-semibold">{stats.cleaningTotal}</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">CLEANING terminés</div>
          <div className="text-2xl font-semibold">{stats.cleaningDone}</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">Conformité ménage</div>
          <div className="text-2xl font-semibold">{stats.housekeepingCompliance}%</div>
        </div>
        <div className="card text-center">
          <div className="opacity-60 text-sm">CSAT</div>
          <div className="text-2xl font-semibold">{stats.csatPct}% ({stats.avgScore}/5)</div>
        </div>
      </div>
    </main>
  )
}
