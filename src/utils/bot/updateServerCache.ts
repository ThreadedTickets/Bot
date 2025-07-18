import { Document } from "mongoose";
import { updateCachedData } from "../database/updateCache";
import { toTimeUnit } from "../formatters/toTimeUnit";

export const updateServerCache = async (
  serverId: string,
  document: Document
) => {
  await updateCachedData(
    `guilds:${serverId}`,
    toTimeUnit("seconds", 0, 30),
    document.toObject()
  );
};
