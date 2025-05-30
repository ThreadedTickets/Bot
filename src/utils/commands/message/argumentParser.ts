import { ArgSpec, ArgType } from "../../../types/Command";

const parseUsage = (usage: string): ArgSpec[] => {
  const regex = /(\[|<)([^\]<>\[\]:+={}]+)(?:\{([^}]+)\})?(?:=(.*?))?(?:<(\w+)>)?(?::\(([^)]+)\))?(\+)?(\]|>)/g;

  const args: ArgSpec[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(usage)) !== null) {
    const [_, open, name, condition, defaultValue, type = "string", choices, rest, close] = match;

    args.push({
      name,
      type: type as ArgType,
      optional: open === "[",
      choices: choices ? choices.split("|") : undefined,
      rest: !!rest,
      condition,
      default: defaultValue,
    });
  }

  return args;
};

// Function to parse the input arguments based on the command usage
export const parseArgs = (usage: string, input: string): { args: Record<string, any>; error?: string; code?: number; context?: any } => {
  const specs = parseUsage(usage);
  const tokens = input.trim().split(/ +/);
  const result: Record<string, any> = {};

  let index = 0;

  const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
    try {
      return new Function("context", `with (context) { return ${condition}; }`)(context);
    } catch {
      return false;
    }
  };

  for (const spec of specs) {
    const shouldInclude = spec.condition ? evaluateCondition(spec.condition, result) : true;

    if (!shouldInclude) continue;

    const token = tokens[index];

    if (token === undefined || token === "") {
      if (spec.default !== undefined) {
        result[spec.name] = spec.type === "number" ? Number(spec.default) : spec.default;
        continue;
      }

      if (!spec.optional) {
        return {
          args: result,
          code: 0,
          error: `Missing required argument`,
          context: { missing: spec.name },
        };
      }

      continue;
    }

    const raw = spec.rest ? tokens.slice(index).join(" ") : token;
    let value: any = raw;

    if (spec.type === "number") {
      value = Number(raw);
      if (isNaN(value)) {
        return {
          args: result,
          code: 1,
          error: `Invalid type`,
          context: { arg: spec.name, expected: "number", received: raw },
        };
      }
    }

    if (spec.type === "boolean") {
      value = raw.toLowerCase();
      if (value === "0") value = false;
      else if (value === "1") value = true;
      else if (value === "n") value = false;
      else if (value === "y") value = true;
      else if (value === "no") value = false;
      else if (value === "yes") value = true;
      else if (value === "f") value = false;
      else if (value === "t") value = true;
      else if (value === "false") value = false;
      else if (value === "t") value = true;

      if (typeof value !== "boolean")
        return {
          args: result,
          code: 1,
          error: `Invalid type`,
          context: { arg: spec.name, expected: "boolean", received: raw },
        };
    }

    if (spec.choices && !spec.choices.includes(String(value))) {
      return {
        args: result,
        code: 2,
        error: `Invalid choice`,
        context: { arg: spec.name, received: value, options: spec.choices },
      };
    }

    result[spec.name] = value;
    index += spec.rest ? tokens.length : 1;
  }

  if (index > 0 && index < tokens.length) {
    return {
      args: result,
      code: 3,
      error: `Too many arguments`,
      context: { extra: tokens.slice(index), received: tokens.length, expected: index },
    };
  }

  return { args: result };
};
