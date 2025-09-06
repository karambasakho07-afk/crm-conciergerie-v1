export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;// app/tickets/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function statusBadge(s: 'OPEN'|'PENDING'|'RESOLVED') {
  const base = 'px-2 py-0.5 rounded text-xs font-medium'
  if (s === 'OPEN') return `${base} bg-blue-600/30 text-blue-200 border border-blue-500/40`
  if (s === 'PENDING') return `${base} bg-amber-600/30 text-amber-200 border border-amber-500/40`
  return `${base} bg-green-600/30 text-green-200 border border-green-500/40`
}

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      property: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  })

  return (
    <main className="container py-6 space-y-4">
      <h1 className="text-xl font-semibold">Tickets</h1>

      <div className="space-y-2">
        {tickets.map(t => {
          const last = t.messages[0]
          return (
            <Link
              key={t.id}
              href={`/tickets/${t.id}`}
              className="card flex items-center justify-between gap-4 hover:border-white/25"
            >
              <div className="min-w-0">
                <div className="text-sm opacity-70">
                  {new Date(t.updatedAt).toLocaleString()} • {t.property?.name ?? '—'}
                </div>
                <div className="truncate">
                  <span className="opacity-70">{last ? `[${last.from}] ` : ''}</span>
                  {last?.body ?? '—'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={statusBadge(t.status as any)}>{t.status}</span>
                <span className="px-2 py-0.5 rounded text-xs border border-white/15 opacity-80">
                  {t.type}
                </span>
              </div>
            </Link>
          )
        })}

        {tickets.length === 0 && (
          <div className="opacity-60 text-sm">Aucun ticket pour le moment</div>
        )}
      </div>
    </main>
  )
}