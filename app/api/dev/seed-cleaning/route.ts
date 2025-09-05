import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes } from 'date-fns'

export async function POST() {
  let prop = await prisma.property.findFirst({ where: { slug: 'demo-apartment' } })
  if (!prop) {
    prop = await prisma.property.create({
      data: { slug: 'demo-apartment', name: 'Demo apartment', address: '—' }
    })
  }

  const task = await prisma.task.create({
    data: {
      propertyId: prop.id,
      type: 'CLEANING',
      dueAt: addMinutes(new Date(), 10),
      status: 'TODO',
    } as any
  })

  return NextResponse.json({ ok: true, task })
}