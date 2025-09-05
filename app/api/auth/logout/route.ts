import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Supprime les 2 variantes de cookie de session
  res.cookies.set('admin_session_v2', '', { path: '/', httpOnly: true, maxAge: 0 })
  res.cookies.set('admin_session', '', { path: '/', httpOnly: true, maxAge: 0 })
  return res
}
