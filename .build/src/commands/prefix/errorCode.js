"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const colours_1 = __importDefault(require("../../constants/colours"));
const lang_1 = require("../../lang");
const cmd = {
    name: "errorcode",
    usage: "<error_code>",
    aliases: ["ec", "errc"],
    async execute(client, data, message, args) {
        if (!message.guildId)
            return;
        const lang = data.lang;
        message.reply({
            embeds: [
                {
                    color: parseInt(colours_1.default.info, 16),
                    title: (0, lang_1.t)(lang, `ERROR_CODE_HELP_TITLE`, {
                        error_code: args.error_code,
                    }),
                    description: (0, lang_1.t)(lang, `ERROR_CODE_${args.error_code}`),
                },
            ],
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setLabel((0, lang_1.t)(lang, "SUPPORT_SERVER"))
                    .setURL(process.env["DISCORD_SUPPORT_INVITE"])
                    .setStyle(discord_js_1.ButtonStyle.Link)),
            ],
        });
    },
};
exports.default = cmd;
//# sourceMappingURL=/src/commands/prefix/errorCode.js.map