// app/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

type Stats = {
  range: { start: string; end: string }
  tickets: { open: number; resolvedCreated: number; resolvedUpdated: number; avgTTR: number }
  housekeeping: { total: number; done: number; compliancePct: number }
  reviews: { count: number; csatPct: number; avgScore: number }
}

// yyyy-mm-dd pour l’input type="date"
function toDateInputValue(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

async function getStats(start?: string, end?: string): Promise<Stats> {
  const params = new URLSearchParams()
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/stats/summary${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('stats fetch failed')
  return res.json()
}

function ticketStatusBadge(s: 'OPEN'|'PENDING'|'RESOLVED') {
  const base = 'px-2 py-0.5 rounded text-xs font-medium'
  if (s === 'OPEN') return `${base} bg-blue-600/30 text-blue-200 border border-blue-500/40`
  if (s === 'PENDING') return `${base} bg-amber-600/30 text-amber-200 border border-amber-500/40`
  return `${base} bg-green-600/30 text-green-200 border border-green-500/40`
}
function taskStatusBadge(s: 'TODO'|'IN_PROGRESS'|'DONE') {
  const base = 'px-1.5 py-0.5 rounded text-[10px] font-medium'
  if (s === 'DONE') return `${base} bg-green-600/30 text-green-200 border border-green-500/40`
  if (s === 'IN_PROGRESS') return `${base} bg-amber-600/30 text-amber-200 border border-amber-500/40`
  return `${base} bg-slate-600/30 text-slate-200 border border-slate-500/40`
}

export default async function Dashboard({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Par défaut : dernière semaine
  const today = new Date()
  const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 6)

  const startParam = (searchParams?.start as string) || ''
  const endParam   = (searchParams?.end as string)   || ''

  const startValue = startParam || toDateInputValue(weekAgo)
  const endValue   = endParam   || toDateInputValue(today)

  // 1) Stats via API
  const stats = await getStats(startValue, endValue)
  const frStart = new Date(stats.range.start).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  const frEnd   = new Date(stats.range.end).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

  // 2) Aperçus (server-side via Prisma)
  const [latestTickets, todayTasks, latestReviews] = await Promise.all([
    prisma.ticket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { property: { select: { name: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      take: 5,
    }),
    (async () => {
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
      const endOfDay   = new Date(); endOfDay.setHours(23,59,59,999)
      return prisma.task.findMany({
        where: { dueAt: { gte: startOfDay, lte: endOfDay } },
        orderBy: { dueAt: 'asc' },
        include: { property: { select: { name: true } } },
        take: 6,
      })
    })(),
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { property: { select: { name: true } } },
      take: 5,
    }),
  ])

  return (
    <main className="container py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <nav className="flex gap-3 text-sm">
          <Link className="opacity-80 hover:opacity-100" href="/tickets">Tickets</Link>
          <Link className="opacity-80 hover:opacity-100" href="/planning">Planning</Link>
          <Link className="opacity-80 hover:opacity-100" href="/reviews">Reviews</Link>
        </nav>
      </header>

      {/* Filtre dates (mini calendrier natif) */}
      <form className="card grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end" method="GET">
        <div>
          <label className="block text-xs opacity-70 mb-1">Du</label>
          <input name="start" type="date" defaultValue={startValue} className="input w-full" />
        </div>
        <div>
          <label className="block text-xs opacity-70 mb-1">Au</label>
          <input name="end" type="date" defaultValue={endValue} className="input w-full" />
        </div>
        <button className="btn">Appliquer</button>
      </form>

      {/* Cartes KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Tickets ouverts" value={stats.tickets.open} hint="Actuellement non résolus" />
        <KPICard title="TTR moyen (min)" value={Math.round(stats.tickets.avgTTR)} hint="Temps 1ère réponse" />
        <KPICard title="Conformité ménage" value={`${stats.housekeeping.compliancePct}%`} hint={`${stats.housekeeping.done}/${stats.housekeeping.total} tâches ok`} />
        <KPICard title="CSAT / Score moyen" value={`${stats.reviews.csatPct}% • ${stats.reviews.avgScore.toFixed(2)}`} hint={`${stats.reviews.count} avis`} />
      </section>

      {/* Aperçus */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Tickets récents */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tickets récents</h2>
            <Link href="/tickets" className="text-xs underline opacity-80 hover:opacity-100">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {latestTickets.length === 0 && <div className="opacity-60 text-sm">Aucun ticket</div>}
            {latestTickets.map(t => {
              const last = t.messages[0]
              return (
                <Link key={t.id} href={`/tickets/${t.id}`} className="flex items-start gap-2 p-2 rounded hover:bg-white/5">
                  <span className={ticketStatusBadge(t.status as any)}>{t.status}</span>
                  <div className="min-w-0">
                    <div className="text-sm truncate"><b>{t.property?.name ?? '—'}</b> <span className="opacity-60">#{t.id.slice(0,8)}</span></div>
                    <div className="text-xs opacity-70 truncate">{last?.body ?? '—'}</div>
                  </div>
                  <div className="ml-auto text-xs opacity-60 shrink-0">{new Date(t.updatedAt).toLocaleString('fr-FR')}</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Tâches ménage aujourd’hui */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tâches du jour</h2>
            <Link href="/planning" className="text-xs underline opacity-80 hover:opacity-100">Voir planning</Link>
          </div>
          <div className="space-y-2">
            {todayTasks.length === 0 && <div className="opacity-60 text-sm">Aucune tâche aujourd’hui</div>}
            {todayTasks.map(x => (
              <div key={x.id} className="flex items-center gap-2 p-2 rounded">
                <span className={taskStatusBadge(x.status as any)}>{x.status}</span>
                <div className="min-w-0">
                  <div className="text-sm truncate"><b>{x.property?.name ?? '—'}</b> • {x.type}</div>
                  <div className="text-xs opacity-70">{new Date(x.dueAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers avis */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Derniers avis</h2>
            <Link href="/reviews" className="text-xs underline opacity-80 hover:opacity-100">Voir tout</Link>
          </div>
          <div className="space-y-2">
            {latestReviews.length === 0 && <div className="opacity-60 text-sm">Aucun avis</div>}
            {latestReviews.map(r => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded hover:bg-white/5">
                <div className="min-w-0">
                  <div className="text-sm truncate"><b>{r.property?.name ?? '—'}</b></div>
                  <div className="text-xs opacity-70 truncate">“{r.comment ?? '—'}”</div>
                </div>
                <div className="px-2 py-0.5 rounded text-xs font-bold border border-white/15">
                  {r.score}/5
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="opacity-70 text-xs">
        Plage analysée : <b>{frStart}</b> → <b>{frEnd}</b>
      </p>
    </main>
  )
}

function KPICard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4 space-y-1">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint ? <div className="text-xs opacity-60">{hint}</div> : null}
    </div>
  )
}