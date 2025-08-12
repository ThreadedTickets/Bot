"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReasonModal = generateReasonModal;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
function generateReasonModal(customId, required) {
    return new discord_js_1.ModalBuilder()
        .setTitle("Type a reason")
        .setCustomId(customId)
        .addComponents(new discord_js_1.ActionRowBuilder().addComponents(new builders_1.TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason")
        .setMaxLength(100)
        .setPlaceholder(required ? "Give a reason" : "Press submit to leave blank")
        .setRequired(required)
        .setStyle(discord_js_1.TextInputStyle.Short)));
}
//# sourceMappingURL=/src/utils/bot/generateReasonModal.js.map