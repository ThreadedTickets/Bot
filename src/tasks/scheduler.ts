import cron from "node-cron";
import { Client } from "discord.js";
import { logger } from "../utils/logger";

type Task = {
  name: string;
  schedule?: string; // e.g., '*/5 * * * *'
  intervalMs?: number;
  run: (client: Client) => Promise<void> | void;
};

const tasks: Task[] = [];

export const registerTask = (task: Task) => tasks.push(task);

export const startTasks = (client: Client) => {
  for (const task of tasks) {
    if (task.schedule) {
      cron.schedule(task.schedule, () => task.run(client));
      logger("Scheduler", "Info", `Task ${task.name} set to run on schedule ${task.schedule}`);
    } else if (task.intervalMs) {
      setInterval(() => task.run(client), task.intervalMs);
      logger("Scheduler", "Info", `Task ${task.name} set to run every ${task.intervalMs}ms`);
    }
  }
};
