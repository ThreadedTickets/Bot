"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9d892ba6-e7dd-5c97-9c4f-3e69c53984d1")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRegex = validateUserRegex;
exports.generateExampleRegex = generateExampleRegex;
const randexp_1 = __importDefault(require("randexp"));
const re2_1 = __importDefault(require("re2"));
const safe_regex_1 = __importDefault(require("safe-regex"));
const onError_1 = require("../onError");
const logger_1 = __importDefault(require("../logger"));
function validateUserRegex(pattern) {
    if (pattern.length > 300)
        return { valid: false, reason: "Regex pattern is too long" };
    if (!(0, safe_regex_1.default)(pattern, { limit: 10 }))
        return { valid: false, reason: "Regex pattern is potentially unsafe" };
    try {
        new re2_1.default(pattern);
        return { valid: true };
    }
    catch (err) {
        return { valid: false, reason: "Invalid Regex" };
    }
}
function generateExampleRegex(regexStr) {
    if (!(0, safe_regex_1.default)(regexStr))
        return null;
    try {
        const regex = new re2_1.default(regexStr); // will throw if invalid
        const randexp = new randexp_1.default(new RegExp(regexStr));
        return randexp.gen();
    }
    catch (err) {
        logger_1.default.warn(`Error when generating example regex`, err);
        (0, onError_1.onError)(err, {
            stack: err.stack,
            regexStr,
        });
        return null;
    }
}
//# sourceMappingURL=validateRegex.js.map
//# debugId=9d892ba6-e7dd-5c97-9c4f-3e69c53984d1
