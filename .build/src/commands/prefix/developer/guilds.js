"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8dff5bc6-43f2-5d5e-a94f-e4df06a48a41")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../../constants/permissions");
const discord_js_1 = require("discord.js");
const command = {
    name: "guildlist",
    aliases: ["gl"],
    usage: "gl",
    permissionLevel: permissions_1.CommandPermission.Owner,
    async execute(client, data, message, args) {
        const lines = client.guilds.cache.map(guild => {
            const name = guild.name;
            const id = guild.id;
            const memberCount = guild.memberCount ?? "Unknown";
            const vanity = guild.vanityURLCode
                ? `https://discord.gg/${guild.vanityURLCode}`
                : "No vanity URL";
            return `${name} - ${id} | Members: ${memberCount} | Vanity: ${vanity}`;
        });
        const buffer = Buffer.from(lines.join("\n"), "utf-8");
        const attachment = new discord_js_1.AttachmentBuilder(buffer, { name: "guilds.txt" });
        message.reply({ files: [attachment] });
    },
};
exports.default = command;
//# sourceMappingURL=guilds.js.map
//# debugId=8dff5bc6-43f2-5d5e-a94f-e4df06a48a41
