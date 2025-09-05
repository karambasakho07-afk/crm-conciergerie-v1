import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const r = await prisma.review.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!r) return NextResponse.json({ error: 'no review found' }, { status: 404 })
  return NextResponse.json({ id: r.id })
}
