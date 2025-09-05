'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  id: string
  initialUpdatedAt: string
  initialMessagesCount: number
  intervalMs?: number
}

export default function AutoRefresh({
  id,
  initialUpdatedAt,
  initialMessagesCount,
  intervalMs = 4000,
}: Props) {
  const router = useRouter()
  const lastUpdatedAt = useRef<string>(initialUpdatedAt)
  const lastCount = useRef<number>(initialMessagesCount)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}/pulse`, { cache: 'no-store' })
        if (!res.ok) return
        const j = await res.json() as {
          updatedAt: string
          messagesCount: number
          status: string
        }
        if (!alive) return
        if (j.updatedAt !== lastUpdatedAt.current || j.messagesCount !== lastCount.current) {
          lastUpdatedAt.current = j.updatedAt
          lastCount.current = j.messagesCount
          router.refresh()
        }
      } catch { /* no-op */ }
    }
    const h = setInterval(tick, intervalMs)
    return () => { alive = false; clearInterval(h) }
  }, [id, intervalMs, router])

  return null
}
