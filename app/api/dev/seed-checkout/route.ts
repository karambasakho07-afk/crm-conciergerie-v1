import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  try {
    const prop = await prisma.property.upsert({
      where: { slug: 'demo-seed-prop' },
      update: {},
      create: { slug: 'demo-seed-prop', name: 'Appartement Démo', address: '1 rue Test' },
    })

    const ticket = await prisma.ticket.create({
      data: { propertyId: prop.id, status: 'OPEN', type: 'MSG' as any },
    })
    await prisma.message.create({
      data: {
        ticketId: ticket.id,
        from: 'guest' as any,
        body: 'Bonjour 👋',
        phone: process.env.TEST_GUEST_PHONE || '+33600000000'
      }
    })

    const now = new Date(); const due = new Date(now); due.setHours(12, 0, 0, 0)
    await prisma.task.create({
      data: { propertyId: prop.id, type: 'CHECKOUT' as any, dueAt: due, status: 'TODO' as any }
    })

    return NextResponse.json({ ok: true, propertyId: prop.id, ticketId: ticket.id })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'seed failed' }, { status: 500 })
  }
}
