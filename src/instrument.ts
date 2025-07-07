import Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://eb87124ab01686b4a3f1a71108620e73@o4509627847737345.ingest.us.sentry.io/4509627849572352",
  environment: process.env.IS_PROD === "true" ? "production" : "development",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",

  sendDefaultPii: true,
});
