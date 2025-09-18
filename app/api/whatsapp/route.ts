// app/api/whatsapp/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseServer } from '@/lib/supabase'

// on garde UNE seule déclaration runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function j(err: unknown) {
  console.error('[WhatsApp API error]', err)
  return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
}

export async function POST(req: Request) {
  try {
    const body = await req.formData()
    const from = body.get('From')?.toString()
    const text = body.get('Body')?.toString()

    if (!from || !text) {
      return NextResponse.json({ ok: false, error: 'Missing From/Body' }, { status: 400 })
    }

    // Exemple : enregistre le message dans Prisma
    await prisma.ticket.create({
      data: {
        from,
        message: text,
      },
    })

    // Tu peux aussi appeler Supabase si besoin
    await supabaseServer.rpc('log_whatsapp', { from, message: text }).catch(() => {
      console.warn('Supabase RPC log_whatsapp skipped')
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return j(err)
  }
}