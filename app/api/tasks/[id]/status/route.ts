import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const ALLOWED = new Set(['TODO','IN_PROGRESS','DONE'])

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json().catch(() => ({} as any))
    const next = String(status || '').toUpperCase()
    if (!ALLOWED.has(next)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const t = await prisma.task.update({
      where: { id: params.id },
      data: { status: next as any, updatedAt: new Date() },
    })

    revalidatePath('/planning')
    return NextResponse.json({ ok: true, status: t.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}