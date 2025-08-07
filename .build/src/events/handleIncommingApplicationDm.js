"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ae3234f4-42c9-5ecc-897f-0a6feda346ce")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const colours_1 = __importDefault(require("../constants/colours"));
const lang_1 = require("../lang");
const generateQuestionMessage_1 = require("../utils/applications/generateQuestionMessage");
const handleApplicationSubmit_1 = require("../utils/applications/handleApplicationSubmit");
const getServer_1 = require("../utils/bot/getServer");
const getCachedElse_1 = require("../utils/database/getCachedElse");
const invalidateCache_1 = require("../utils/database/invalidateCache");
const updateCache_1 = require("../utils/database/updateCache");
const toTimeUnit_1 = require("../utils/formatters/toTimeUnit");
const resolvePlaceholders_1 = require("../utils/message/placeholders/resolvePlaceholders");
const onError_1 = require("../utils/onError");
const event = {
    name: "messageCreate",
    once: false,
    async execute(client, data, message) {
        if (message.guild)
            return;
        if (message.author.bot)
            return;
        const activeApplication = await (0, getCachedElse_1.getCache)(`runningApplications:${message.author.id}`);
        // console.log("Result:", activeApplication);
        // console.log("Raw data:", JSON.stringify(activeApplication.data, null, 2));
        if (!activeApplication.cached)
            return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1008`)))).discordMsg);
        const appJson = activeApplication.data;
        const { applicationId, server } = appJson;
        const application = await (0, getServer_1.getServerApplication)(applicationId, server);
        if (!application)
            return message.reply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        const selection = message.content;
        // Now validate the content
        const currentQuestion = appJson.questions[appJson.questionNumber];
        if (selection.toLocaleLowerCase() === "cancel") {
            let baseMessage = {
                embeds: [
                    {
                        title: "{applicationName}",
                        color: parseInt(colours_1.default.primary, 16),
                        description: (0, lang_1.t)(data?.lang, "APPLICATION_DEFAULT_MESSAGE_CANCELED"),
                    },
                ],
            };
            const customMessage = application.cancelMessage
                ? await (0, getServer_1.getServerMessage)(application.cancelMessage, application.server)
                : null;
            if (customMessage) {
                baseMessage = {
                    content: customMessage.content,
                    embeds: customMessage.embeds,
                };
            }
            await (0, invalidateCache_1.invalidateCache)(`runningApplications:${message.author.id}`);
            return message.reply({
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
        }
        if (currentQuestion.type === "choice")
            return;
        if (currentQuestion.type === "text") {
            if (message.attachments.size > 0)
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1014`))))
                    .discordMsg);
            if (currentQuestion.minimum && selection.length < currentQuestion.minimum)
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1009`, {
                    min: currentQuestion.minimum,
                })))).discordMsg);
            if (currentQuestion.maximum && selection.length > currentQuestion.maximum)
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1010`, {
                    max: currentQuestion.maximum,
                })))).discordMsg);
        }
        else if (currentQuestion.type === "number") {
            if (isNaN(parseInt(selection)))
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1013`, {
                    min: currentQuestion.minimum,
                })))).discordMsg);
            if (currentQuestion.minimum &&
                parseFloat(selection) < currentQuestion.minimum)
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1011`, {
                    min: currentQuestion.minimum,
                })))).discordMsg);
            if (currentQuestion.maximum &&
                parseFloat(selection) > currentQuestion.maximum)
                return message.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(data.lang, `ERROR_CODE_1012`, {
                    max: currentQuestion.maximum,
                })))).discordMsg);
        }
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
        (0, updateCache_1.updateCachedData)(`runningApplications:${message.author.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 0, 0, 1), newCache);
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
                components: [
                    new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setURL(process.env["DISCORD_APPLICATION_INVITE"])
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setLabel((0, lang_1.t)(data?.lang, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON")))
                        .toJSON(),
                ],
            };
            const customMessage = application.submissionMessage
                ? await (0, getServer_1.getServerMessage)(application.submissionMessage, application.server)
                : null;
            if (customMessage) {
                baseMessage = {
                    content: customMessage.content,
                    embeds: customMessage.embeds,
                    components: [
                        new discord_js_1.ActionRowBuilder()
                            .addComponents(new discord_js_1.ButtonBuilder()
                            .setURL(process.env["DISCORD_APPLICATION_INVITE"])
                            .setStyle(discord_js_1.ButtonStyle.Link)
                            .setLabel((0, lang_1.t)(data?.lang, "APPLICATION_DEFAULT_MESSAGE_SUBMITTED_BUTTON")))
                            .toJSON(),
                    ],
                };
            }
            message.author.send((0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(baseMessage, {
                applicationName: application.name,
            }));
            return (0, handleApplicationSubmit_1.handleApplicationSubmit)(applicationTyped, newCache, message.author.id, client);
        }
        message.author.send(await (0, generateQuestionMessage_1.generateQuestionMessage)(applicationTyped, newCache.questionNumber));
    },
};
exports.default = event;
//# sourceMappingURL=handleIncommingApplicationDm.js.map
//# debugId=ae3234f4-42c9-5ecc-897f-0a6feda346ce
