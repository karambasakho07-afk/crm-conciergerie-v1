import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  let prop = await prisma.property.findFirst({ where: { slug: 'demo-apartment' } })
  if (!prop) {
    prop = await prisma.property.create({
      data: { slug: 'demo-apartment', name: 'Demo apartment', address: '—' }
    })
  }

  const review = await prisma.review.create({
    data: { propertyId: prop.id, score: 0, comment: null },
  })

  const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reviews/r/${review.id}`
  return NextResponse.json({ ok: true, review, link })
}