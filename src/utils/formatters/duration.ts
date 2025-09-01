import logger from "../logger";

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
    logger.warn(`Invalid duration input, returned 60s: ${input}`);
    return 60 * 1000;
  }

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

  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  const unitPatterns = Object.values(units)
    .flat()
    .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${unitPatterns})`, "gi");

  let totalMs = 0;
  let matchedAny = false;

  let match;
  while ((match = regex.exec(input)) !== null) {
    matchedAny = true;
    const value = parseFloat(match[1]);
    const unitStr = match[2].toLowerCase();

    let multiplier = null;
    for (const [key, synonyms] of Object.entries(units)) {
      if (synonyms.includes(unitStr)) {
        multiplier = multipliers[key as keyof typeof units];
        break;
      }
    }

    if (multiplier === null) {
      logger.error(`Unknown time unit in parsing duration: ${unitStr}`);
      if (throwOnInvalid) throw new Error(`Unknown time unit: ${unitStr}`);
      continue;
    }

    const added = value * multiplier;
    totalMs += added;
  }

  // Look for bare numbers left after removing parsed patterns
  const stripped = input.replace(regex, "").trim();
  const bareNumberMatch = stripped.match(/^\d+(?:\.\d+)?$/);
  if (bareNumberMatch) {
    const fallbackValue = parseFloat(bareNumberMatch[0]);
    const fallbackMs = fallbackValue * multipliers.m;
    logger.debug(
      `Defaulted bare value "${fallbackValue}" to minutes = ${fallbackMs}ms when parsing duration`
    );
    totalMs += fallbackMs;
  } else if (!matchedAny) {
    logger.debug(
      `No valid duration parts found when parsing duration: "${input}"`
    );
    if (throwOnInvalid) throw new Error(`Invalid duration string: "${input}"`);
  }

  logger.debug(`Total duration parsed: ${totalMs}ms`);
  return totalMs;
}
