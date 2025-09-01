import { ulid } from "ulid";
import logger from "../logger";

export function generateId(prefix: string): string {
  const id = `${prefix}_${ulid()}`;
  logger.debug(`Generated ID: ${id}`);
  return id;
}
