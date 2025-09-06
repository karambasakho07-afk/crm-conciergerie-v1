// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  // Auth
  '/login',
  '/api/auth/login',

  // Healthcheck
  '/api/health',

  // Webhook & reviews publics
  '/api/whatsapp',
  '/api/reviews/submit',

  // Crons (Vercel)
  '/api/reviews/cron',
  '/api/housekeeping/notify',

  // Assets Next
  '/_next',
  '/favicon.ico',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Laisser passer si route publique (exacte ou préfixe)
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Cookie de session pour tout le reste
  const cookie =
    req.cookies.get('admin_session_v2')?.value ||
    req.cookies.get('admin_session')?.value

  if (!cookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}