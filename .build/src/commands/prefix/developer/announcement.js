"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../../../constants/permissions");
const getServer_1 = require("../../../utils/bot/getServer");
const viewAnnouncement_1 = require("../../../utils/bot/viewAnnouncement");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../utils/formatters/serverMessageToDiscordMessage"));
const redis_1 = __importDefault(require("../../../utils/redis"));
const command = {
    name: "announcement",
    aliases: ["ann"],
    permissionLevel: permissions_1.CommandPermission.Owner,
    usage: "<action:(set|del|view|count)> <messageId{action === 'set'}> <userId{action === 'view'}>",
    async execute(client, data, msg, args) {
        if (!msg.guildId)
            return;
        const { action, messageId, userId } = args;
        if (action === "set") {
            const message = await (0, getServer_1.getServerMessage)(messageId, msg.guildId);
            if (!message)
                return msg.reply("Invalid message");
            const parsedMessage = (0, serverMessageToDiscordMessage_1.default)(message);
            await redis_1.default.set("announcement", JSON.stringify({
                ...parsedMessage,
                components: [
                    new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setURL(process.env["DISCORD_SUPPORT_INVITE"])
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setLabel("Support Server")),
                ],
            }));
            await redis_1.default.del("announcement:viewed");
            msg.reply("Done");
        }
        else if (action === "del") {
            await redis_1.default.del("announcement");
            msg.reply("Done");
        }
        else if (action === "count") {
            msg.reply(`total views: ${await (0, viewAnnouncement_1.countAnnouncementViews)()}`);
        }
        else if (action === "view") {
            msg.reply(`viewed: ${await (0, viewAnnouncement_1.hasUserViewedAnnouncement)(userId)}`);
        }
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/prefix/developer/announcement.js.map