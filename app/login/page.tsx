import LoginForm from './LoginForm'
import Link from 'next/link'

export const metadata = {
  title: 'Connexion — Concierge CRM',
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-6 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">CRM Conciergerie</h1>
          <p className="text-sm opacity-70">Accès réservé — Admin</p>
        </div>

        <LoginForm />

        <div className="text-center text-xs opacity-60">
          Besoin d’aide ? <Link href="/tickets" className="underline">Voir les tickets</Link>
        </div>
      </div>
    </main>
  )
}
