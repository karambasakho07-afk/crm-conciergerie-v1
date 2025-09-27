// app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const text = String(form.get('Body') ?? '').trim()
    const phone = String(form.get('From') ?? '').trim() // ex: "whatsapp:+33..."
    if (!text) {
      return NextResponse.json({ error: 'empty_body' }, { status: 400 })
    }

    // 1) Créer un ticket minimal (propertyId optionnel dans ton schéma)
    const ticket = await prisma.ticket.create({
      data: {
        // propertyId: '...' // si tu en as un à associer plus tard
      },
      select: { id: true },
    })

    // 2) Ajouter le message rattaché au ticket
    await prisma.message.create({
      data: {
        ticketId: ticket.id,
        from: 'phone',     // MsgFrom enum: guest | staff | system | phone
        body: text,
        phone,             // facultatif dans ton schéma
      },
    })

    return NextResponse.json({ ok: true, ticketId: ticket.id })
  } catch (e: any) {
    console.error('WhatsApp webhook error:', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}