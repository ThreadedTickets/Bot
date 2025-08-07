"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="fd66201e-1c16-5c02-bfd4-1fd41689afb0")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLanguages = loadLanguages;
exports.t = t;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../utils/logger"));
const languages = {};
// Load all language files into memory
function loadLanguages() {
    const langDir = path_1.default.join(__dirname);
    const locales = fs_1.default.readdirSync(langDir, { withFileTypes: true });
    for (const locale of locales) {
        if (!locale.isDirectory())
            continue;
        const messagesPath = path_1.default.join(langDir, locale.name, "messages.js");
        if (!fs_1.default.existsSync(messagesPath))
            continue;
        languages[locale.name] = require(messagesPath).lang;
        logger_1.default.info(`Loaded locale ${locale.name}`);
    }
}
// Get a localized string with placeholder replacement
function t(locale, key, variables = {}) {
    const messages = languages[locale] || languages["en"];
    let template = messages[key] || key;
    for (const [placeholder, value] of Object.entries(variables)) {
        const pattern = new RegExp(`{${placeholder}}`, "g");
        template = template.replace(pattern, String(value));
    }
    return template;
}
//# sourceMappingURL=index.js.map
//# debugId=fd66201e-1c16-5c02-bfd4-1fd41689afb0
