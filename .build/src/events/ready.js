"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const __1 = require("..");
const cluster_1 = require("../cluster");
const statPoster_1 = __importDefault(require("../statPoster"));
const status_1 = __importDefault(require("../status"));
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "ready",
    async execute(a, b, client) {
        logger_1.default.info(`${client.user?.username} is running`);
        (0, status_1.default)(client);
        __1.TaskScheduler.loadAndProcessBacklog(1000);
        if (process.env["IS_PROD"] === "true") {
            (0, statPoster_1.default)(client);
        }
        (await cluster_1.socket).emit("shardRunning", worker_threads_1.workerData["SHARDS"]);
        console.log("READY", client.token, client.isReady(), client.ws.status, client.user.username);
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/ready.js.map