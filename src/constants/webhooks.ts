export enum WebhookTypes {
  /**
   * For posting errors to Discord
   */
  ErrorLog,
  /**
   * For posting when someone votes for Threaded
   */
  VoteLog,
  BlacklistLog,
}

export const webhookUrls: Record<WebhookTypes, string> = {
  [WebhookTypes.ErrorLog]: process.env["LOGGING_DISCORD_WEBHOOK_ERRORS"]!,
  [WebhookTypes.VoteLog]: process.env["LOGGING_DISCORD_WEBHOOK_VOTES"]!,
  [WebhookTypes.BlacklistLog]:
    process.env["LOGGING_DISCORD_WEBHOOK_BLACKLISTS"]!,
};
