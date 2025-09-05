import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { twilioClient, twilioFrom } from '@/lib/twilio'

function tomorrowRange() {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  const s = new Date(t); s.setHours(0,0,0,0)
  const e = new Date(t); e.setHours(23,59,59,999)
  return { start: s, end: e }
}

export async function POST() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { start, end } = tomorrowRange()

    // 1) Récupère tous les CLEANING de demain
    const cleanings = await prisma.task.findMany({
      where: { type: 'CLEANING' as any, dueAt: { gte: start, lte: end } },
      include: { property: true, assignee: true }
    })

    let sent = 0
    for (const task of cleanings) {
      if (!task.assignee?.phone) continue

      // 2) URL mobile (lien upload sécurisé déjà en place)
      const link = `${base}/housekeeping/${task.id}`

      // 3) Envoi WhatsApp à l'intervenant
      await twilioClient.messages.create({
        from: `whatsapp:${twilioFrom}`,
        to:   `whatsapp:${task.assignee.phone}`,
        body: [
          `🧹 Tâche ménage pour demain`,
          `Logement: ${task.property?.name || '—'}`,
          `Date: ${new Date(task.dueAt).toLocaleString()}`,
          `Lien: ${link}`
        ].join('\n')
      })

      // 4) Audit
      await prisma.auditLog.create({
        data: { action: 'HK_NOTIFY_SENT', entity: 'Task', entityId: task.id }
      })

      sent++
    }

    return NextResponse.json({ ok: true, sent, date: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur cron housekeeping' }, { status: 500 })
  }
}
