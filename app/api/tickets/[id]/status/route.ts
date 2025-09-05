import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const ALLOWED = new Set(['OPEN', 'PENDING', 'RESOLVED'])

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json().catch(() => ({} as any))
    const next = String(status || '').toUpperCase()

    if (!ALLOWED.has(next)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
    }
    if (ticket.status === next) {
      return NextResponse.json({ ok: true, status: next })
    }

    const updated = await prisma.ticket.update({
      where: { id: params.id },
      data: { status: next as any, updatedAt: new Date() },
    })

    // ⚡ Invalidation de la page du ticket
    revalidatePath(`/tickets/${params.id}`)

    await prisma.auditLog.create({
      data: {
        action: 'TICKET_STATUS_CHANGED',
        entity: 'Ticket',
        entityId: ticket.id,
      },
    })

    return NextResponse.json({ ok: true, status: updated.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}