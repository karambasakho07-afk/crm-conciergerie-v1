import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function mask(url?: string) {
  if (!url) return ''
  return url.replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+/i, '$1******')
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const directUrl = process.env.DIRECT_URL || ''

  // Prisma test avec override explicite de la datasource
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  })

  try {
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>('select now()')
    return NextResponse.json({
      ok: true,
      database_url: mask(dbUrl),
      direct_url: mask(directUrl),
      now: now?.[0]?.now ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      database_url: mask(dbUrl),
      direct_url: mask(directUrl),
      error: e?.message || String(e),
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
