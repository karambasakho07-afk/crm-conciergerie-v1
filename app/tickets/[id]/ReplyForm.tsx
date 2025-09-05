'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function ReplyForm({ id }: { id: string }) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any))
        throw new Error(j?.error || 'Échec envoi')
      }
      setBody('')       // vide le champ
      router.refresh()  // recharge la conversation
    } catch (err: any) {
      alert(err?.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <h2 className="font-semibold">Répondre au voyageur (WhatsApp)</h2>
      <textarea
        className="input h-28"
        placeholder="Votre réponse…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button className="btn w-full" disabled={loading}>
        {loading ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}