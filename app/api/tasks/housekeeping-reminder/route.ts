import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await prisma.auditLog.create({ data: { action: 'HK_REMINDER', entity: 'System' } })
  return NextResponse.json({ ok: true })
}
