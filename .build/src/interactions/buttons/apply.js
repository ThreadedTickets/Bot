"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const performChecks_1 = require("../../utils/applications/performChecks");
const hooks_1 = require("../../utils/hooks");
const button = {
    customId: "apply",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const [, applicationId] = interaction.customId.split(":");
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "APPLICATION_PENDING_CHECKS"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const application = await (0, getServer_1.getServerApplication)(applicationId, interaction.guildId);
        if (!application)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        const appObject = application.toObject();
        const applicationTyped = {
            ...appObject,
            open: appObject.open?.toISOString() ?? null,
            close: appObject.close?.toISOString() ?? null,
            acceptedMessage: appObject.acceptedMessage ?? null,
            rejectedMessage: appObject.rejectedMessage ?? null,
            submissionMessage: appObject.submissionMessage ?? null,
            cancelMessage: appObject.cancelMessage ?? null,
            confirmationMessage: appObject.confirmationMessage ?? null,
        };
        const checks = await (0, performChecks_1.performApplicationChecks)(applicationTyped, interaction.member, true, true);
        if (!checks.allowed) {
            return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checks.error}`))))
                .discordMsg);
        }
        interaction.editReply({
            content: (0, lang_1.t)(data.lang, "APPLICATION_DIRECT_TO_DMS"),
        });
        (0, hooks_1.runHooks)("ApplicationStart", {
            lang: data.lang,
            user: interaction.user,
            application: applicationTyped,
            server: interaction.guild,
        });
    },
};
exports.default = button;
//# sourceMappingURL=/src/interactions/buttons/apply.js.map