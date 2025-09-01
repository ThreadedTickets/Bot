import config from "../../config";
import redis from "../redis";

export class TicketChannelManager {
  private key = `${config.redis.prefix}tickets:channels`; // Redis set key for storing all ticket channel IDs
  private prefix = `${config.redis.prefix}tickets:channel:`; // Prefix for channel-specific keys
  private redis;

  constructor() {
    this.redis = redis;
  }

  /**
   * Adds a ticket channel to Redis.
   */
  async add(
    channelId: string,
    ticketId: string,
    takeTranscript: boolean,
    anonymise: boolean,
    allowAutoresponders: boolean,
    owner: string
  ): Promise<void> {
    await this.redis.sadd(this.key, channelId);
    await this.redis.set(
      `${this.prefix}${channelId}`,
      JSON.stringify({
        ticketId,
        takeTranscript,
        anonymise,
        allowAutoresponders,
        owner,
      })
    );
  }

  /**
   * Removes a ticket channel from Redis.
   */
  async remove(channelId: string): Promise<void> {
    await this.redis.srem(this.key, channelId);
    await this.redis.del(`${this.prefix}${channelId}`);
  }

  /**
   * Checks if a channel is a managed ticket channel.
   */
  async isTicketChannel(channelId: string): Promise<boolean> {
    return (await this.redis.sismember(this.key, channelId)) === 1;
  }

  /**
   * Returns the ticket ID for a given channel ID, or null if not found.
   */
  async getTicketId(channelId: string): Promise<string | null> {
    const data = await this.redis.get(`${this.prefix}${channelId}`);
    return data ? JSON.parse(data).ticketId : null;
  }

  async getTicket(channelId: string): Promise<{
    ticketId: string;
    takeTranscript: boolean;
    anonymise: boolean;
    allowAutoresponders: boolean;
    owner: string;
  } | null> {
    const data = await this.redis.get(`${this.prefix}${channelId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Gets all channel IDs currently tracked.
   */
  async getAllChannels(): Promise<string[]> {
    return await this.redis.smembers(this.key);
  }
}
