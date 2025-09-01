"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b6b78bc8-f97f-5c6e-9479-ee054a476808")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../logger"));
const index_1 = require("../index");
(0, index_1.registerHook)("TestEvent", async (message) => {
    logger_1.default.info(`Message: ${message}`);
});
//# sourceMappingURL=/src/utils/hooks/events/testEvent.js.map
//# debugId=b6b78bc8-f97f-5c6e-9479-ee054a476808
