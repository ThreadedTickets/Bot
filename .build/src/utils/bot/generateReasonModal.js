"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="31e58743-6385-517c-9e60-003df874c369")}catch(e){}}();

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
//# sourceMappingURL=generateReasonModal.js.map
//# debugId=31e58743-6385-517c-9e60-003df874c369
