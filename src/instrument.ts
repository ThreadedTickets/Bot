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
  beforeSend(event) {
    event.exception?.values?.forEach((value) => {
      value.stacktrace?.frames?.forEach((frame) => {
        if (frame.filename) {
          // Normalize paths to match your repository structure
          frame.filename = frame.filename
            .replace("/home/container/.build/", "./")
            .replace(/^\.\/build\//, "./")
            .replace(".js", ".ts");
        }
      });
    });
    return event;
  },
});
