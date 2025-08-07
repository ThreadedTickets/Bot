import Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env["SENTRY_URL"],
  environment: process.env.IS_PROD === "true" ? "production" : "development",
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",
  release: "threaded@1",
  sendDefaultPii: true,
});
