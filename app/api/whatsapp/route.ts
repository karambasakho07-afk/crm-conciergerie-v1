// app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const from = String(form.get('From') ?? '')
    const text = String(form.get('Body') ?? '')

    await prisma.ticket.create({
      data: {
        sender: from,      // <-- au lieu de `from`
        message: text,
      },
    })

    return NextResponse.json({ reply: `Reçu: ${text}` })
  } catch (e: any) {
    console.error('WhatsApp webhook error:', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}