'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

// yyyy-mm-dd (UTC-safe pour <input type="date">)
function toDateInputValue(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export default function DateFilters() {
  const sp = useSearchParams()

  const { start, end } = useMemo(() => {
    const s = sp.get('start') || toDateInputValue(today())
    const e = sp.get('end') || toDateInputValue(today())
    return { start: s, end: e }
  }, [sp])

  const todayStr = toDateInputValue(today())
  const last7Start = (() => {
    const t = today()
    const s = new Date(t)
    s.setDate(t.getDate() - 6)
    return toDateInputValue(s)
  })()
  const monthStart = toDateInputValue(startOfMonth())
  const monthEnd = toDateInputValue(endOfMonth())

  return (
    <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
      {/* Form GET vers la home => rafraîchit le dashboard avec les bons params */}
      <form method="get" action="/" className="flex items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Du</label>
          <input
            type="date"
            name="start"
            className="input"
            defaultValue={start}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Au</label>
          <input
            type="date"
            name="end"
            className="input"
            defaultValue={end}
          />
        </div>

        <button type="submit" className="btn">Appliquer</button>
      </form>

      {/* Raccourcis rapides */}
      <div className="flex gap-2">
        <Link
          className="btn"
          href={`/?start=${encodeURIComponent(todayStr)}&end=${encodeURIComponent(todayStr)}`}
        >
          Aujourd’hui
        </Link>

        <Link
          className="btn"
          href={`/?start=${encodeURIComponent(last7Start)}&end=${encodeURIComponent(todayStr)}`}
        >
          7 jours
        </Link>

        <Link
          className="btn"
          href={`/?start=${encodeURIComponent(monthStart)}&end=${encodeURIComponent(monthEnd)}`}
        >
          Mois en cours
        </Link>
      </div>
    </div>
  )
}