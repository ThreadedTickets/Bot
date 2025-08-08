"use strict";
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
//# sourceMappingURL=/src/interactions/modals/closeTicket.js.map