import axios from "axios";
import { CommandPermission } from "../../../constants/permissions";
import { PrefixCommand } from "../../../types/Command";
import { getAxiosErrorMessage } from "../../../utils/getAxiosError";
import { postToWebhook } from "../../../utils/message/webhookPoster";
import { WebhookTypes } from "../../../constants/webhooks";

const API_URL = process.env["THREADED_API_URL"];
const API_TOKEN = process.env["THREADED_API_TOKEN"];

const command: PrefixCommand<{
  action: "add" | "remove" | "get" | "history";
  id: string;
  type: "server" | "user";
  reason: string;
}> = {
  name: "blacklist",
  aliases: ["bl"],
  permissionLevel: CommandPermission.Admin,
  usage:
    "<action:(add|remove|get|history)> <id> <type{action === 'add'}:(server|user)> [reason{action === 'add'}=No reason provided+]",
  async execute(client, data, message, args) {
    if (args.action === "add") {
      const progressMessage = await message.reply({
        content: "Blacklisting.....",
      });

      try {
        const req = await axios.post(
          `${API_URL}/api/blacklist/add`,
          {
            id: args.id,
            type: args.type,
            reason: args.reason,
            addedBy: message.author.id,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (req.status === 200) {
          progressMessage.edit({
            content: `[${args.type}] ${args.id} added to blacklist for ${args.reason}`,
          });
          postToWebhook(WebhookTypes.BlacklistLog, {
            content: `**[${args.type}]** *\`${args.id}\`* added to blacklist by *\`${message.author.id}\`* for ***\`${args.reason}\`***`,
            avatar_url: client.user?.avatarURL()!,
            username: client.user?.username,
          });
        } else
          progressMessage.edit({
            content: `Action failed: ${req.data?.message}`,
          });
      } catch (error) {
        progressMessage.edit({
          content: `Action failed: ${getAxiosErrorMessage(error)}`,
        });
      }
    } else if (args.action === "get") {
      const progressMessage = await message.reply({
        content: "Fetching.....",
      });

      try {
        const req = await axios.get(
          `${API_URL}/api/blacklist/get?id=${args.id}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (req.status === 200)
          progressMessage.edit({
            content: req.data
              ? `**[${req.data.type}]** *\`${
                  req.data.id
                }\`* has an active blacklist added by *\`${
                  req.data.addedBy
                }\`* on <t:${Math.round(
                  new Date(req.data.createdAt).getTime() / 1000
                )}:F> for ***\`${req.data.reason}\`***`
              : "There is no active blacklist for this ID",
          });
        else
          progressMessage.edit({
            content: `Action failed: ${req.data?.message}`,
          });
      } catch (error) {
        progressMessage.edit({
          content: `Action failed: ${getAxiosErrorMessage(error)}`,
        });
      }
    } else if (args.action === "history") {
      const progressMessage = await message.reply({
        content: "Fetching.....",
      });

      try {
        const req = await axios.get(
          `${API_URL}/api/blacklist/history?id=${args.id}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (req.status === 200)
          progressMessage.edit({
            content: req.data.length
              ? `**[${req.data[0].type}]** *\`${req.data[0].id}\`* blacklist history:\n` +
                req.data
                  .reverse()
                  .map(
                    (
                      d: {
                        type: "server" | "user";
                        id: string;
                        reason: string;
                        addedBy: string;
                        createdAt: Date;
                        deactivatedAt: Date | null;
                      },
                      i: number
                    ) =>
                      `${i + 1}. ${
                        d.deactivatedAt
                          ? `*[Deactivated <t:${Math.round(
                              new Date(d.deactivatedAt).getTime() / 1000
                            )}:f>]* `
                          : ""
                      }Blacklist added by *\`${d.addedBy}\`* on <t:${Math.round(
                        new Date(d.createdAt).getTime() / 1000
                      )}:f> for ***\`${d.reason}\`***`
                  )
                  .join("\n")
              : "There is no blacklist history for this ID",
          });
        else
          progressMessage.edit({
            content: `Action failed: ${req.data?.message}`,
          });
      } catch (error) {
        progressMessage.edit({
          content: `Action failed: ${getAxiosErrorMessage(error)}`,
        });
      }
    } else if (args.action === "remove") {
      const progressMessage = await message.reply({
        content: "Un-blacklisting.....",
      });

      try {
        const req = await axios.delete(
          `${API_URL}/api/blacklist/delete?id=${args.id}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (req.status === 200) {
          progressMessage.edit({
            content: `${args.id} removed from blacklist`,
          });
          postToWebhook(WebhookTypes.BlacklistLog, {
            content: `**\`${args.id}\`** removed from blacklist by *\`${message.author.id}\`*`,
            avatar_url: client.user?.avatarURL()!,
            username: client.user?.username,
          });
        } else
          progressMessage.edit({
            content: `Action failed: ${req.data?.message}`,
          });
      } catch (error) {
        progressMessage.edit({
          content: `Action failed: ${getAxiosErrorMessage(error)}`,
        });
      }
    }
  },
};

export default command;
