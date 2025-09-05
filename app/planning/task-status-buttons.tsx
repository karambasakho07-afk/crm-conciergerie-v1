'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type S = 'TODO' | 'IN_PROGRESS' | 'DONE'

export default function TaskStatusButtons({ id, current }: { id: string; current: S }) {
  const [loading, setLoading] = useState<S | null>(null)
  const r = useRouter()

  async function setStatus(next: S) {
    if (next === current) return
    setLoading(next)
    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Maj statut échouée')
      }
      r.refresh()
    } catch (e: any) {
      alert(e?.message || 'Erreur')
    } finally {
      setLoading(null)
    }
  }

  const Btn = (label: string, s: S) => (
    <button
      key={s}
      onClick={() => setStatus(s)}
      disabled={!!loading || current === s}
      className={`btn ${current === s ? 'ring-2 ring-white/60' : ''}`}
      aria-pressed={current === s}
    >
      {loading === s ? '…' : label}
    </button>
  )

  return (
    <div className="flex gap-2">
      {Btn('À faire', 'TODO')}
      {Btn('En cours', 'IN_PROGRESS')}
      {Btn('Terminé', 'DONE')}
    </div>
  )
}