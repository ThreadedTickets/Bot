"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f8a4257d-3e66-51c8-839c-45be78cebaa4")}catch(e){}}();

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
    sendDefaultPii: true,
});
//# sourceMappingURL=instrument.js.map
//# debugId=f8a4257d-3e66-51c8-839c-45be78cebaa4
