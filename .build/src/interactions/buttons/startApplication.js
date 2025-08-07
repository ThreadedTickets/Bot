"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3fd18931-ad05-5291-8fca-316a59e6e424")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const performChecks_1 = require("../../utils/applications/performChecks");
const generateQuestionMessage_1 = require("../../utils/applications/generateQuestionMessage");
const updateCache_1 = require("../../utils/database/updateCache");
const toTimeUnit_1 = require("../../utils/formatters/toTimeUnit");
const button = {
    customId: "startApp",
    async execute(client, data, interaction) {
        const [, applicationId, guildId] = interaction.customId.split(":");
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "APPLICATION_PENDING_CHECKS"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const application = await (0, getServer_1.getServerApplication)(applicationId, guildId);
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
        const checks = await (0, performChecks_1.performApplicationChecks)(applicationTyped, interaction.user, true, false);
        if (!checks.allowed) {
            return interaction.editReply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_${checks.error}`))))
                .discordMsg);
        }
        await interaction.deleteReply();
        interaction.message.edit({ components: [] }).catch(() => { });
        interaction.user.send(await (0, generateQuestionMessage_1.generateQuestionMessage)(applicationTyped, 0));
        await (0, updateCache_1.updateCachedData)(`runningApplications:${interaction.user.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 0, 1), {
            applicationId: applicationTyped._id,
            startTime: new Date(),
            server: applicationTyped.server,
            questionNumber: 0,
            questions: applicationTyped.questions,
            responses: [],
        });
    },
};
exports.default = button;
//# sourceMappingURL=startApplication.js.map
//# debugId=3fd18931-ad05-5291-8fca-316a59e6e424
