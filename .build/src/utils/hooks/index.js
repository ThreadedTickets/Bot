"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a4121dae-87ae-5429-95fe-d0dece66e204")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHook = registerHook;
exports.runHooks = runHooks;
const onError_1 = require("../onError");
const logger_1 = __importDefault(require("../logger"));
const hookRegistry = {};
/**
 * Register a hook for an event, with an optional priority.
 * Higher priority hooks run before lower ones.
 *
 * @param event - the hook event name
 * @param handler - the callback
 * @param priority - hook priority (default 0). Higher priorities are run first
 */
function registerHook(event, handler, priority = 0) {
    if (!hookRegistry[event])
        hookRegistry[event] = [];
    hookRegistry[event].push({ handler, priority });
}
/**
 * Run all hooks for an event, sorted by descending priority.
 */
async function runHooks(event, data) {
    const list = hookRegistry[event];
    if (!list || list.length === 0)
        return;
    // sort by priority DESC
    const sorted = list
        .slice() // copy
        .sort((a, b) => b.priority - a.priority);
    for (const { handler } of sorted) {
        try {
            await handler(data);
        }
        catch (err) {
            logger_1.default.error(`Error with hook ${event}`, err);
            (0, onError_1.onError)(err, { event: event, data: data });
        }
    }
}
//# sourceMappingURL=/src/utils/hooks/index.js.map
//# debugId=a4121dae-87ae-5429-95fe-d0dece66e204
