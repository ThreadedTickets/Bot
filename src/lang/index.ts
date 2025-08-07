import path from "path";
import fs from "fs";
import logger from "../utils/logger";

// Type-safe language cache
type Messages = Record<string, string>;
const languages: Record<string, Messages> = {};

// Load all language files into memory
export function loadLanguages() {
  const langDir = path.join(__dirname);
  const locales = fs.readdirSync(langDir, { withFileTypes: true });

  for (const locale of locales) {
    if (!locale.isDirectory()) continue;

    const messagesPath = path.join(langDir, locale.name, "messages.js");
    if (!fs.existsSync(messagesPath)) continue;

    languages[locale.name] = require(messagesPath).lang;
    logger.info(`Loaded locale ${locale.name}`);
  }
}

// Get a localized string with placeholder replacement
export function t(
  locale: string,
  key: string,
  variables: Record<string, string | number> = {}
): string {
  const messages = languages[locale] || languages["en"];
  let template = messages[key] || key;

  for (const [placeholder, value] of Object.entries(variables)) {
    const pattern = new RegExp(`{${placeholder}}`, "g");
    template = template.replace(pattern, String(value));
  }

  return template;
}
