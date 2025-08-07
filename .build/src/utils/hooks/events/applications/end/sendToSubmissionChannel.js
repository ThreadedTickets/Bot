"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5774d300-1a42-58df-9b47-353dfd13fd42")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQAMessages = buildQAMessages;
const discord_js_1 = require("discord.js");
const __1 = require("../../..");
const getServer_1 = require("../../../../bot/getServer");
const colours_1 = __importDefault(require("../../../../../constants/colours"));
const sendMessageToChannel_1 = require("../../../../bot/sendMessageToChannel");
const lang_1 = require("../../../../../lang");
const duration_1 = require("../../../../formatters/duration");
const CompletedApplications_1 = require("../../../../../database/modals/CompletedApplications");
const logger_1 = __importDefault(require("../../../../logger"));
const EMBED_TOTAL_CHAR_LIMIT = 6000;
const FIELD_NAME_LIMIT = 256;
const FIELD_VALUE_LIMIT = 1024;
const EMBEDS_PER_MESSAGE = 10;
function buildQAMessages(pairs) {
    const messages = [];
    let currentMessage = { embeds: [] };
    let currentEmbed = createNewEmbed();
    let totalEmbedChars = 0;
    for (const { question, response } of pairs) {
        let remainingResponse = response || "None";
        let fieldName = truncate(question, FIELD_NAME_LIMIT);
        let chunkIndex = 0;
        while (remainingResponse.length > 0) {
            // Get a chunk of response that fits within the field value limit
            let chunk = remainingResponse.slice(0, FIELD_VALUE_LIMIT);
            remainingResponse = remainingResponse.slice(FIELD_VALUE_LIMIT);
            // If this is a continued chunk, update the field name
            const name = chunkIndex === 0
                ? fieldName
                : truncate(`${fieldName} (continued)`, FIELD_NAME_LIMIT);
            chunkIndex++;
            // Check if adding this field exceeds embed limits
            const fieldCharCount = name.length + chunk.length;
            if (currentEmbed.fields.length >= 25 ||
                totalEmbedChars + fieldCharCount > EMBED_TOTAL_CHAR_LIMIT) {
                // Save current embed to message
                currentMessage.embeds.push(currentEmbed);
                // If current message has max embeds, push it and start a new one
                if (currentMessage.embeds.length >= EMBEDS_PER_MESSAGE) {
                    messages.push(currentMessage);
                    currentMessage = { embeds: [] };
                }
                currentEmbed = createNewEmbed();
                totalEmbedChars = 0;
            }
            // Add the field to the current embed
            currentEmbed.fields.push({ name, value: chunk });
            totalEmbedChars += fieldCharCount;
        }
    }
    // Push any remaining data
    if (currentEmbed.fields.length > 0) {
        currentMessage.embeds.push(currentEmbed);
    }
    if (currentMessage.embeds.length > 0) {
        messages.push(currentMessage);
    }
    return messages;
}
function createNewEmbed() {
    return {
        fields: [],
        color: parseInt(colours_1.default.primary, 16),
    };
}
function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 3) + "..." : str;
}
(0, __1.registerHook)("ApplicationFinal", async ({ client, application, responses, owner, id, }) => {
    const submissionChannel = application.submissionsChannel;
    if (!submissionChannel)
        return;
    const server = await (0, getServer_1.getServer)(application.server);
    const message = await (0, sendMessageToChannel_1.sendMessageToChannel)(client, application.server, submissionChannel, {
        content: application.pingRoles.map((r) => `<@&${r}>`).join(", ") || undefined,
        embeds: [
            {
                title: (0, lang_1.t)(server.preferredLanguage, "NEW_APPLICATION_SUBMIT_TITLE", {
                    application: application.name,
                }),
                color: parseInt(colours_1.default.success, 16),
                description: `> ${(0, lang_1.t)(server.preferredLanguage, "NEW_APPLICATION_SUBMIT_BODY_OWNER", { user: `<@${owner}> (\`${owner}\`)` })}\n> ${(0, lang_1.t)(server.preferredLanguage, "NEW_APPLICATION_SUBMIT_BODY_DURATION", {
                    duration: (0, duration_1.formatDuration)(new Date().getTime() - new Date(responses.startTime).getTime()),
                })}\n> ${(0, lang_1.t)(server.preferredLanguage, "NEW_APPLICATION_SUBMIT_BODY_INFORMATION")}`,
            },
        ],
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`accApp:${id}:${owner}`)
                .setLabel("Accept")
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId(`rejApp:${id}:${owner}`)
                .setLabel("Reject")
                .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                .setCustomId(`delApp:${id}:${owner}`)
                .setLabel("Delete")
                .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                .setCustomId(`ticket:${application.linkedTicketTrigger}:${id}:${owner}`)
                .setLabel("Create Ticket")
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(application.linkedTicketTrigger ? false : true), new discord_js_1.ButtonBuilder()
                .setCustomId(`appHistory:${application._id}:${owner}`)
                .setLabel("View History")
                .setStyle(discord_js_1.ButtonStyle.Primary)),
        ],
    });
    if (!message)
        return logger_1.default.warn("Failed to send application submission message after completed application");
    const thread = await message.startThread({
        name: `Application - ${application.name} - ${owner}`.slice(0, 100),
        reason: "Creating thread on submission message for staff discussion",
    });
    // Just gives me a message link in the DB that i can work with
    await CompletedApplications_1.CompletedApplicationSchema.findOneAndUpdate({ _id: id }, { messageLink: message.url });
    if (!thread)
        return;
    const QAMessages = buildQAMessages(responses.responses);
    for (const message of QAMessages) {
        thread
            .send(message)
            .catch((err) => logger_1.default.warn("Failed to send QA message to application thread", err));
    }
});
//# sourceMappingURL=sendToSubmissionChannel.js.map
//# debugId=5774d300-1a42-58df-9b47-353dfd13fd42
