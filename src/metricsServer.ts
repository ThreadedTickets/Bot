import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { collectDefaultMetrics, Registry, Gauge, Counter } from "prom-client";
import logger from "./utils/logger";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token || token !== process.env["API_TOKEN"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

const app = express();
const registry = new Registry();

// Auth middleware
app.use(authMiddleware);

// Register default metrics
collectDefaultMetrics({ register: registry });

// Database metrics
export const cacheHits = new Gauge({
  name: "database_cache_hits",
  help: "Number of cache hits when requesting from the database",
});

export const cacheMisses = new Gauge({
  name: "database_cache_misses",
  help: "Number of cache misses when requesting from the database",
});

export const databaseRequests = new Gauge({
  name: "database_requests",
  help: "Number of times data has been requested from the database",
});

registry.registerMetric(cacheHits);
registry.registerMetric(cacheMisses);
registry.registerMetric(databaseRequests);

// Generic error metrics
export const errors = new Counter({
  name: "errors",
  help: "Generic error tracking",
  labelNames: ["location", "error"] as const,
});

registry.registerMetric(errors);

// Command metrics
export const commandsRun = new Counter({
  name: "commands_run",
  help: "The number of commands that have been run",
  labelNames: ["command", "type"] as const,
});

export const commandErrors = new Counter({
  name: "commands_errored",
  help: "The number of commands that have errored out",
  labelNames: ["command", "type", "cause"] as const,
});

registry.registerMetric(commandsRun);
registry.registerMetric(commandErrors);

// Interactions
export const interactionsRun = new Counter({
  name: "interactions_run",
  help: "The number of interactions that have run",
  labelNames: ["type", "name"] as const,
});

export const interactionErrors = new Counter({
  name: "interactions_errored",
  help: "The number of interactions that have errored",
  labelNames: ["type", "name"] as const,
});

registry.registerMetric(interactionsRun);
registry.registerMetric(interactionErrors);

// Ticketing analytics
export const tickets = new Counter({
  name: "tickets",
  help: "Ticket information",
  labelNames: ["action", "origin"] as const,
});

registry.registerMetric(tickets);

// Rate limiter middleware for Prometheus endpoint
const metricsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Exportable function to start the metrics server
export function startMetricsServer(port: number) {
  app.get(
    `/${process.env["METRICS_URL"]}`,
    metricsLimiter,
    async (req: Request, res: Response) => {
      res.setHeader("Content-Type", registry.contentType);
      res.end(await registry.metrics());
    }
  );

  app.listen(port || "10001", () => {
    logger.info(
      `Metrics server running at http://localhost:${port}/${process.env["METRICS_URL"]}`
    );
  });
}
