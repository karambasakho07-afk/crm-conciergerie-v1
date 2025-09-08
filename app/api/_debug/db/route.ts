import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const red = (s?: string) => s ? s.replace(/(postgresql:\/\/[^:]+:)[^@]+/, '$1******') : null
  return NextResponse.json({
    DATABASE_URL: red(process.env.DATABASE_URL || null as any),
    DIRECT_URL: red(process.env.DIRECT_URL || null as any),
    rawPortHint: (process.env.DATABASE_URL || '').match(/:(\d+)\//)?.[1] || null
  })
}
