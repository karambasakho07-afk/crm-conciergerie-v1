import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Routes publiques (sans session) – V1 prod
 */
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',

  // Santé
  '/api/health',

  // Webhook & reviews publics
  '/api/whatsapp',
  '/api/reviews/submit',

  // Crons/notifications
  '/api/reviews/cron',
  '/api/housekeeping/notify',

  // Assets Next
  '/_next',
  '/favicon.ico',
]

function isPublic(pathname: string) {
  // on match exact OU prefix avec un slash pour éviter /api/whatsapp-x
  return PUBLIC_PATHS.some(p =>
    pathname === p || pathname.startsWith(p.endsWith('/') ? p : p + '/')
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

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
  // on laisse passer les assets déjà exclus
  matcher: ['/((?!api/preview|_next/static|_next/image|favicon.ico).*)'],
}