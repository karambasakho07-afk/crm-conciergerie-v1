'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function Filters() {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()

  const startVal = sp.get('start') || new Date(Date.now() - 6*24*3600*1000).toISOString().slice(0,10)
  const endVal   = sp.get('end')   || new Date().toISOString().slice(0,10)

  function update(q: Record<string,string>) {
    const p = new URLSearchParams(sp.toString())
    Object.entries(q).forEach(([k,v]) => p.set(k, v))
    start(() => router.push(`/stats?${p.toString()}`))
  }

  return (
    <div className="card grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <label className="block">
        <span className="block text-sm opacity-80 mb-1">Début</span>
        <input
          className="input"
          type="date"
          defaultValue={startVal}
          onChange={e => update({ start: e.currentTarget.value })}
        />
      </label>
      <label className="block">
        <span className="block text-sm opacity-80 mb-1">Fin</span>
        <input
          className="input"
          type="date"
          defaultValue={endVal}
          onChange={e => update({ end: e.currentTarget.value })}
        />
      </label>
      <button className="btn" onClick={() => update({})} disabled={pending}>
        {pending ? '…' : 'Actualiser'}
      </button>
    </div>
  )
}
