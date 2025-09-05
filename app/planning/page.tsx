import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'
import TaskStatusButtons from './task-status-buttons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlanningPage() {
  const now = new Date()
  const from = startOfDay(now)
  const to = endOfDay(now)

  const tasks = await prisma.task.findMany({
    where: { dueAt: { gte: from, lte: to } },
    orderBy: [{ dueAt: 'asc' }],
    include: { property: true, assignee: true },
  })

  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-xl font-semibold">Planning du jour</h1>

      <div className="card">
        {tasks.length === 0 ? (
          <div className="opacity-60">Aucune tâche aujourd’hui.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center justify-between border-b last:border-none py-2">
                <div className="text-sm">
                  <div className="font-semibold">
                    {t.type} • {new Date(t.dueAt).toLocaleTimeString()}
                  </div>
                  <div className="opacity-80">
                    Logement : {t.property?.name || '—'} • Assigné : {t.assignee?.name || '—'} • Statut : <b>{t.status}</b>
                  </div>
                </div>
                <TaskStatusButtons id={t.id} current={t.status as any} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}