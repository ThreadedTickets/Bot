import { logger } from "../../logger";

export const placeholderFunctions: Record<string, (...args: any[]) => string> =
  {
    upper: (val: string) => val.toUpperCase(),
    lower: (val: string) => val.toLowerCase(),
    formatDate: (iso: string) => new Date(iso).toLocaleDateString(),
  };

export function resolvePlaceholders(
  template: string,
  context: Record<string, any>
): string {
  return template.replace(/{\s*([^{}]+?)\s*}/g, (_, expression) => {
    let [rawExpr, fallback] = expression.split(/\s*\|\|\s*/);
    rawExpr = rawExpr.trim();
    fallback = fallback?.trim();

    // Handle function calls like upper(ticket.owner)
    const funcMatch = (rawExpr ?? "").match(/^(\w+)\(([^)]+)\)$/);
    if (funcMatch) {
      const [, funcName, argsRaw] = funcMatch;
      const args = argsRaw.split(",").map((arg: string) => {
        arg = arg.trim();
        return arg.split(".").reduce((obj, key) => obj?.[key], context) ?? arg;
      });

      const fn = placeholderFunctions[funcName];
      if (fn) {
        try {
          const result = fn(...args);
          return result ?? fallback ?? `{${expression}}`;
        } catch (err) {
          logger(
            "System",
            "Warn",
            `Error in placeholder function '${funcName}': ${err}`
          );
          return fallback ?? `{${expression}}`;
        }
      }

      return fallback ?? `{${expression}}`; // Unknown function
    }

    // Handle normal dot notation like ticket.id
    const value = rawExpr
      .split(".")
      .reduce(
        (obj: { [x: string]: any }, key: string | number) => obj?.[key],
        context
      );

    if (value !== undefined && value !== null) return String(value);
    if (fallback !== undefined) return fallback;

    return `{${expression}}`;
  });
}

function walkAndResolvePlaceholders(
  value: any,
  context: Record<string, any>
): any {
  if (typeof value === "string") {
    return resolvePlaceholders(value, context);
  } else if (Array.isArray(value)) {
    return value.map((v) => walkAndResolvePlaceholders(v, context));
  } else if (value && typeof value === "object") {
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = walkAndResolvePlaceholders(val, context);
    }
    return result;
  }
  return value; // Return unchanged if not string/array/object
}
export function resolveDiscordMessagePlaceholders(
  message: {
    content?: string;
    embeds?: any[];
    components?: any[];
    [key: string]: any;
  },
  context: Record<string, any>
): typeof message {
  return walkAndResolvePlaceholders(message, context);
}
