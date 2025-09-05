import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { twilioClient, twilioFrom } from '@/lib/twilio'

function dayRange(d=new Date()) {
  const s = new Date(d); s.setHours(0,0,0,0)
  const e = new Date(d); e.setHours(23,59,59,999)
  return { start: s, end: e }
}

export async function POST() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { start, end } = dayRange()

    // 1) CHECKOUTs du jour
    const checkouts = await prisma.task.findMany({
      where: { type: 'CHECKOUT' as any, dueAt: { gte: start, lte: end } },
      include: { property: true },
    })

    let sent = 0
    for (const t of checkouts) {
      if (!t.property) continue

      // 2) éviter doublon dans la journée
      const already = await prisma.review.findFirst({
        where: { propertyId: t.property.id, createdAt: { gte: start, lte: end } },
        select: { id: true },
      })
      if (already) continue

      // 3) créer review “en attente”
      const review = await prisma.review.create({
        data: { propertyId: t.property.id, score: 0, comment: null },
      })

      // 4) dernier numéro invité connu (par ce logement)
      const lastMsg = await prisma.message.findFirst({
        where: { ticket: { propertyId: t.property.id }, phone: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: { phone: true },
      })
      if (!lastMsg?.phone) continue

      const link = `${base}/reviews/r/${review.id}`

      // 5) envoi WhatsApp
      await twilioClient.messages.create({
        from: `whatsapp:${twilioFrom}`,
        to:   `whatsapp:${lastMsg.phone}`,
        body: `Merci pour votre séjour chez "${t.property.name}" ! Pouvez-vous nous laisser un avis ? ${link}`
      })

      // 6) audit
      await prisma.auditLog.create({
        data: { action: 'REVIEW_LINK_SENT', entity: 'Property', entityId: t.property.id }
      })

      sent++
    }

    return NextResponse.json({ ok: true, sent, date: new Date().toISOString() })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Erreur cron reviews' }, { status: 500 })
  }
}
