"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHandlersRecursively = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadHandlersRecursively = (dir) => {
    const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const fullPath = path_1.default.join(dir, entry.name);
        if (entry.isDirectory())
            return (0, exports.loadHandlersRecursively)(fullPath);
        if (entry.isFile() && fullPath.endsWith(".js"))
            return [fullPath];
        return [];
    });
};
exports.loadHandlersRecursively = loadHandlersRecursively;
//# sourceMappingURL=/src/handlers/loadHandlers.js.map