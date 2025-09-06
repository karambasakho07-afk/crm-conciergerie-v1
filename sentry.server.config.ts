// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'production',

  // Perf & Replay (server)
  tracesSampleRate: 0.1,

  // Pas de propriété "enableLogs" ici (ni côté edge).
  debug: false,
});