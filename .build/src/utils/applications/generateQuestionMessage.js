"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="984d8fe5-027f-5eba-a539-5a6c8c1149e9")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionMessage = generateQuestionMessage;
const discord_js_1 = require("discord.js");
const colours_1 = __importDefault(require("../../constants/colours"));
const getServer_1 = require("../bot/getServer");
const resolvePlaceholders_1 = require("../message/placeholders/resolvePlaceholders");
async function generateQuestionMessage(application, questionNumber) {
    const question = application.questions[questionNumber];
    let baseMessage = {
        embeds: [
            {
                title: "{applicationName}",
                color: parseInt(colours_1.default.primary, 16),
                description: `**{questionNumber}/{totalQuestions}**: {question}`,
            },
        ],
        components: [],
    };
    const customMessage = question.message
        ? await (0, getServer_1.getServerMessage)(question.message, application.server)
        : null;
    if (customMessage) {
        baseMessage = {
            content: customMessage.content,
            embeds: customMessage.embeds,
            components: customMessage.components,
        };
    }
    if (question.type === "choice") {
        const selectMenu = new discord_js_1.StringSelectMenuBuilder().setCustomId(`appSubmit:${application._id}:${application.server}`);
        if (question.minimum !== null)
            selectMenu.setMinValues(Math.max(0, Math.min(25, Math.abs(question.minimum))));
        if (question.maximum !== null)
            selectMenu.setMaxValues(Math.min(25, Math.max(1, Math.abs(question.maximum))));
        for (const option of question.choices ?? []) {
            selectMenu.addOptions({
                label: option.slice(0, 100),
                value: option.slice(0, 100),
            });
        }
        baseMessage.components = [
            new discord_js_1.ActionRowBuilder()
                .addComponents(selectMenu)
                .toJSON(),
        ];
    }
    return (0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(baseMessage, {
        question: question.question,
        questionNumber: questionNumber + 1,
        totalQuestions: application.questions.length,
        applicationName: application.name,
        max: question.maximum,
        min: question.minimum,
    });
}
//# sourceMappingURL=/src/utils/applications/generateQuestionMessage.js.map
//# debugId=984d8fe5-027f-5eba-a539-5a6c8c1149e9
