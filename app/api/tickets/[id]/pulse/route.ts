import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const t = await prisma.ticket.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })
    if (!t) return NextResponse.json({ error: 'not found' }, { status: 404 })

    return NextResponse.json({
      id: t.id,
      status: t.status,
      updatedAt: t.updatedAt,
      messagesCount: t._count.messages,
    })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'pulse failed' }, { status: 500 })
  }
}
