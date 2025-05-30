import { ulid } from "ulid";

export function generateId(prefix: string): string {
  return `${prefix}_${ulid()}`;
}
