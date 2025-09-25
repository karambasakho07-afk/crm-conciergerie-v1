// app/page.tsx
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export default async function Home() {
  let tickets: any[] = []
  try {
    tickets = await prisma.ticket.findMany({
      take: 20, // limite pour éviter les requêtes lourdes
    })
  } catch (e) {
    console.error('home tickets findMany failed:', e)
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>CRM Conciergerie</h1>
      <p>Tickets chargés : {tickets.length}</p>
    </main>
  )
}