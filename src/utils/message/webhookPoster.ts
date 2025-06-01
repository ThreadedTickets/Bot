import axios from "axios";
import { WebhookTypes, webhookUrls } from "../../constants/webhooks";
import { WebhookContent } from "../../types/WebhookContent";
import { logger } from "../logger";

export const postToWebhook = async (
  type: WebhookTypes,
  content: WebhookContent
) => {
  const url = webhookUrls[type];
  if (!url) throw new Error(`Webhook URL not configured for type: ${type}`);

  axios
    .post(url, content)
    .catch((err) => {
      return logger(
        "Webhooks",
        "Error",
        `Something went wrong posting webhook ${type}: ${err}`
      );
    })
    .finally(() => logger("Webhooks", "Info", `Posted to webhook ${type}`));
};
