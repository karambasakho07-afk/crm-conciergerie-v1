import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, score, comment } = await req.json() as { id?: string, score?: number, comment?: string }
    if (!id) return NextResponse.json({ error: 'Missing review id' }, { status: 400 })
    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Score must be 1..5' }, { status: 400 })
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { score, comment: (comment || '').trim() || null }
    })

    await prisma.auditLog.create({
      data: { action: 'REVIEW_SUBMITTED', entity: 'Review', entityId: updated.id }
    })

    return NextResponse.json({ ok: true, id: updated.id })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'submit failed' }, { status: 500 })
  }
}
