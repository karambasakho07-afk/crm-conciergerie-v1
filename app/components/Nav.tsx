'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={
        'px-3 py-1 rounded transition ' +
        (isActive
          ? 'bg-white/10 text-white'
          : 'opacity-80 hover:opacity-100')
      }
    >
      {children}
    </Link>
  )
}

export default function Nav() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function logout() {
    try {
      setLoading(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <nav className="flex items-center gap-2 text-sm">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/tickets">Tickets</NavLink>
        <NavLink href="/planning">Planning</NavLink>
        <NavLink href="/reviews">Reviews</NavLink>
      </nav>

      <button
        onClick={logout}
        className="px-2.5 py-1 rounded text-xs border border-white/20 hover:border-white/40 opacity-80 hover:opacity-100"
        disabled={loading}
        title="Se déconnecter"
      >
        {loading ? '…' : 'Logout'}
      </button>
    </div>
  )
}