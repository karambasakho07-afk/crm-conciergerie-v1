import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addHours, addMinutes, isAfter } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// sécurité simple via CRON_SECRET (optionnel en local)
function isAuthorized(req: Request) {
  const need = process.env.CRON_SECRET
  if (!need) return true
  const got = req.headers.get('x-cron-key') || ''
  return got === need
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // 1) récupérer les checkouts déjà échus
  const checkouts = await prisma.task.findMany({
    where: {
      type: 'CHECKOUT',
      dueAt: { lte: now },
    },
    orderBy: { dueAt: 'asc' },
    include: { property: true },
  })

  let created = 0
  for (const co of checkouts) {
    // 2) éviter les doublons : vérifier si un CLEANING existe déjà dans les 6h suivant le checkout
    const exists = await prisma.task.findFirst({
      where: {
        type: 'CLEANING',
        propertyId: co.propertyId,
        dueAt: { gte: co.dueAt, lte: addHours(co.dueAt, 6) },
      },
      select: { id: true },
    })
    if (exists) continue

    // 3) créer la tâche CLEANING
    await prisma.task.create({
      data: {
        propertyId: co.propertyId,
        type: 'CLEANING',
        dueAt: isAfter(addMinutes(co.dueAt, 30), now)
          ? addMinutes(co.dueAt, 30)
          : addMinutes(now, 10),
        status: 'TODO',
      } as any,
    })
    created++
  }

  return NextResponse.json({
    ok: true,
    checkouts: checkouts.length,
    cleanings_created: created,
  })
}