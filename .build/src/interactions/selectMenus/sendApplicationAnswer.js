"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="6a8caf09-349c-5f01-80d4-54f5a5f67fae")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const colours_1 = __importDefault(require("../../constants/colours"));
const lang_1 = require("../../lang");
const generateQuestionMessage_1 = require("../../utils/applications/generateQuestionMessage");
const handleApplicationSubmit_1 = require("../../utils/applications/handleApplicationSubmit");
const getServer_1 = require("../../utils/bot/getServer");
const getCachedElse_1 = require("../../utils/database/getCachedElse");
const updateCache_1 = require("../../utils/database/updateCache");
const toTimeUnit_1 = require("../../utils/formatters/toTimeUnit");
const resolvePlaceholders_1 = require("../../utils/message/placeholders/resolvePlaceholders");
const onError_1 = require("../../utils/onError");
const select = {
    customId: "appSubmit",
    async execute(client, data, interaction) {
        const [, applicationId, guildId] = interaction.customId.split(":");
        const activeApplication = await (0, getCachedElse_1.getCache)(`runningApplications:${interaction.user.id}`);
        if (!activeApplication.cached)
            return interaction.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1008`)))).discordMsg);
        const appJson = activeApplication.data;
        if (applicationId !== appJson.applicationId)
            return interaction.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1008`)))).discordMsg);
        const application = await (0, getServer_1.getServerApplication)(applicationId, guildId);
        if (!application)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        const selection = interaction.values.join(", ");
        const newCache = {
            ...appJson,
            questionNumber: appJson.questionNumber + 1,
            responses: [
                ...appJson.responses,
                {
                    question: appJson.questions[appJson.questionNumber].question,
                    response: selection,
                },
            ],
        };
        (0, updateCache_1.updateCachedData)(`runningApplications:${interaction.user.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 0, 1), newCache);
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
        interaction.message.edit({ components: [] });
        // Reached the end of the app
        if (newCache.questionNumber >= newCache.questions.length) {
            let baseMessage = {
                embeds: [
                    {
                        title: "{applicationName}",
                        color: parseInt(colours_1.default.primary, 16),
                        description: (0, lang_1.t)(data?.lang, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED"),
                    },
                ],
            };
            const customMessage = application.submissionMessage
                ? await (0, getServer_1.getServerMessage)(application.submissionMessage, application.server)
                : null;
            if (customMessage) {
                baseMessage = {
                    content: customMessage.content,
                    embeds: customMessage.embeds,
                };
            }
            interaction.user.send({
                components: [
                    new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setURL(process.env["DISCORD_APPLICATION_INVITE"])
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setLabel((0, lang_1.t)(data?.lang, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON")))
                        .toJSON(),
                ],
                ...(0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(baseMessage, {
                    applicationName: application.name,
                }),
            });
            return (0, handleApplicationSubmit_1.handleApplicationSubmit)(applicationTyped, newCache, interaction.user.id, client);
        }
        interaction.user.send(await (0, generateQuestionMessage_1.generateQuestionMessage)(applicationTyped, newCache.questionNumber));
    },
};
exports.default = select;
//# sourceMappingURL=sendApplicationAnswer.js.map
//# debugId=6a8caf09-349c-5f01-80d4-54f5a5f67fae
