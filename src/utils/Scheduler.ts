import { formatDuration } from "./formatters/duration";
import redis from "./redis";

type Logger = (
  source: string,
  level: "Info" | "Warn" | "Error",
  message: string
) => void;
type TaskFunction = (params?: any) => Promise<void> | void;

interface StoredTask {
  runAt: number;
  functionKey: string;
  params?: any;
}

interface ScheduledTask {
  runAt: number;
  timeoutId: NodeJS.Timeout;
  functionKey: string;
  params?: any;
}

export class TaskScheduler {
  private redis;
  private tasks: Map<string, ScheduledTask> = new Map();
  private taskRegistry: Map<string, TaskFunction> = new Map();
  private processingBacklog = false;
  private logger: Logger;

  constructor(
    logger: Logger = (source, level, message) => {
      console.log(`[${source}] [${level}] ${message}`);
    }
  ) {
    this.redis = redis;
    this.logger = logger;
  }

  /** Register a named task function */
  registerTaskFunction(key: string, fn: TaskFunction) {
    this.taskRegistry.set(key, fn);
  }

  /** Schedule a task by function key with optional params and delay */
  async scheduleTask(
    functionKey: string,
    params: any,
    delayMs: number,
    taskId?: string
  ): Promise<string> {
    if (!this.taskRegistry.has(functionKey)) {
      throw new Error(`No registered task function for key "${functionKey}"`);
    }
    taskId = taskId || this._generateTaskId();
    const runAt = Date.now() + delayMs;

    const taskData: StoredTask = { runAt, functionKey, params };
    await this.redis.hset("scheduled_tasks", taskId, JSON.stringify(taskData));

    const timeoutId = setTimeout(async () => {
      await this._runTask(taskId, functionKey, params);
    }, delayMs);

    this.tasks.set(taskId, { runAt, timeoutId, functionKey, params });
    return taskId;
  }

  /** Remove a scheduled task */
  async removeTask(taskId: string): Promise<boolean> {
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

  /** List all tasks */
  async listTasks(): Promise<
    Array<{ taskId: string; runAt: number; functionKey: string; params?: any }>
  > {
    const all = await this.redis.hgetall("scheduled_tasks");
    return Object.entries(all).map(([taskId, data]) => {
      try {
        const parsed: StoredTask = JSON.parse(data as string);
        return { taskId, ...parsed };
      } catch {
        return { taskId, runAt: 0, functionKey: "", params: undefined };
      }
    });
  }

  /** Load tasks from Redis and run expired ones with a queue delay */
  async loadAndProcessBacklog(queueDelayMs = 500): Promise<void> {
    if (this.processingBacklog) return;
    this.processingBacklog = true;

    const start = Date.now();
    this.logger("System", "Info", "Starting to process backlog tasks...");

    const allTasks = await this.listTasks();
    const now = Date.now();

    for (const task of allTasks) {
      const fn = this.taskRegistry.get(task.functionKey);
      if (!fn) {
        this.logger(
          "System",
          "Info",
          `No registered function for task ${task.taskId} with key ${task.functionKey}. Removing task.`
        );
        await this.redis.hdel("scheduled_tasks", task.taskId);
        continue;
      }

      const delay = task.runAt - now;

      if (delay <= 0) {
        // Task expired — run immediately with queue delay
        await this._runTask(task.taskId, task.functionKey, task.params);
        await this._delay(queueDelayMs);
      } else {
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
    this.logger(
      "System",
      "Info",
      `Finished processing backlog tasks in ${formatDuration(elapsed)}`
    );
    this.processingBacklog = false;
  }

  /** Internal: run the task and cleanup */
  private async _runTask(
    taskId: string,
    functionKey: string,
    params?: any
  ): Promise<void> {
    try {
      const fn = this.taskRegistry.get(functionKey);
      if (!fn) throw new Error(`Function "${functionKey}" not registered`);

      await fn(params);
    } catch (err: any) {
      this.logger(
        "System",
        "Info",
        `Error running task ${taskId}: ${err.message ?? err}`
      );
    }
    this.tasks.delete(taskId);
    await this.redis.hdel("scheduled_tasks", taskId);
  }

  /** Simple delay helper */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Generate random ID */
  private _generateTaskId(): string {
    return `task_${Math.random().toString(36).slice(2, 10)}`;
  }
}
