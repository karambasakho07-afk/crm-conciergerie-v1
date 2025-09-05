import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, differenceInMinutes } from 'date-fns'

function parse(v?: string) {
  if (!v) return null
  const d = new Date(v + 'T00:00:00')
  return isNaN(+d) ? null : d
}

function getRange(params: { start?: string, end?: string }) {
  const defEnd = endOfDay(new Date())
  const defStart = startOfDay(subDays(defEnd, 6))
  const s = parse(params.start) ?? defStart
  const e = parse(params.end) ?? defEnd
  return { start: startOfDay(s), end: endOfDay(e) }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const { start, end } = getRange({
      start: url.searchParams.get('start') || undefined,
      end:   url.searchParams.get('end')   || undefined
    })

    const [open, resolvedCreated, resolvedUpdated, withFirstResp] = await Promise.all([
      prisma.ticket.count({ where: { createdAt: { gte: start, lte: end }, status: 'OPEN' as any } }),
      prisma.ticket.count({ where: { createdAt: { gte: start, lte: end }, status: 'RESOLVED' as any } }),
      prisma.ticket.count({ where: { updatedAt: { gte: start, lte: end }, status: 'RESOLVED' as any } }),
      prisma.ticket.findMany({
        where: { createdAt: { gte: start, lte: end }, firstResponseAt: { not: null } },
        select: { createdAt: true, firstResponseAt: true }
      }),
    ])

    const ttrs = withFirstResp
      .map(t => differenceInMinutes(t.firstResponseAt as Date, t.createdAt))
      .filter(n => Number.isFinite(n) && n >= 0)
    const avgTTR = ttrs.length ? Math.round(ttrs.reduce((a,b)=>a+b,0)/ttrs.length) : 0

    const cleanings = await prisma.task.findMany({
      where: { type: 'CLEANING' as any, dueAt: { gte: start, lte: end } },
      select: { id: true, status: true },
    })
    const hkChecks = await prisma.hK_Check.findMany({
      where: { taskId: { in: cleanings.map(c => c.id) } },
      select: { id: true },
    })
    const housekeepingCompliance = cleanings.length
      ? Math.round((hkChecks.length / cleanings.length) * 100)
      : 0
    const cleaningDone = cleanings.filter(c => c.status === 'DONE').length

    const periodReviews = await prisma.review.findMany({
      where: { createdAt: { gte: start, lte: end }, score: { gt: 0 } },
      select: { score: true },
    })
    const csatPct = periodReviews.length
      ? Math.round((periodReviews.reduce((a, r) => a + (r.score || 0), 0) / (periodReviews.length * 5)) * 100)
      : 0
    const avgScore = periodReviews.length
      ? Number((periodReviews.reduce((a, r) => a + (r.score || 0), 0) / periodReviews.length).toFixed(2))
      : 0

    return NextResponse.json({
      range: { start, end },
      tickets: { open, resolvedCreated, resolvedUpdated, avgTTR },
      housekeeping: { total: cleanings.length, done: cleaningDone, compliancePct: housekeepingCompliance },
      reviews: { count: periodReviews.length, csatPct, avgScore }
    })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'stats failed' }, { status: 500 })
  }
}
