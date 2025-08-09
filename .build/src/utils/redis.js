"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="49b42789-e98f-5308-9dab-99326e6f8b37")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("./logger"));
const redis = new ioredis_1.default({
    host: process.env["REDIS_HOST"],
    port: parseInt(process.env["REDIS_PORT"], 10),
    password: process.env["REDIS_PASSWORD"],
});
redis
    .once("ready", () => logger_1.default.info("Redis ready"))
    .on("error", (err) => logger_1.default.error("Redis error", err))
    .on("close", () => logger_1.default.warn("Redis connection closed"))
    .on("connect", () => logger_1.default.info("Redis connected"));
exports.default = redis;
//# sourceMappingURL=/src/utils/redis.js.map
//# debugId=49b42789-e98f-5308-9dab-99326e6f8b37
