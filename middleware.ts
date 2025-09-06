// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes publiques (sans session requise)
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',

  // Webhooks & crons
  '/api/whatsapp',
  '/api/reviews/submit',
  '/api/reviews/cron',
  '/api/housekeeping/notify',
  '/api/health',

  // Assets Next.js
  '/_next',
  '/favicon.ico',
]

// Vérifie si le chemin demandé est public
function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Autoriser l’accès direct aux routes publiques
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Vérifie la présence d’un cookie de session
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

// Ignorer les fichiers statiques & images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}