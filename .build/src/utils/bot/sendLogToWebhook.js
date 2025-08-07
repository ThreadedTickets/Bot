"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c554d73b-809e-5c58-8d66-7d38351359cb")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLogToWebhook = void 0;
exports.getAvailableLogChannel = getAvailableLogChannel;
const discord_js_1 = require("discord.js");
const getCachedElse_1 = require("../database/getCachedElse");
const toTimeUnit_1 = require("../formatters/toTimeUnit");
const Guild_1 = require("../../database/modals/Guild");
const updateCache_1 = require("../database/updateCache");
const logger_1 = __importDefault(require("../logger"));
const createWebhook = async (channel, client) => {
    return await channel.createWebhook({
        name: `${client.user?.username || "Logger"}`,
        avatar: client.user?.displayAvatarURL(),
    });
};
// Recursively update webhook URLs in the provided logging configuration
const updateWebhookInLoggingConfig = async (config, oldWebhookUrl, newWebhookUrl) => {
    for (const [key, value] of Object.entries(config)) {
        if (typeof value === "object") {
            await updateWebhookInLoggingConfig(value, oldWebhookUrl, newWebhookUrl);
        }
        else if (key === "webhook" && value === oldWebhookUrl) {
            config[key] = newWebhookUrl;
        }
    }
};
const postLogToWebhook = async (client, logConfig, content) => {
    if (!logConfig.enabled || !logConfig.channel)
        return;
    let webhookClient = null;
    const guild = client.guilds.cache.find((g) => g.channels.cache.has(logConfig.channel));
    if (!guild)
        return;
    const channel = guild.channels.cache.get(logConfig.channel);
    if (!channel || !channel.isTextBased()) {
        await updateLoggingConfigToNull(guild.id, logConfig);
        return;
    }
    // Prepare the webhook channel (either the thread's parent or the text channel)
    let webhookChannel;
    if (channel.isThread()) {
        if (!channel.parent || !channel.parent.isTextBased())
            return;
        webhookChannel = channel.parent;
    }
    else if (channel.type === discord_js_1.ChannelType.GuildText) {
        webhookChannel = channel;
    }
    else {
        return;
    }
    // If no webhook URL, create one before attempting to send
    if (!logConfig.webhook) {
        try {
            const newWebhook = await createWebhook(webhookChannel, client);
            logConfig.webhook = newWebhook.url;
            webhookClient = new discord_js_1.WebhookClient({ url: newWebhook.url });
            const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`guilds:${guild.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Guild_1.GuildSchema.findOneAndUpdate({ id: guild.id }, { $setOnInsert: { id: guild.id } }, { upsert: true, new: true }), Guild_1.GuildSchema);
            await updateWebhookInLoggingConfig(document.settings.logging, "", newWebhook.url);
            await document.save();
            (0, updateCache_1.updateCachedData)(`guilds:${guild.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
            logger_1.default.debug(`Created new webhook for guild ${guild.id} as none existed`);
        }
        catch (err) {
            logger_1.default.error(`Failed to create missing webhook`, err);
            return;
        }
    }
    else {
        webhookClient = new discord_js_1.WebhookClient({ url: logConfig.webhook });
    }
    try {
        await webhookClient.send(content);
    }
    catch (error) {
        logger_1.default.warn(`Initial webhook send failed, attempting recovery`, error);
        try {
            const newWebhook = await createWebhook(webhookChannel, client);
            const oldWebhookUrl = logConfig.webhook;
            logConfig.webhook = newWebhook.url;
            webhookClient = new discord_js_1.WebhookClient({ url: newWebhook.url });
            const { data: document } = await (0, getCachedElse_1.getCachedDataElse)(`guilds:${guild.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), async () => await Guild_1.GuildSchema.findOneAndUpdate({ id: guild.id }, { $setOnInsert: { id: guild.id } }, { upsert: true, new: true }), Guild_1.GuildSchema);
            await updateWebhookInLoggingConfig(document.settings.logging, oldWebhookUrl, newWebhook.url);
            await document.save();
            (0, updateCache_1.updateCachedData)(`guilds:${guild.id}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
            logger_1.default.debug(`Recovered webhook for guild ${guild.id}`);
            await webhookClient.send({
                ...content,
                embeds: [...content.embeds],
            });
        }
        catch (err) {
            logger_1.default.error(`Failed to recreate deleted webhook`, err);
        }
    }
};
exports.postLogToWebhook = postLogToWebhook;
// Helper function to disable logging and set webhook and channel to null
const updateLoggingConfigToNull = async (guildId, logConfig) => {
    try {
        const document = await Guild_1.GuildSchema.findOne({ id: guildId });
        if (!document) {
            logger_1.default.error(`Guild ${guildId} not found.`);
            return;
        }
        // Disable logging and set the channel and webhook to null
        for (const category in document.settings.logging) {
            for (const subCategory in document.settings.logging[category]) {
                const setting = document.settings.logging[category][subCategory];
                if (setting.webhook === logConfig.webhook) {
                    setting.webhook = null;
                    setting.channel = null;
                    setting.enabled = false;
                }
            }
        }
        // Save the updated document
        await document.save();
        // Update cache
        (0, updateCache_1.updateCachedData)(`guilds:${guildId}`, (0, toTimeUnit_1.toTimeUnit)("seconds", 0, 30), document.toObject());
        logger_1.default.debug(`Logging has been disabled for guild ${guildId} and the webhook/channel set to null.`);
    }
    catch (err) {
        logger_1.default.error(`Failed to update logging config for guild ${guildId}`, err);
    }
};
/**
 *
 * @param logConfig
 * @param event
 * @returns A function that will return the log config for a channel based on the given log event
 */
function getAvailableLogChannel(logConfig, event) {
    const parts = event.split(".");
    let current = logConfig;
    for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
            current = current[part];
        }
        else {
            current = null;
            break;
        }
    }
    if (current &&
        typeof current === "object" &&
        "enabled" in current &&
        current.enabled) {
        return current;
    }
    if (logConfig.general && logConfig.general.enabled && current.enabled) {
        return logConfig.general;
    }
    return null;
}
//# sourceMappingURL=sendLogToWebhook.js.map
//# debugId=c554d73b-809e-5c58-8d66-7d38351359cb
