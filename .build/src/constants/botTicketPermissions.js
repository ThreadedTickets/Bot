"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c87d5985-3630-5caa-b767-9e0d0dff4b63")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    allow: [
        discord_js_1.PermissionFlagsBits.AddReactions,
        discord_js_1.PermissionFlagsBits.AttachFiles,
        discord_js_1.PermissionFlagsBits.EmbedLinks,
        discord_js_1.PermissionFlagsBits.ManageChannels,
        discord_js_1.PermissionFlagsBits.ManageRoles,
        discord_js_1.PermissionFlagsBits.ManageWebhooks,
        discord_js_1.PermissionFlagsBits.ManageThreads,
        discord_js_1.PermissionFlagsBits.CreatePrivateThreads,
        discord_js_1.PermissionFlagsBits.CreatePublicThreads,
        discord_js_1.PermissionFlagsBits.SendMessagesInThreads,
        discord_js_1.PermissionFlagsBits.UseExternalEmojis,
        discord_js_1.PermissionFlagsBits.MentionEveryone,
        discord_js_1.PermissionFlagsBits.ViewChannel,
        discord_js_1.PermissionFlagsBits.SendMessages,
    ],
    deny: [],
};
//# sourceMappingURL=/src/constants/botTicketPermissions.js.map
//# debugId=c87d5985-3630-5caa-b767-9e0d0dff4b63
