type CacheEntry<V> = {
  value: V;
  expiresAt?: number;
  createdAt: number;
};

interface InMemoryCacheOptions {
  /**
   * The default time to live for items in ms
   */
  defaultTTL?: number;
  /**
   * How often to run the cleanup function in ms
   */
  cleanupInterval?: number;
  groupLimits?: Record<string, number>; // e.g., { "A:": 10 }
}

export class InMemoryCache<K extends string, V> {
  private store = new Map<K, CacheEntry<V>>();
  private options: InMemoryCacheOptions;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: InMemoryCacheOptions = {}) {
    this.options = options;

    if (options.cleanupInterval) {
      this.cleanupTimer = setInterval(
        () => this.cleanup(),
        options.cleanupInterval
      );
    }
  }

  /** Add or update a value in the cache */
  set(key: K, value: V, ttlMs?: number) {
    const now = Date.now();

    // Handle group limits (e.g. keys starting with A:)
    for (const prefix in this.options.groupLimits ?? {}) {
      if (key.startsWith(prefix)) {
        this.enforceGroupLimit(prefix, this.options.groupLimits![prefix]);
        break;
      }
    }

    const expiresAt =
      ttlMs ?? this.options.defaultTTL
        ? now + (ttlMs ?? this.options.defaultTTL!)
        : undefined;

    this.store.set(key, { value, expiresAt, createdAt: now });
  }

  /** Get an item if it's not expired */
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return;
    }

    return entry.value;
  }

  /** Check if an item exists and is not expired */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /** Manually invalidate a key */
  invalidate(key: K) {
    this.store.delete(key);
  }

  /** Clear all keys */
  clear() {
    this.store.clear();
  }

  /** Return number of non-expired items */
  size(): number {
    this.cleanup();
    return this.store.size;
  }

  /** Clean up expired entries */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  /** Enforce prefix group limit (FIFO eviction of oldest) */
  private enforceGroupLimit(prefix: string, limit: number) {
    const matching = [...this.store.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .sort((a, b) => a[1].createdAt - b[1].createdAt); // oldest first

    while (matching.length >= limit) {
      const [oldestKey] = matching.shift()!;
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
