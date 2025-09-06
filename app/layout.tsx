// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from './components/Nav'

export const metadata: Metadata = {
  title: 'Concierge CRM',
  description: 'CRM concierge augmenté',
}

// Désactive le prerender pour toute l’app
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0b0e13] text-white">
        <header className="border-b border-white/10">
          <div className="container h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold">CRM Conciergerie</Link>
            <Nav />
          </div>
        </header>

        <main className="container py-6">
          {children}
        </main>
      </body>
    </html>
  )
}