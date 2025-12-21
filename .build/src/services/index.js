"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const duration_1 = require("../utils/formatters/duration");
/**
 * Services should only be used for things where it does not matter when values are returned
 */
class Service {
    constructor(name, options) {
        this.status = "pinging";
        this.flushing = false;
        this.name = name;
        this.baseUrl = options.baseUrl;
        this.pingUrl = `${this.baseUrl}/${options.ping.path}`;
        this.auth = options.auth;
        this.pingInterval = options.ping.interval ?? 60;
        this.queueDir = path_1.default.join(process.cwd(), "service-queue", this.name);
        this.init();
    }
    init() {
        (0, fs_1.mkdirSync)(this.queueDir, {
            recursive: true,
        });
        this.healthCheck();
    }
    async ping() {
        try {
            const res = await fetch(this.pingUrl, {
                headers: { Authorization: `Bearer ${this.auth}` },
            });
            return res.ok;
        }
        catch {
            return false;
        }
    }
    healthCheck() {
        const run = async () => {
            if (this.status !== "online")
                this.status = "pinging";
            const isHealthy = await this.ping();
            if (isHealthy) {
                const wasDown = this.status !== "online";
                this.status = "online";
                if (wasDown) {
                    if (this.lastPing)
                        logger_1.default.debug(`Service ${this.name} is back online after ${(0, duration_1.formatDuration)(new Date().getTime() - this.lastPing.getTime())}`);
                    else
                        logger_1.default.debug(`Service ${this.name} is online`);
                    this.flushQueue();
                }
                this.lastPing = new Date();
            }
            else {
                if (this.status === "online")
                    logger_1.default.debug(`Service ${this.name} has just gone down`);
                this.status = "unreachable";
            }
        };
        run();
        setInterval(() => {
            run();
        }, this.pingInterval * 1000);
    }
    enqueue(task) {
        const id = this.nextTaskId();
        const file = path_1.default.join(this.queueDir, `${id}.json`);
        (0, fs_1.writeFileSync)(file, JSON.stringify(task), "utf8");
    }
    nextTaskId() {
        const files = (0, fs_1.readdirSync)(this.queueDir);
        const ids = files.map((f) => Number(f.replace(".json", ""))).filter((n) => !Number.isNaN(n));
        const next = (ids.length ? Math.max(...ids) : 0) + 1;
        return String(next).padStart(8, "0");
    }
    async execute(task) {
        const res = await fetch(`${this.baseUrl}/${task.path}`, {
            method: task.method,
            headers: {
                Authorization: `Bearer ${task.authentication ?? this.auth}`,
                ...(task.method === "POST" && {
                    "Content-Type": "application/json",
                }),
            },
            ...(task.method === "POST" && {
                body: JSON.stringify(task.body),
            }),
        });
        if (!res.ok) {
            throw new Error(`Request failed (${res.status})`);
        }
    }
    async flushQueue() {
        if (this.flushing)
            return;
        this.flushing = true;
        const files = (0, fs_1.readdirSync)(this.queueDir)
            .filter((f) => f.endsWith(".json"))
            .sort();
        for (const file of files) {
            if (this.status !== "online")
                break;
            const filePath = path_1.default.join(this.queueDir, file);
            const raw = (0, fs_1.readFileSync)(filePath, "utf8");
            const task = JSON.parse(raw);
            try {
                await this.execute(task);
                (0, fs_1.unlinkSync)(filePath);
            }
            catch {
                this.status = "unreachable";
                break;
            }
        }
        this.flushing = false;
        logger_1.default.debug(`Finished flush on service ${this.name}`);
    }
    async run(task) {
        if (this.status !== "online") {
            this.enqueue(task);
            return;
        }
        try {
            await this.execute(task);
        }
        catch {
            this.status = "unreachable";
            this.enqueue(task);
        }
    }
}
exports.default = Service;
//# sourceMappingURL=/src/services/index.js.map