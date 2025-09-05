// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Nav from './components/Nav'

export const metadata: Metadata = {
  title: 'Concierge CRM',
  description: 'CRM concierge augmenté',
}

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