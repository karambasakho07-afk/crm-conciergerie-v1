export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;import { prisma } from '@/lib/prisma'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { property: true }
  })

  const avgScore =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length).toFixed(2)
      : '—'

  function badgeColor(score: number) {
    if (score >= 5) return 'bg-green-600 text-white'
    if (score >= 4) return 'bg-green-500 text-white'
    if (score >= 3) return 'bg-yellow-500 text-black'
    return 'bg-red-600 text-white'
  }

  return (
    <main className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Avis voyageurs</h1>
        <div className="px-3 py-1 rounded bg-slate-800 text-sm">
          CSAT moy. : {avgScore}/5
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map(r => (
          <div
            key={r.id}
            className="flex items-center justify-between card"
          >
            <div className="text-sm">
              <div className="opacity-70">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <div>
                <b>{r.property?.name ?? '—'}</b> — "{r.comment ?? '—'}"
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded font-bold ${badgeColor(r.score)}`}
            >
              {r.score}/5
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="opacity-60 text-sm">Aucun avis pour l’instant</div>
        )}
      </div>
    </main>
  )
}