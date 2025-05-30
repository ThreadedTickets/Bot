import fs from "fs";
import path from "path";

export const loadHandlersRecursively = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return loadHandlersRecursively(fullPath);
    if (entry.isFile() && fullPath.endsWith(".js")) return [fullPath];
    return [];
  });
};
