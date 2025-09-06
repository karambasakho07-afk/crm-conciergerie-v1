// instrumentation.ts — setup minimal compatible avec @sentry/nextjs actuel
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Runtime Node.js (routes / API / server)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      tracesSampleRate: 0.1,           // tu pourras ajuster plus tard
      replaysSessionSampleRate: 0.0,   // off par défaut
      replaysOnErrorSampleRate: 1.0,   // on sur erreur
    });
  }

  // Runtime Edge (middleware, edge routes)
  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      tracesSampleRate: 0.1,
    });
  }
}

// ❌ Ne pas exporter onRequestError / captureRequestError : pas supporté dans ta version