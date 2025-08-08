"use strict";
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
//# sourceMappingURL=/src/utils/getAxiosError.js.map