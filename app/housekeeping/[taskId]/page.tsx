'use client'
import { useState } from 'react'

export default function HKTask({ params }: { params: { taskId: string } }) {
  const [file, setFile] = useState<File|null>(null)
  const [checklist, setChecklist] = useState('{"rooms": true, "bathroom": true}')
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert('Choisir une photo')
    const fd = new FormData()
    fd.append('taskId', params.taskId)
    fd.append('photo', file)
    fd.append('checklist', checklist)
    const res = await fetch('/api/housekeeping/upload', { method: 'POST', body: fd })
    if (res.ok) alert('Upload OK'); else alert('Erreur upload')
  }
  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Ménage — Upload photo</h1>
      <form onSubmit={onSubmit} className="space-y-3 card">
        <input className="input" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <textarea className="input h-24" value={checklist} onChange={e=>setChecklist(e.target.value)} />
        <button className="btn w-full">Envoyer</button>
      </form>
    </main>
  )
}
