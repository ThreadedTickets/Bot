import { mkdir, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFile, writeFileSync } from "fs";
import path from "path";
import logger from "../utils/logger";
import { formatDuration } from "../utils/formatters/duration";

type Task =
  | {
      method: "POST";
      path: string;
      body: any;
      authentication?: string;
    }
  | {
      method: "GET";
      path: string;
      authentication?: string;
    }
  | {
      method: "DELETE";
      path: string;
      authentication?: string;
    };

export type ServiceOptions = {
  baseUrl: string;
  auth: string;
  ping: {
    path: string;
    interval?: number;
  };
  reporting?: {
    webhook?: string;
  };
};

/**
 * Services should only be used for things where it does not matter when values are returned
 */
export default class Service {
  public name: string;
  private pingUrl: string;
  private baseUrl: string;
  private auth: string;
  public lastPing: Date;
  public status: "online" | "unreachable" | "pinging" = "pinging";
  private queueDir: string;
  private flushing: boolean = false;

  /**
   * The ping interval in seconds
   */
  private pingInterval: number;

  constructor(name: string, options: ServiceOptions) {
    this.name = name;
    this.baseUrl = options.baseUrl;
    this.pingUrl = `${this.baseUrl}/${options.ping.path}`;
    this.auth = options.auth;
    this.pingInterval = options.ping.interval ?? 60;

    this.queueDir = path.join(process.cwd(), "service-queue", this.name);

    this.init();
  }

  private init() {
    mkdirSync(this.queueDir, {
      recursive: true,
    });

    this.healthCheck();
  }

  private async ping(): Promise<boolean> {
    try {
      const res = await fetch(this.pingUrl, {
        headers: { Authorization: `Bearer ${this.auth}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private healthCheck() {
    const run = async () => {
      if (this.status !== "online") this.status = "pinging";

      const isHealthy = await this.ping();

      if (isHealthy) {
        const wasDown = this.status !== "online";
        this.status = "online";

        if (wasDown) {
          if (this.lastPing)
            logger.debug(
              `Service ${this.name} is back online after ${formatDuration(
                new Date().getTime() - this.lastPing.getTime()
              )}`
            );
          else logger.debug(`Service ${this.name} is online`);
          this.flushQueue();
        }
        this.lastPing = new Date();
      } else {
        if (this.status === "online") logger.debug(`Service ${this.name} has just gone down`);
        this.status = "unreachable";
      }
    };

    run();
    setInterval(() => {
      run();
    }, this.pingInterval * 1000);
  }

  private enqueue(task: Task) {
    const id = this.nextTaskId();
    const file = path.join(this.queueDir, `${id}.json`);

    writeFileSync(file, JSON.stringify(task), "utf8");
  }

  private nextTaskId(): string {
    const files = readdirSync(this.queueDir);
    const ids = files.map((f) => Number(f.replace(".json", ""))).filter((n) => !Number.isNaN(n));

    const next = (ids.length ? Math.max(...ids) : 0) + 1;
    return String(next).padStart(8, "0");
  }

  private async execute(task: Task) {
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

  private async flushQueue() {
    if (this.flushing) return;
    this.flushing = true;

    const files = readdirSync(this.queueDir)
      .filter((f) => f.endsWith(".json"))
      .sort();

    for (const file of files) {
      if (this.status !== "online") break;

      const filePath = path.join(this.queueDir, file);
      const raw = readFileSync(filePath, "utf8");
      const task: Task = JSON.parse(raw);

      try {
        await this.execute(task);
        unlinkSync(filePath);
      } catch {
        this.status = "unreachable";
        break;
      }
    }

    this.flushing = false;
    logger.debug(`Finished flush on service ${this.name}`);
  }

  public async run(task: Task): Promise<void> {
    if (this.status !== "online") {
      this.enqueue(task);
      return;
    }

    try {
      await this.execute(task);
    } catch {
      this.status = "unreachable";
      this.enqueue(task);
    }
  }
}
