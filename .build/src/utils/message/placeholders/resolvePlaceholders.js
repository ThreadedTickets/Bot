"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7c47d89d-7299-5a9c-bdc3-d8a31998e909")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeholderFunctions = void 0;
exports.resolvePlaceholders = resolvePlaceholders;
exports.resolveDiscordMessagePlaceholders = resolveDiscordMessagePlaceholders;
const logger_1 = __importDefault(require("../../logger"));
exports.placeholderFunctions = {
    upper: (val) => val.toUpperCase(),
    lower: (val) => val.toLowerCase(),
    formatDate: (iso) => new Date(iso).toLocaleDateString(),
};
function resolvePlaceholders(template, context) {
    return template.replace(/{\s*([^{}]+?)\s*}/g, (_, expression) => {
        let [rawExpr, fallback] = expression.split(/\s*\|\|\s*/);
        rawExpr = rawExpr.trim() ?? "";
        fallback = fallback?.trim();
        // Handle function calls like upper(ticket.owner)
        const funcMatch = (rawExpr ?? "").match(/^(\w+)\(([^)]+)\)$/);
        if (funcMatch) {
            const [, funcName, argsRaw] = funcMatch;
            const args = argsRaw.split(",").map((arg) => {
                arg = arg.trim();
                return arg.split(".").reduce((obj, key) => obj?.[key], context) ?? arg;
            });
            const fn = exports.placeholderFunctions[funcName];
            if (fn) {
                try {
                    const result = fn(...args);
                    return result ?? fallback ?? `{${expression}}`;
                }
                catch (err) {
                    logger_1.default.warn(`Error in placeholder function '${funcName}'`, err);
                    return fallback ?? `{${expression}}`;
                }
            }
            return fallback ?? `{${expression}}`; // Unknown function
        }
        // Handle normal dot notation like ticket.id
        const value = rawExpr
            .split(".")
            .reduce((obj, key) => obj?.[key], context);
        if (value !== undefined && value !== null)
            return String(value);
        if (fallback !== undefined)
            return fallback;
        return `{${expression}}`;
    });
}
function walkAndResolvePlaceholders(value, context) {
    if (typeof value === "string") {
        return resolvePlaceholders(value, context);
    }
    else if (Array.isArray(value)) {
        return value.map((v) => walkAndResolvePlaceholders(v, context));
    }
    else if (value && typeof value === "object") {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = walkAndResolvePlaceholders(val, context);
        }
        return result;
    }
    return value; // Return unchanged if not string/array/object
}
function resolveDiscordMessagePlaceholders(message, context) {
    return walkAndResolvePlaceholders(message, context);
}
//# sourceMappingURL=/src/utils/message/placeholders/resolvePlaceholders.js.map
//# debugId=7c47d89d-7299-5a9c-bdc3-d8a31998e909
