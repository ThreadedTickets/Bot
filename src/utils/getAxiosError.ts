import axios from "axios";

export function getAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
}
