"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5df49fa1-b9dd-5e7b-bdb1-43a8b282583e")}catch(e){}}();

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
//# debugId=5df49fa1-b9dd-5e7b-bdb1-43a8b282583e
