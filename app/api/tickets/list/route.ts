import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const count = await prisma.ticket.count()
    const rows = await prisma.ticket.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, type: true, createdAt: true },
    })
    return NextResponse.json({ ok: true, count, rows })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
