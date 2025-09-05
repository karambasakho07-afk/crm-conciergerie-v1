import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { twilioClient, twilioFrom } from '@/lib/twilio'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { body } = await req.json() as { body?: string }
    if (!body || !body.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 20 } }
    })
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 })
    }

    // Dernier message invité avec un numéro WhatsApp
    const lastGuest = ticket.messages.find(
      m => m.phone && (m.from === 'phone' || m.from === 'guest')
    )
    if (!lastGuest?.phone) {
      return NextResponse.json({ error: 'Aucun numéro invité trouvé' }, { status: 400 })
    }

    // --- Normalisation & validation des numéros (format E.164) ---
    const toRaw   = String(lastGuest.phone).replace(/^whatsapp:/i, '').replace(/\s+/g, '')
    const fromRaw = String(twilioFrom).replace(/^whatsapp:/i, '').replace(/\s+/g, '')

    // E.164 très basique : commence par + et 8 à 15 chiffres
    const e164 = /^\+\d{8,15}$/
    if (!e164.test(toRaw)) {
      return NextResponse.json({ error: `Numéro invité invalide: ${toRaw}` }, { status: 400 })
    }
    if (!e164.test(fromRaw)) {
      return NextResponse.json({ error: `TWILIO_PHONE_NUMBER invalide: ${fromRaw}` }, { status: 500 })
    }

    // Envoi du message via Twilio (WhatsApp)
    await twilioClient.messages.create({
      from: `whatsapp:${fromRaw}`,
      to:   `whatsapp:${toRaw}`,
      body
    })

    // Log côté base
    const msg = await prisma.message.create({
      data: { ticketId: ticket.id, from: 'staff', body }
    })
    await prisma.auditLog.create({
      data: { action: 'MESSAGE_OUT', entity: 'Ticket', entityId: ticket.id }
    })

    return NextResponse.json({ ok: true, id: msg.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur inconnue' }, { status: 500 })
  }
}