// app/tickets/page.tsx
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export default async function TicketsPage() {
  let tickets: { id: string; status: string; type: string; createdAt: Date }[] = []
  try {
    tickets = await prisma.ticket.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, type: true, createdAt: true },
    })
  } catch (e) {
    console.error('tickets findMany failed:', e)
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Tickets</h1>
      <p>Chargés: {tickets.length}</p>
      <ul>
        {tickets.map(t => (
          <li key={t.id}>
            <strong>{t.status}</strong> · {t.type} · {new Date(t.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
