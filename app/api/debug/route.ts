// app/api/debug/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const ping = await prisma.$queryRaw`SELECT 1`
    let ticketCount: number | string = 0
    try {
      ticketCount = await prisma.ticket.count()
    } catch (e: any) {
      ticketCount = `ticket.count error: ${e?.message ?? e}`
    }

    return NextResponse.json({ ok: true, ping, ticketCount })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e), stack: e?.stack },
      { status: 500 }
    )
  }
}