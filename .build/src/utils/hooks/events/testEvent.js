"use strict";
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