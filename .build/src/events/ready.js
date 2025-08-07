"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e5498191-1ac7-5570-a83b-8ca1040e6c50")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "ready",
    execute(client) {
        logger_1.default.info(`${client.user?.username} is running`);
    },
};
exports.default = event;
//# sourceMappingURL=ready.js.map
//# debugId=e5498191-1ac7-5570-a83b-8ca1040e6c50
