"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="0c105e59-28b3-5df2-bf3b-0555e92e64cc")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTicketFormModal = buildTicketFormModal;
const discord_js_1 = require("discord.js");
const MAX_FIELDS = 5;
const MAX_CHARS = 4000;
const MAX_LABEL = 45;
const MAX_PLACEHOLDER = 100;
const MAX_TITLE = 45;
function buildTicketFormModal(questions, customId, title) {
    if (!Array.isArray(questions) || questions.length === 0) {
        return new Error("No form fields provided.");
    }
    if (questions.length > MAX_FIELDS) {
        return new Error("Discord modals support up to 5 fields only.");
    }
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(customId)
        .setTitle(title.slice(0, MAX_TITLE));
    for (let i = 0; i < questions.length; i++) {
        const form = questions[i];
        let { question, multilineResponse, requiredResponse, minimumCharactersRequired, maximumCharactersRequired, placeholder, defaultValue, } = form;
        // Trim label and placeholder
        question = question?.slice(0, MAX_LABEL) || `Question ${i + 1}`;
        placeholder = placeholder?.slice(0, MAX_PLACEHOLDER) || "";
        // Fix min/max range
        let min = Math.max(0, Math.min(minimumCharactersRequired, MAX_CHARS));
        let max = Math.max(1, Math.min(maximumCharactersRequired, MAX_CHARS));
        if (min > max)
            [min, max] = [max, min]; // swap if incorrect
        // Fix default value
        let value = typeof defaultValue === "string" ? defaultValue.slice(0, max) : null;
        if (value && value.length < min) {
            value = value.padEnd(min, " ");
        }
        // Final validation
        if (value && (value.length < min || value.length > max)) {
            return new Error(`Cannot correct default value for "${question}".`);
        }
        const input = new discord_js_1.TextInputBuilder()
            .setCustomId(`form_${i}`)
            .setLabel(question)
            .setStyle(multilineResponse ? discord_js_1.TextInputStyle.Paragraph : discord_js_1.TextInputStyle.Short)
            .setRequired(requiredResponse);
        if (placeholder)
            input.setPlaceholder(placeholder);
        if (value)
            input.setValue(value);
        if (minimumCharactersRequired)
            input.setMinLength(min);
        if (maximumCharactersRequired)
            input.setMaxLength(max);
        modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(input));
    }
    return modal;
}
//# sourceMappingURL=/src/utils/tickets/buildFormModal.js.map
//# debugId=0c105e59-28b3-5df2-bf3b-0555e92e64cc
