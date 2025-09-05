// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://a1ba3b70b804db86f9f3569406b2c2bc@o4509961920577536.ingest.de.sentry.io/4509961926541392",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
// instrumentation-client.ts
import * as Sentry from '@sentry/nextjs';

// Ce fichier est chargé côté navigateur.
// Ne PAS utiliser "enableLogs" (option inexistante dans ce SDK).
// On active Replay & Tracing via les intégrations officielles.

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'production',

  // Performance
  tracesSampleRate: 1.0,

  // Session Replay (échantillonnage raisonnable)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Intégrations conseillées côté client
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;