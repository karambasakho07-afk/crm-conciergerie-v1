'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{background:'#0b1020', color:'#fff', fontFamily:'ui-sans-serif, system-ui', padding:'32px'}}>
        <h1 style={{fontSize:24, marginBottom:8}}>Une erreur est survenue</h1>
        <p style={{opacity:.8, marginBottom:16}}>
          {error?.message || 'Unknown client error'}
          {error?.digest ? ` (digest: ${error.digest})` : ''}
        </p>
        <button
          onClick={() => reset()}
          style={{background:'#334155', border:'1px solid #94a3b8', padding:'8px 12px', borderRadius:8}}
        >
          Recharger la page
        </button>
      </body>
    </html>
  )
}