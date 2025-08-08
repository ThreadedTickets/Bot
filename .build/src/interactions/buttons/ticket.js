"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTicketFormModalResponse = parseTicketFormModalResponse;
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const performChecks_1 = require("../../utils/tickets/performChecks");
const hooks_1 = require("../../utils/hooks");
const __1 = require("../..");
const buildFormModal_1 = require("../../utils/tickets/buildFormModal");
const modal = {
    customId: "ticket",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const [, triggerId, applicationId, ownerId] = interaction.customId.split(":");
        const trigger = await (0, getServer_1.getServerTicketTrigger)(triggerId, interaction.guildId);
        if (!trigger)
            return interaction.reply((await (0, onError_1.onError)(new Error("Trigger not found"))).discordMsg);
        const triggerObject = trigger.toObject();
        const triggerTyped = {
            ...triggerObject,
        };
        if (trigger.form.length) {
            const modal = (0, buildFormModal_1.buildTicketFormModal)(triggerTyped.form, `ticket:${trigger._id}`, triggerTyped.label);
            if (modal instanceof Error)
                return await interaction.reply({
                    ...(await (0, onError_1.onError)(new Error(modal.message), { stack: modal.stack })).discordMsg,
                    flags: [discord_js_1.MessageFlags.Ephemeral],
                });
            return await interaction.showModal(modal);
        }
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "TICKET_CREATE_PERFORMING_CHECKS"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        let responses = [];
        if (applicationId) {
            const application = await (0, getServer_1.getCompletedApplication)(applicationId, ownerId);
            if (application)
                responses = application.responses;
        }
        __1.ticketQueueManager.wrap(async () => {
            const checks = await (0, performChecks_1.performTicketChecks)(triggerTyped, interaction.member);
            if (!checks.allowed) {
                return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checks.error}`)))).discordMsg);
            }
            const checkTargetChannel = await (0, performChecks_1.canCreateTicketTarget)(interaction.guild, trigger.isThread ? "thread" : "channel", trigger.openChannel || interaction.channelId);
            if (!checkTargetChannel.allowed)
                return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checkTargetChannel.error}`)))).discordMsg);
            await interaction.editReply({
                content: (0, lang_1.t)(data.lang, "TICKET_CREATE_CHECKS_PASSED"),
            });
            await (0, hooks_1.runHooks)("TicketCreate", {
                client: client,
                guild: interaction.guild,
                lang: data.lang,
                messageOrInteraction: interaction,
                owner: interaction.user.id,
                responses: responses,
                trigger: triggerTyped,
                user: interaction.user,
            });
        }, interaction.guildId);
    },
};
exports.default = modal;
function parseTicketFormModalResponse(interaction, form) {
    const responses = [];
    for (let i = 0; i < form.length; i++) {
        const question = form[i].question;
        const customId = `form_${i}`;
        const value = interaction.fields.getTextInputValue(customId);
        responses.push({
            question,
            response: value,
        });
    }
    return responses;
}
//# sourceMappingURL=/src/interactions/buttons/ticket.js.map