import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function ReviewFormPage({ params }: { params: { token: string } }) {
  const review = await prisma.review.findFirst({ where: { id: params.token } })
  if (!review) {
    return (
      <main className="container py-6">
        <h1 className="text-xl font-semibold mb-2">Lien invalide</h1>
        <p className="opacity-80">Ce lien de review est invalide ou expiré.</p>
        <Link href="/" className="btn mt-4">Accueil</Link>
      </main>
    )
  }

  // 🔒 Si une note est déjà enregistrée, ne plus afficher le formulaire
  if (review.score && review.score >= 1) {
    return (
      <main className="container py-6 max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Avis déjà envoyé ✅</h1>
        <p className="opacity-80">Merci, nous avons bien reçu votre retour.</p>
        <Link href="/reviews/thanks" className="btn mt-4">OK</Link>
      </main>
    )
  }

  return (
    <main className="container py-6 max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Votre avis</h1>
      <form action="/api/reviews/submit" method="POST" className="card space-y-3">
        <input type="hidden" name="id" value={review.id} />
        <label className="block">
          <span className="block mb-1">Note (1 à 5)</span>
          <input className="input" name="score" type="number" min={1} max={5} required />
        </label>
        <label className="block">
          <span className="block mb-1">Commentaire (optionnel)</span>
          <textarea className="input h-28" name="comment" placeholder="Votre expérience…"></textarea>
        </label>
        <button className="btn w-full" type="submit">Envoyer</button>
      </form>
    </main>
  )
}