import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { twilioClient, twilioFrom } from '@/lib/twilio'

export async function POST(req: Request) {
  try {
    const { phone, propertySlug } = await req.json().catch(() => ({} as any))
    if (!phone) return NextResponse.json({ error: 'phone requis (E.164 ex: +336...)' }, { status: 400 })

    let prop = null as any
    if (propertySlug) {
      prop = await prisma.property.findFirst({ where: { slug: propertySlug } })
    }
    if (!prop) {
      prop = await prisma.property.findFirst() // fallback premier logement
      if (!prop) {
        prop = await prisma.property.create({ data: { slug: 'demo-apartment', name: 'Demo apartment', address: '—' } })
      }
    }

    const review = await prisma.review.create({
      data: { propertyId: prop.id, score: 0, comment: null },
    })

    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const link = `${base}/reviews/r/${review.id}`

    await twilioClient.messages.create({
      from: `whatsapp:${twilioFrom}`,
      to:   `whatsapp:${phone}`,
      body: `Merci pour votre séjour ! Pouvez-vous nous laisser un avis ? ${link}`,
    })

    return NextResponse.json({ ok: true, link, reviewId: review.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}