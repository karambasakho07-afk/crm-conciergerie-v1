import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const publicPaths = [
    '/api/health',
    '/api/stats/summary',
    '/api/housekeeping/notify',
    '/api/reviews/cron',
  ]
  if (pathname.startsWith('/api/_debug/')) return NextResponse.next()
  if (publicPaths.includes(pathname)) return NextResponse.next()
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
