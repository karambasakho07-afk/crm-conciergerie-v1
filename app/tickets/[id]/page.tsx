import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReplyForm from './ReplyForm'
import StatusButtons from './StatusButtons'
import AutoRefresh from './AutoRefresh'

function statusBadge(s: 'OPEN'|'PENDING'|'RESOLVED') {
  const base = 'px-2 py-0.5 rounded text-xs font-medium'
  if (s === 'OPEN') return `${base} bg-blue-600/30 text-blue-200 border border-blue-500/40`
  if (s === 'PENDING') return `${base} bg-amber-600/30 text-amber-200 border border-amber-500/40`
  return `${base} bg-green-600/30 text-green-200 border border-green-500/40`
}

export default async function TicketPage({ params }: { params: { id: string } }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      property: true,
      messages: { orderBy: { createdAt: 'asc' } }
    }
  })

  if (!ticket) {
    return (
      <main className="container py-6">
        <p>Ticket introuvable</p>
        <Link href="/tickets" className="btn mt-4">Retour</Link>
      </main>
    )
  }

  const initialUpdatedAt = ticket.updatedAt.toISOString()
  const initialMessagesCount = ticket.messages.length

  return (
    <main className="container py-6 space-y-6">
      <AutoRefresh
        id={ticket.id}
        initialUpdatedAt={initialUpdatedAt}
        initialMessagesCount={initialMessagesCount}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Ticket #{ticket.id.slice(0,8)}</h1>
          <span className={statusBadge(ticket.status as any)}>{ticket.status}</span>
        </div>
        <Link href="/tickets" className="btn">← Retour</Link>
      </div>

      <div className="card space-y-3">
        <div className="text-sm opacity-80">
          Logement : {ticket.property?.name ?? '—'} • Type : {ticket.type}
        </div>
        <StatusButtons id={ticket.id} current={ticket.status as any} />
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Conversation</h2>

        <div className="space-y-3">
          {ticket.messages.map(m => {
            const isStaff = m.from === 'staff' || m.from === 'system'
            return (
              <div key={m.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 border ${
                  isStaff
                    ? 'bg-white/10 border-white/20'
                    : 'bg-slate-800/70 border-white/10'
                }`}>
                  <div className="text-xs opacity-60 mb-1">
                    [{new Date(m.createdAt).toLocaleString()}] {m.from}
                    {m.phone ? ` · ${m.phone}` : ''}
                  </div>
                  {m.body && <div className="whitespace-pre-wrap">{m.body}</div>}
                  {m.mediaUrl && (
                    <div className="mt-2">
                      {m.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={m.mediaUrl} alt="attachment" className="max-h-48 rounded" />
                      ) : m.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
                        <video src={m.mediaUrl} controls className="max-h-60 rounded" />
                      ) : (
                        <a
                          href={m.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          Voir la pièce jointe
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {ticket.messages.length === 0 && (
            <div className="opacity-60 text-sm">Aucun message</div>
          )}
        </div>
      </div>

      <ReplyForm id={ticket.id} />
    </main>
  )
}