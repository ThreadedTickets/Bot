"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3bfca34d-7f73-5dce-9f50-cc38ef7bb457")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFilesRecursively = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const loadFilesRecursively = (dir) => {
    let files = [];
    for (const file of fs_1.default.readdirSync(dir)) {
        const fullPath = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            files = files.concat((0, exports.loadFilesRecursively)(fullPath));
        }
        else if (file.endsWith(".ts") || file.endsWith(".js")) {
            files.push(fullPath);
        }
    }
    return files;
};
exports.loadFilesRecursively = loadFilesRecursively;
//# sourceMappingURL=load.js.map
//# debugId=3bfca34d-7f73-5dce-9f50-cc38ef7bb457
