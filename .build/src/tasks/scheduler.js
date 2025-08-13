"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTasks = exports.registerTask = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("../utils/logger"));
const tasks = [];
const registerTask = (task) => tasks.push(task);
exports.registerTask = registerTask;
const startTasks = (client) => {
    for (const task of tasks) {
        if (task.schedule) {
            node_cron_1.default.schedule(task.schedule, () => task.run(client));
            logger_1.default.info(`Task ${task.name} set to run on schedule ${task.schedule}`);
        }
        else if (task.intervalMs) {
            setInterval(() => task.run(client), task.intervalMs);
            logger_1.default.info(`Task ${task.name} set to run every ${task.intervalMs}ms`);
        }
    }
};
exports.startTasks = startTasks;
//# sourceMappingURL=/src/tasks/scheduler.js.map