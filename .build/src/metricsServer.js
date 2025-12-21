"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickets = exports.interactionErrors = exports.interactionsRun = exports.commandErrors = exports.commandsRun = exports.errors = exports.databaseRequests = exports.cacheMisses = exports.cacheHits = void 0;
exports.startMetricsServer = startMetricsServer;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prom_client_1 = require("prom-client");
const logger_1 = __importDefault(require("./utils/logger"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token || token !== process.env["API_TOKEN"]) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
}
const app = (0, express_1.default)();
const registry = new prom_client_1.Registry();
// Auth middleware
app.use(authMiddleware);
// Register default metrics
(0, prom_client_1.collectDefaultMetrics)({ register: registry });
// Database metrics
exports.cacheHits = new prom_client_1.Gauge({
    name: "database_cache_hits",
    help: "Number of cache hits when requesting from the database",
});
exports.cacheMisses = new prom_client_1.Gauge({
    name: "database_cache_misses",
    help: "Number of cache misses when requesting from the database",
});
exports.databaseRequests = new prom_client_1.Gauge({
    name: "database_requests",
    help: "Number of times data has been requested from the database",
});
registry.registerMetric(exports.cacheHits);
registry.registerMetric(exports.cacheMisses);
registry.registerMetric(exports.databaseRequests);
// Generic error metrics
exports.errors = new prom_client_1.Counter({
    name: "errors",
    help: "Generic error tracking",
    labelNames: ["location", "error"],
});
registry.registerMetric(exports.errors);
// Command metrics
exports.commandsRun = new prom_client_1.Counter({
    name: "commands_run",
    help: "The number of commands that have been run",
    labelNames: ["command", "type"],
});
exports.commandErrors = new prom_client_1.Counter({
    name: "commands_errored",
    help: "The number of commands that have errored out",
    labelNames: ["command", "type", "cause"],
});
registry.registerMetric(exports.commandsRun);
registry.registerMetric(exports.commandErrors);
// Interactions
exports.interactionsRun = new prom_client_1.Counter({
    name: "interactions_run",
    help: "The number of interactions that have run",
    labelNames: ["type", "name"],
});
exports.interactionErrors = new prom_client_1.Counter({
    name: "interactions_errored",
    help: "The number of interactions that have errored",
    labelNames: ["type", "name"],
});
registry.registerMetric(exports.interactionsRun);
registry.registerMetric(exports.interactionErrors);
// Ticketing analytics
exports.tickets = new prom_client_1.Counter({
    name: "tickets",
    help: "Ticket information",
    labelNames: ["action", "origin"],
});
registry.registerMetric(exports.tickets);
// Rate limiter middleware for Prometheus endpoint
const metricsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
});
// Exportable function to start the metrics server
function startMetricsServer(port) {
    app.get(`/${process.env["METRICS_URL"]}`, metricsLimiter, async (req, res) => {
        res.setHeader("Content-Type", registry.contentType);
        res.end(await registry.metrics());
    });
    app.listen(port || "10001", () => {
        logger_1.default.info(`Metrics server running at http://localhost:${port}/${process.env["METRICS_URL"]}`);
    });
}
//# sourceMappingURL=/src/metricsServer.js.map