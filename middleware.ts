import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Routes publiques (sans session).
 * On réduit au strict nécessaire pour la V1.
 */
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',

  // Webhook Twilio & formulaire public reviews
  '/api/whatsapp',
  '/api/reviews/submit',

  // Crons Vercel
  '/api/reviews/cron',
  '/api/housekeeping/notify',

  // Assets
  '/_next',
  '/favicon.ico',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ⚡ En DEV on laisse passer TOUTES les routes API (plus simple pour tester).
  // (On resserrera avant déploiement.)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Laisser passer si path public
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Protéger tout le reste par cookie de session
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

// Scope du middleware
export const config = {
  matcher: ['/((?!api/preview|_next/static|_next/image|favicon.ico).*)'],
}