import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-xl font-semibold">Journal d’audit</h1>

      <div className="card">
        {logs.length === 0 ? (
          <div className="opacity-60">Aucun événement pour l’instant.</div>
        ) : (
          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} className="text-sm border-b last:border-none py-2 grid grid-cols-[180px_160px_1fr] gap-3">
                <div className="opacity-60">{new Date(l.createdAt).toLocaleString()}</div>
                <div className="font-mono opacity-80">{l.action}</div>
                <div className="opacity-90">
                  {l.entity ? (<>
                    <b>{l.entity}</b>{l.entityId ? <> #{String(l.entityId).slice(0,8)}</> : null}
                  </>) : '—'}
                  {l.ip ? <span className="opacity-60"> • IP {l.ip}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}