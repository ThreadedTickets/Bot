"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="40eda5a4-3f31-5f9d-96a8-abb4ed41af6b")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getServer_1 = require("../utils/bot/getServer");
const serverMessageToDiscordMessage_1 = __importDefault(require("../utils/formatters/serverMessageToDiscordMessage"));
const generateBaseContext_1 = require("../utils/message/placeholders/generateBaseContext");
const resolvePlaceholders_1 = require("../utils/message/placeholders/resolvePlaceholders");
const TicketChannelManager_1 = require("../utils/bot/TicketChannelManager");
const userCooldowns = new Map();
const COOLDOWN_TIME = 10 * 1000;
const event = {
    name: "messageCreate",
    once: false,
    async execute(client, data, message) {
        if (message.author.bot || !message.guildId || message.content.length < 7)
            return;
        if (data?.blacklist?.active)
            return;
        const server = await (0, getServer_1.getServer)(message.guildId);
        const { extraAllowedChannels } = server.settings.autoResponders;
        const isTicketChannel = await new TicketChannelManager_1.TicketChannelManager().getTicket(message.channelId);
        if (!extraAllowedChannels.includes(message.channel.id) &&
            !isTicketChannel?.allowAutoresponders)
            return;
        const userId = message.author.id;
        if (userCooldowns.has(userId))
            return;
        const responders = await (0, getServer_1.getServerResponders)(message.guildId, true);
        if (!responders.length)
            return;
        const matchedResponder = (0, getServer_1.findMatchingResponder)(message.content, responders);
        if (!matchedResponder)
            return;
        const reply = await (0, getServer_1.getServerMessage)(matchedResponder.message, message.guildId);
        if (!reply)
            return;
        userCooldowns.set(userId, new Date().getTime());
        setTimeout(() => userCooldowns.delete(userId), COOLDOWN_TIME);
        message.reply((0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)((0, serverMessageToDiscordMessage_1.default)(reply), (0, generateBaseContext_1.generateBasePlaceholderContext)({
            server: message.guild,
            channel: message.channel,
            member: message.member,
            user: message.author,
        })));
    },
};
exports.default = event;
//# sourceMappingURL=handleAutoResponders.js.map
//# debugId=40eda5a4-3f31-5f9d-96a8-abb4ed41af6b
