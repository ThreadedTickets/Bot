import { logger } from "../logger";

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);

  return parts.join(" ");
}

export function parseDurationToMs(
  input: string,
  throwOnInvalid: boolean = false
) {
  if (!input || typeof input !== "string") {
    logger(
      "Parse Duration MS",
      "Warn",
      `Invalid input, returned 0ms: ${input}`
    );
    return 0;
  }

  // Define units and their corresponding ms values + synonyms
  const units = {
    ms: ["ms", "msec", "msecs", "millisecond", "milliseconds"],
    s: ["s", "sec", "secs", "second", "seconds"],
    m: ["m", "min", "mins", "minute", "minutes"],
    h: ["h", "hr", "hrs", "hour", "hours"],
    d: ["d", "day", "days"],
    w: ["w", "week", "weeks"],
    M: ["M", "month", "months"],
    y: ["y", "yr", "yrs", "year", "years"],
  };

  // Map all synonyms to their multiplier in ms
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000, // Approximate month
    y: 365 * 24 * 60 * 60 * 1000, // Approximate year
  };

  // Build a regex pattern for matching number + unit, capturing numbers and units
  // It allows decimal numbers, spaces optional between number and unit
  const unitPatterns = Object.values(units)
    .flat()
    .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // escape regex chars
    .join("|");

  const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitPatterns})`, "gi");

  let totalMs = 0;
  let matched = false;

  let match;
  while ((match = regex.exec(input)) !== null) {
    matched = true;
    const value = parseFloat(match[1]);
    const unitStr = match[2].toLowerCase();

    // Find which multiplier applies
    let multiplier = null;
    for (const [key, synonyms] of Object.entries(units)) {
      if (synonyms.includes(unitStr)) {
        multiplier = multipliers[key as keyof typeof units];
        break;
      }
    }

    if (multiplier === null) {
      throw new Error(`Unknown time unit: ${unitStr}`);
    }

    totalMs += value * multiplier;
  }

  if (!matched && throwOnInvalid) {
    throw new Error(`Invalid duration string: "${input}"`);
  }

  return totalMs;
}
