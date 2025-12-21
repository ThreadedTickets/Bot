"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const permissions_1 = require("../../../constants/permissions");
const getAxiosError_1 = require("../../../utils/getAxiosError");
const webhookPoster_1 = require("../../../utils/message/webhookPoster");
const webhooks_1 = require("../../../constants/webhooks");
const API_URL = process.env["THREADED_API_URL"];
const API_TOKEN = process.env["THREADED_API_TOKEN"];
const command = {
    name: "blacklist",
    aliases: ["bl"],
    permissionLevel: permissions_1.CommandPermission.Admin,
    usage: "<action:(add|remove|get|history)> <id> <type{action === 'add'}:(server|user)> [reason{action === 'add'}=No reason provided+]",
    async execute(client, data, message, args) {
        if (args.action === "add") {
            const progressMessage = await message.reply({
                content: "Blacklisting.....",
            });
            try {
                const req = await axios_1.default.post(`${API_URL}/api/blacklist/add`, {
                    id: args.id,
                    type: args.type,
                    reason: args.reason,
                    addedBy: message.author.id,
                }, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                });
                if (req.status === 200) {
                    progressMessage.edit({
                        content: `[${args.type}] ${args.id} added to blacklist for ${args.reason}`,
                    });
                    (0, webhookPoster_1.postToWebhook)(webhooks_1.WebhookTypes.BlacklistLog, {
                        content: `**[${args.type}]** *\`${args.id}\`* added to blacklist by *\`${message.author.id}\`* for ***\`${args.reason}\`***`,
                        avatar_url: client.user?.avatarURL(),
                        username: client.user?.username,
                    });
                }
                else
                    progressMessage.edit({
                        content: `Action failed: ${req.data?.message}`,
                    });
            }
            catch (error) {
                progressMessage.edit({
                    content: `Action failed: ${(0, getAxiosError_1.getAxiosErrorMessage)(error)}`,
                });
            }
        }
        else if (args.action === "get") {
            const progressMessage = await message.reply({
                content: "Fetching.....",
            });
            try {
                const req = await axios_1.default.get(`${API_URL}/api/blacklist/get?id=${args.id}`, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                });
                if (req.status === 200)
                    progressMessage.edit({
                        content: req.data
                            ? `**[${req.data.type}]** *\`${req.data.id}\`* has an active blacklist added by *\`${req.data.addedBy}\`* on <t:${Math.round(new Date(req.data.createdAt).getTime() / 1000)}:F> for ***\`${req.data.reason}\`***`
                            : "There is no active blacklist for this ID",
                    });
                else
                    progressMessage.edit({
                        content: `Action failed: ${req.data?.message}`,
                    });
            }
            catch (error) {
                progressMessage.edit({
                    content: `Action failed: ${(0, getAxiosError_1.getAxiosErrorMessage)(error)}`,
                });
            }
        }
        else if (args.action === "history") {
            const progressMessage = await message.reply({
                content: "Fetching.....",
            });
            try {
                const req = await axios_1.default.get(`${API_URL}/api/blacklist/history?id=${args.id}`, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                });
                if (req.status === 200)
                    progressMessage.edit({
                        content: req.data.length
                            ? `**[${req.data[0].type}]** *\`${req.data[0].id}\`* blacklist history:\n` +
                                req.data
                                    .reverse()
                                    .map((d, i) => `${i + 1}. ${d.deactivatedAt
                                    ? `*[Deactivated <t:${Math.round(new Date(d.deactivatedAt).getTime() / 1000)}:f>]* `
                                    : ""}Blacklist added by *\`${d.addedBy}\`* on <t:${Math.round(new Date(d.createdAt).getTime() / 1000)}:f> for ***\`${d.reason}\`***`)
                                    .join("\n")
                            : "There is no blacklist history for this ID",
                    });
                else
                    progressMessage.edit({
                        content: `Action failed: ${req.data?.message}`,
                    });
            }
            catch (error) {
                progressMessage.edit({
                    content: `Action failed: ${(0, getAxiosError_1.getAxiosErrorMessage)(error)}`,
                });
            }
        }
        else if (args.action === "remove") {
            const progressMessage = await message.reply({
                content: "Un-blacklisting.....",
            });
            try {
                const req = await axios_1.default.delete(`${API_URL}/api/blacklist/delete?id=${args.id}`, {
                    headers: {
                        Authorization: `Bearer ${API_TOKEN}`,
                    },
                });
                if (req.status === 200) {
                    progressMessage.edit({
                        content: `${args.id} removed from blacklist`,
                    });
                    (0, webhookPoster_1.postToWebhook)(webhooks_1.WebhookTypes.BlacklistLog, {
                        content: `**\`${args.id}\`** removed from blacklist by *\`${message.author.id}\`*`,
                        avatar_url: client.user?.avatarURL(),
                        username: client.user?.username,
                    });
                }
                else
                    progressMessage.edit({
                        content: `Action failed: ${req.data?.message}`,
                    });
            }
            catch (error) {
                progressMessage.edit({
                    content: `Action failed: ${(0, getAxiosError_1.getAxiosErrorMessage)(error)}`,
                });
            }
        }
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/prefix/developer/blacklist.js.map