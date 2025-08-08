"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskScheduler = void 0;
const duration_1 = require("./formatters/duration");
const logger_1 = __importDefault(require("./logger"));
const redis_1 = __importDefault(require("./redis"));
class TaskScheduler {
    constructor() {
        this.tasks = new Map();
        this.taskRegistry = new Map();
        this.processingBacklog = false;
        this.redis = redis_1.default;
    }
    /** Register a named task function */
    registerTaskFunction(key, fn) {
        this.taskRegistry.set(key, fn);
    }
    /** Schedule a task by function key with optional params and delay */
    async scheduleTask(functionKey, params, delayMs, taskId) {
        if (!this.taskRegistry.has(functionKey)) {
            throw new Error(`No registered task function for key "${functionKey}"`);
        }
        taskId = taskId || this._generateTaskId();
        const runAt = Date.now() + delayMs;
        const taskData = { runAt, functionKey, params };
        await this.redis.hset("scheduled_tasks", taskId, JSON.stringify(taskData));
        const timeoutId = setTimeout(async () => {
            await this._runTask(taskId, functionKey, params);
        }, delayMs);
        this.tasks.set(taskId, { runAt, timeoutId, functionKey, params });
        return taskId;
    }
    /** Remove a scheduled task */
    async removeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task) {
            clearTimeout(task.timeoutId);
            this.tasks.delete(taskId);
            await this.redis.hdel("scheduled_tasks", taskId);
            return true;
        }
        const removed = await this.redis.hdel("scheduled_tasks", taskId);
        return removed > 0;
    }
    async taskExists(taskId, returnTask = false) {
        // Check in-memory tasks first
        const inMemoryTask = this.tasks.get(taskId);
        if (inMemoryTask) {
            return returnTask
                ? {
                    taskId,
                    runAt: inMemoryTask.runAt,
                    functionKey: inMemoryTask.functionKey,
                    params: inMemoryTask.params,
                }
                : true;
        }
        // Check Redis if not found in memory
        const taskData = await this.redis.hget("scheduled_tasks", taskId);
        if (taskData) {
            try {
                const parsed = JSON.parse(taskData);
                return returnTask ? { taskId, ...parsed } : true;
            }
            catch {
                return returnTask ? null : false;
            }
        }
        return returnTask ? null : false;
    }
    /** List all tasks */
    async listTasks() {
        const all = await this.redis.hgetall("scheduled_tasks");
        return Object.entries(all).map(([taskId, data]) => {
            try {
                const parsed = JSON.parse(data);
                return { taskId, ...parsed };
            }
            catch {
                return { taskId, runAt: 0, functionKey: "", params: undefined };
            }
        });
    }
    /** Load tasks from Redis and run expired ones with a queue delay */
    async loadAndProcessBacklog(queueDelayMs = 500) {
        if (this.processingBacklog)
            return;
        this.processingBacklog = true;
        const start = Date.now();
        logger_1.default.info("Starting to process backlog tasks...");
        const allTasks = await this.listTasks();
        const now = Date.now();
        for (const task of allTasks) {
            const fn = this.taskRegistry.get(task.functionKey);
            if (!fn) {
                logger_1.default.debug(`No registered function for task ${task.taskId} with key ${task.functionKey}. Removing task.`);
                await this.redis.hdel("scheduled_tasks", task.taskId);
                continue;
            }
            const delay = task.runAt - now;
            if (delay <= 0) {
                // Task expired — run immediately with queue delay
                await this._runTask(task.taskId, task.functionKey, task.params);
                await this._delay(queueDelayMs);
            }
            else {
                // Task in the future — reschedule with timeout
                const timeoutId = setTimeout(async () => {
                    await this._runTask(task.taskId, task.functionKey, task.params);
                }, delay);
                this.tasks.set(task.taskId, {
                    runAt: task.runAt,
                    timeoutId,
                    functionKey: task.functionKey,
                    params: task.params,
                });
            }
        }
        const elapsed = Date.now() - start;
        logger_1.default.info(`Finished processing backlog tasks in ${(0, duration_1.formatDuration)(elapsed)}`);
        this.processingBacklog = false;
    }
    /** Internal: run the task and cleanup */
    async _runTask(taskId, functionKey, params) {
        try {
            const fn = this.taskRegistry.get(functionKey);
            if (!fn)
                throw new Error(`Function "${functionKey}" not registered`);
            await fn(params);
        }
        catch (err) {
            logger_1.default.error(`Error running task ${taskId}`, err);
        }
        this.tasks.delete(taskId);
        await this.redis.hdel("scheduled_tasks", taskId);
    }
    /** Simple delay helper */
    _delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /** Generate random ID */
    _generateTaskId() {
        return `task_${Math.random().toString(36).slice(2, 10)}`;
    }
}
exports.TaskScheduler = TaskScheduler;
//# sourceMappingURL=/src/utils/Scheduler.js.map