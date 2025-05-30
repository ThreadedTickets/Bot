class AsyncQueue {
  private queue: (() => void)[] = [];
  private pending = false;

  async wait(): Promise<void> {
    if (!this.pending) {
      this.pending = true;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  next(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    } else {
      this.pending = false;
    }
  }

  async wrap<T>(fn: () => Promise<T>): Promise<T> {
    await this.wait();
    try {
      return await fn();
    } finally {
      this.next();
    }
  }
}

export class AsyncQueueManager {
  private queues = new Map<string, AsyncQueue>();
  private globalQueue = new AsyncQueue();

  /**
   * Run a function in a queue, scoped by guild ID. If no guildId is provided, uses global queue.
   */
  async wrap<T>(fn: () => Promise<T>, guildId?: string): Promise<T> {
    const queue = guildId ? this.getQueue(guildId) : this.globalQueue;
    return queue.wrap(fn);
  }

  /**
   * Get or create a queue for a specific guild.
   */
  private getQueue(guildId: string): AsyncQueue {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, new AsyncQueue());
    }
    return this.queues.get(guildId)!;
  }

  /**
   * Optionally clear a queue (e.g., if guild is deleted).
   */
  clear(guildId: string) {
    this.queues.delete(guildId);
  }
}
