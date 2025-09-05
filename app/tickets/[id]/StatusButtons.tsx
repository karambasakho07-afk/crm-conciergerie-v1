'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { id: string; current: 'OPEN' | 'PENDING' | 'RESOLVED' }

export default function StatusButtons({ id, current }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function setStatus(next: Props['current']) {
    if (next === current) return
    setLoading(next)
    try {
      const r = await fetch(`/api/tickets/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j?.error || 'Erreur statut')
      }
      router.refresh()
    } catch (e) {
      console.error(e)
      alert((e as any).message || 'Impossible de changer le statut')
    } finally {
      setLoading(null)
    }
  }

  const btn = (label: string, value: Props['current']) => (
    <button
      key={value}
      onClick={() => setStatus(value)}
      disabled={loading !== null || current === value}
      className={`btn ${current === value ? 'ring-2 ring-white/60' : ''}`}
      aria-pressed={current === value}
    >
      {loading === value ? '…' : label}
    </button>
  )

  return (
    <div className="flex gap-2">
      {btn('Ouvrir', 'OPEN')}
      {btn('Mettre en attente', 'PENDING')}
      {btn('Résoudre', 'RESOLVED')}
    </div>
  )
}