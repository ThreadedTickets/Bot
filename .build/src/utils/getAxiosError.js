"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b21ced0a-5ec6-5724-a40a-732ca7972b4e")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxiosErrorMessage = getAxiosErrorMessage;
const axios_1 = __importDefault(require("axios"));
function getAxiosErrorMessage(error) {
    if (axios_1.default.isAxiosError(error)) {
        return error.response?.data?.message ?? error.message;
    }
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=getAxiosError.js.map
//# debugId=b21ced0a-5ec6-5724-a40a-732ca7972b4e
