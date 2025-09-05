import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { assigneeId } = await req.json().catch(() => ({} as any))
    if (!assigneeId) return NextResponse.json({ error: 'assigneeId requis' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

    const t = await prisma.task.update({
      where: { id: params.id },
      data: { assigneeId },
    })

    await prisma.auditLog.create({
      data: { action: 'TASK_ASSIGNED', entity: 'Task', entityId: t.id }
    })

    revalidatePath('/planning')
    return NextResponse.json({ ok: true, taskId: t.id, assigneeId })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Erreur serveur' }, { status: 500 })
  }
}