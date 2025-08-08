"use strict";
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
//# sourceMappingURL=/src/utils/database/generateId.js.map