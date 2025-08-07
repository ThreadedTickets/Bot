"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1909ba0e-f1be-5df6-a46e-d337b9dd634c")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const close_1 = require("../../utils/tickets/close");
const modal = {
    customId: "close",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const ticketId = interaction.customId.split(":")[1];
        const duration = interaction.fields.getTextInputValue("duration") || null;
        const reason = interaction.fields.getTextInputValue("reason") ||
            "No reason was provided";
        await (0, close_1.closeTicket)(ticketId, data.lang, reason, interaction, duration);
    },
};
exports.default = modal;
//# sourceMappingURL=closeTicket.js.map
//# debugId=1909ba0e-f1be-5df6-a46e-d337b9dd634c
