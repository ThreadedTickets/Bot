"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const status_1 = __importDefault(require("../status"));
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "ready",
    execute(client) {
        logger_1.default.info(`${client.user?.username} is running`);
        (0, status_1.default)(client);
    },
};
exports.default = event;
//# sourceMappingURL=/src/events/ready.js.map