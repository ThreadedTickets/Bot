"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="78c332db-b4cd-5d57-85ae-811395c8717d")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
class InMemoryCache {
    constructor(options = {}) {
        this.store = new Map();
        this.options = options;
        if (options.cleanupInterval) {
            this.cleanupTimer = setInterval(() => this.cleanup(), options.cleanupInterval);
        }
    }
    /** Add or update a value in the cache */
    set(key, value, ttlMs) {
        const now = Date.now();
        // Handle group limits (e.g. keys starting with A:)
        for (const prefix in this.options.groupLimits ?? {}) {
            if (key.startsWith(prefix)) {
                this.enforceGroupLimit(prefix, this.options.groupLimits[prefix]);
                break;
            }
        }
        const expiresAt = ttlMs ?? this.options.defaultTTL
            ? now + (ttlMs ?? this.options.defaultTTL)
            : undefined;
        this.store.set(key, { value, expiresAt, createdAt: now });
    }
    /** Get an item if it's not expired */
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return;
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return;
        }
        return entry.value;
    }
    /** Check if an item exists and is not expired */
    has(key) {
        return this.get(key) !== undefined;
    }
    /** Manually invalidate a key */
    invalidate(key) {
        this.store.delete(key);
    }
    /** Clear all keys */
    clear() {
        this.store.clear();
    }
    /** Return number of non-expired items */
    size() {
        this.cleanup();
        return this.store.size;
    }
    /** Clean up expired entries */
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.store.delete(key);
            }
        }
    }
    /** Enforce prefix group limit (FIFO eviction of oldest) */
    enforceGroupLimit(prefix, limit) {
        const matching = [...this.store.entries()]
            .filter(([key]) => key.startsWith(prefix))
            .sort((a, b) => a[1].createdAt - b[1].createdAt); // oldest first
        while (matching.length >= limit) {
            const [oldestKey] = matching.shift();
            this.store.delete(oldestKey);
        }
    }
    /** Stop cleanup timer if needed */
    dispose() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
    }
}
exports.InMemoryCache = InMemoryCache;
//# sourceMappingURL=InMemoryCache.js.map
//# debugId=78c332db-b4cd-5d57-85ae-811395c8717d
