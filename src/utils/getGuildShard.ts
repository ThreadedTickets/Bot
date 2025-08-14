import { client } from "..";

export default function isGuildOnShard(guildId: string) {
  const shardIdFromId = Number(BigInt(guildId) >> 22n) % client.shard.count;

  if (shardIdFromId !== client.shard?.ids[0]) return false;
  return true;
}
