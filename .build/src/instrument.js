"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="283070fb-519c-50ec-8a96-be40a6e1ebf1")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
node_1.default.init({
    dsn: process.env["SENTRY_URL"],
    environment: process.env.IS_PROD === "true" ? "production" : "development",
    integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
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
//# sourceMappingURL=/src/instrument.js.map
//# debugId=283070fb-519c-50ec-8a96-be40a6e1ebf1
