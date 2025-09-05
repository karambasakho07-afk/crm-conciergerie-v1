import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({} as any))
    if (!password) return NextResponse.json({ error: 'Missing password' }, { status: 400 })

    const ok = password === process.env.ADMIN_PASSWORD
    if (!ok) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_session_v2', 'ok', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      secure: process.env.NODE_ENV === 'production', // en local: false
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}