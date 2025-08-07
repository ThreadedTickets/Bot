"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="abf1376b-1d0d-5001-a191-28330a84b9a2")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncQueueManager = void 0;
class AsyncQueue {
    constructor() {
        this.queue = [];
        this.pending = false;
    }
    async wait() {
        if (!this.pending) {
            this.pending = true;
            return;
        }
        return new Promise((resolve) => {
            this.queue.push(resolve);
        });
    }
    next() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next?.();
        }
        else {
            this.pending = false;
        }
    }
    async wrap(fn) {
        await this.wait();
        try {
            return await fn();
        }
        finally {
            this.next();
        }
    }
}
class AsyncQueueManager {
    constructor() {
        this.queues = new Map();
        this.globalQueue = new AsyncQueue();
    }
    /**
     * Run a function in a queue, scoped by guild ID. If no guildId is provided, uses global queue.
     */
    async wrap(fn, guildId) {
        const queue = guildId ? this.getQueue(guildId) : this.globalQueue;
        return queue.wrap(fn);
    }
    /**
     * Get or create a queue for a specific guild.
     */
    getQueue(guildId) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, new AsyncQueue());
        }
        return this.queues.get(guildId);
    }
    /**
     * Optionally clear a queue (e.g., if guild is deleted).
     */
    clear(guildId) {
        this.queues.delete(guildId);
    }
}
exports.AsyncQueueManager = AsyncQueueManager;
//# sourceMappingURL=QueueManager.js.map
//# debugId=abf1376b-1d0d-5001-a191-28330a84b9a2
