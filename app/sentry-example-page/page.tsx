'use client'
import * as Sentry from '@sentry/nextjs'

export default function Page() {
  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-xl font-semibold">sentry-example-page</h1>
      <p>Click to throw a test error captured by Sentry.</p>
      <button
        className="btn"
        onClick={() => {
          try {
            throw new Error('Sentry sample error')
          } catch (e) {
            Sentry.captureException(e)
            throw e
          }
        }}
      >
        Throw Sample Error
      </button>
    </main>
  )
}