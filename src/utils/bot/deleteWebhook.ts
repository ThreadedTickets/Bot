import { WebhookClient } from "discord.js";
import { logger } from "../logger";

export async function deleteWebhookByUrl(webhookUrl: string): Promise<void> {
  try {
    // Extract ID and token from the URL
    const match = webhookUrl.match(/\/webhooks\/(\d+)\/([\w-]+)/);
    if (!match) throw new Error("Invalid webhook URL format");

    const [, id, token] = match;
    const webhook = new WebhookClient({ id, token });

    await webhook.delete();
    logger("Webhooks", "Info", `Deleted logging webhook ${id}`)
  } catch (error) {
    logger("Webhooks", "Error", `Failed to delete logging webhook: ${error}`)
  }
}
