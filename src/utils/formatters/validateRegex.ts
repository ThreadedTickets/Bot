import RandExp from "randexp";
import RE2 from "re2";
import safe from "safe-regex";
import { logger } from "../logger";
import { onError } from "../onError";

export function validateUserRegex(pattern: string): {
  valid: boolean;
  reason?: string;
} {
  if (pattern.length > 300)
    return { valid: false, reason: "Regex pattern is too long" };

  if (!safe(pattern, { limit: 10 }))
    return { valid: false, reason: "Regex pattern is potentially unsafe" };

  try {
    new RE2(pattern);
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: "Invalid Regex" };
  }
}

export function generateExampleRegex(regexStr: string): string | null {
  if (!safe(regexStr)) return null;
  try {
    const regex = new RE2(regexStr); // will throw if invalid
    const randexp = new RandExp(new RegExp(regexStr));
    return randexp.gen();
  } catch (err: any) {
    logger("System", "Warn", `Error when generating example regex: ${err}`);
    onError("System", `Error generating example regex: ${err}`, {
      stack: err.stack,
      regexStr,
    });
    return null;
  }
}
