'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.error || 'Mot de passe invalide')
      }
      router.replace('/') // vers dashboard
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto space-y-4">
      <div className="space-y-1">
        <label className="text-sm opacity-80">Mot de passe admin</label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="••••••••"
            className="input w-full pr-12"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100"
            aria-label="Afficher / masquer"
          >
            {show ? 'Masquer' : 'Voir'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-600/20 border border-red-500/40 text-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !pwd.trim()}
        className="btn w-full disabled:opacity-60"
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-xs opacity-60 text-center">
        Environnement: <code>V1 • Auth simple</code>
      </p>
    </form>
  )
}
