"use strict";
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
async function loadLanguages() {
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
    return true;
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
//# sourceMappingURL=/src/lang/index.js.map