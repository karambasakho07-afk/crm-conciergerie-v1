// app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const text = String(form.get('Body') ?? '')
    // ⛔️ Écriture DB désactivée temporairement (schéma à clarifier)
    return NextResponse.json({ reply: `Reçu: ${text}` })
  } catch (e: any) {
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}