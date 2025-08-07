"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4de0764a-6fd3-5778-a5a7-1cad6dad5c9d")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interactionCommandHandler_1 = require("../handlers/interactionCommandHandler");
const discord_js_1 = require("discord.js");
const metricsServer_1 = require("../metricsServer");
const interactionHandlers_1 = require("../handlers/interactionHandlers");
const onError_1 = require("../utils/onError");
const lang_1 = require("../lang");
const viewAnnouncement_1 = require("../utils/bot/viewAnnouncement");
const logger_1 = __importDefault(require("../utils/logger"));
const event = {
    name: "interactionCreate",
    once: false,
    async execute(client, data, interaction) {
        if (interaction.guildId && data?.blacklist?.active) {
            // We know the user is blacklisted, im gonna just use en as locale as this is per-user not server
            if (!interaction.isAutocomplete()) {
                interaction.reply((await (0, onError_1.onError)(new Error((0, lang_1.t)(
                // (
                //   await getServer(interaction.guildId)
                // ).preferredLanguage,
                "en", `BLACKLISTED_${data.blacklist.type === "user" ? "USER" : "SERVER"}`, {
                    reason: data.blacklist.reason,
                })))).discordMsg);
                return;
            }
            else
                return interaction.respond([
                    {
                        name: (0, lang_1.t)(
                        // (
                        //   await getServer(interaction.guildId)
                        // ).preferredLanguage,
                        "en", `BLACKLISTED_${data.blacklist.type === "user" ? "USER" : "SERVER"}`, {
                            reason: data.blacklist.reason,
                        }).slice(0, 100),
                        value: "-",
                    },
                ]);
        }
        if (interaction.isChatInputCommand() ||
            interaction.isUserContextMenuCommand() ||
            interaction.isMessageContextMenuCommand()) {
            const command = interactionCommandHandler_1.appCommands.get(interaction.commandName);
            if (!command)
                return;
            metricsServer_1.commandsRun.inc({
                command: interaction.commandName,
                type: interaction.isChatInputCommand()
                    ? "Chat Input"
                    : interaction.isUserContextMenuCommand()
                        ? "User Context"
                        : "Message Context",
            });
            try {
                await command.execute(client, data, interaction);
                // After successful execution, check for announcement
                setTimeout(async () => {
                    const announcement = await (0, viewAnnouncement_1.viewAnnouncement)(interaction.user.id);
                    if (announcement) {
                        await interaction
                            .followUp({
                            ...announcement,
                            flags: [discord_js_1.MessageFlags.Ephemeral],
                        })
                            .catch((err) => {
                            logger_1.default.warn(`Error when showing announcement`, err);
                        });
                    }
                }, 3000);
            }
            catch (err) {
                logger_1.default.error(`Error executing /${interaction.commandName}`, err);
                metricsServer_1.commandErrors.inc({
                    command: interaction.commandName,
                    type: interaction.isChatInputCommand()
                        ? "Chat Input"
                        : interaction.isUserContextMenuCommand()
                            ? "User Context"
                            : "Message Context",
                });
                const replyMethod = interaction.replied || interaction.deferred ? "followUp" : "reply";
                await interaction[replyMethod]((await (0, onError_1.onError)(err, {
                    command: interaction.commandName,
                    user: interaction.user.id,
                    server: interaction.guild?.id || "DMs",
                    stack: err.stack,
                })).discordMsg).catch(() => { });
            }
        }
        if (interaction.isButton()) {
            const customId = interaction.customId.split(":")[0];
            const handler = interactionHandlers_1.buttonHandlers.get(customId);
            if (handler) {
                metricsServer_1.interactionsRun.inc({ name: customId, type: "Button" });
                try {
                    await handler.execute(client, data, interaction);
                }
                catch (err) {
                    logger_1.default.error(`Error in button ${interaction.customId}`, err);
                    metricsServer_1.interactionErrors.inc({ name: customId, type: "Button" });
                    const replyMethod = interaction.replied || interaction.deferred ? "followUp" : "reply";
                    await interaction[replyMethod]((await (0, onError_1.onError)(err, {
                        button: customId,
                        fullId: interaction.customId,
                        user: interaction.user.id,
                        server: interaction.guild?.id || "DMs",
                        stack: err.stack,
                    })).discordMsg).catch(() => { });
                }
            }
        }
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId.split(":")[0];
            const handler = interactionHandlers_1.modalHandlers.get(customId);
            if (handler) {
                metricsServer_1.interactionsRun.inc({ name: customId, type: "Modal" });
                try {
                    await handler.execute(client, data, interaction);
                }
                catch (err) {
                    logger_1.default.error(`Error in modal ${interaction.customId}`, err);
                    metricsServer_1.interactionErrors.inc({ name: customId, type: "Modal" });
                    const replyMethod = interaction.replied || interaction.deferred ? "followUp" : "reply";
                    await interaction[replyMethod]((await (0, onError_1.onError)(err, {
                        modal: customId,
                        fullId: interaction.customId,
                        user: interaction.user.id,
                        server: interaction.guild?.id || "DMs",
                        stack: err.stack ?? "Unknown",
                    })).discordMsg).catch(() => { });
                }
            }
        }
        if (interaction.isAnySelectMenu()) {
            const customId = interaction.customId.split(":")[0];
            const handler = interactionHandlers_1.selectMenuHandlers.get(customId);
            if (handler) {
                metricsServer_1.interactionsRun.inc({ name: customId, type: "Select Menu" });
                try {
                    await handler.execute(client, data, interaction);
                }
                catch (err) {
                    logger_1.default.error(`Error in select menu ${interaction.customId}`, err);
                    metricsServer_1.interactionErrors.inc({ name: customId, type: "Select Menu" });
                    const replyMethod = interaction.replied || interaction.deferred ? "followUp" : "reply";
                    await interaction[replyMethod]((await (0, onError_1.onError)(err, {
                        menu: customId,
                        fullId: interaction.customId,
                        user: interaction.user.id,
                        server: interaction.guild?.id || "DMs",
                    })).discordMsg).catch(() => { });
                }
            }
        }
        if (interaction.isAutocomplete()) {
            const command = interactionCommandHandler_1.appCommands.get(interaction.commandName);
            if (command?.type === "slash" && command.autocomplete) {
                try {
                    await command.autocomplete(client, interaction);
                }
                catch (err) {
                    logger_1.default.error(`Error executing autocomplete ${interaction.commandName}`, err);
                }
            }
        }
    },
};
exports.default = event;
//# sourceMappingURL=interactionCreate.js.map
//# debugId=4de0764a-6fd3-5778-a5a7-1cad6dad5c9d
