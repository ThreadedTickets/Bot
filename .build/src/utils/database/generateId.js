"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="31f9fc44-560c-59df-9f9b-03faeb2fce11")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
const ulid_1 = require("ulid");
const logger_1 = __importDefault(require("../logger"));
function generateId(prefix) {
    const id = `${prefix}_${(0, ulid_1.ulid)()}`;
    logger_1.default.debug(`Generated ID: ${id}`);
    return id;
}
//# sourceMappingURL=generateId.js.map
//# debugId=31f9fc44-560c-59df-9f9b-03faeb2fce11
