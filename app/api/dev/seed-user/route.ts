import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const hk = await prisma.user.upsert({
    where: { email: 'housekeeper@demo.local' },
    update: {},
    create: {
      name: 'Ménage Démo',
      email: 'housekeeper@demo.local',
      role: 'HOUSEKEEPING' as any,
      phone: '+33600000001',
    },
  })
  return NextResponse.json({ ok: true, hk })
}