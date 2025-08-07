"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1df1d878-b5e4-5e82-a782-a1b4d4adffd4")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../logger"));
const index_1 = require("../index");
(0, index_1.registerHook)("TestEvent", async (message) => {
    logger_1.default.info(`Message: ${message}`);
});
//# sourceMappingURL=testEvent.js.map
//# debugId=1df1d878-b5e4-5e82-a782-a1b4d4adffd4
