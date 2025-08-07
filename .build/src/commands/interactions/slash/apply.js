"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d58f18a5-04d9-5eb0-84dd-6062cd4819c0")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const lang_1 = require("../../../lang");
const performChecks_1 = require("../../../utils/applications/performChecks");
const hooks_1 = require("../../../utils/hooks");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("apply")
        .setDescription("Apply for an application")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("application")
        .setDescription("Which application would you like to apply for?")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true)),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "application") {
            const focusedValue = interaction.options.getString("application", true);
            const now = new Date().getTime();
            const applications = (await (0, getServer_1.getServerApplications)(interaction.guildId)).filter((app) => {
                const open = app.open ? new Date(app.open).getTime() : null;
                const close = app.close ? new Date(app.close).getTime() : null;
                const accepting = app.acceptingResponses;
                if (open && close && !accepting) {
                    // Only show if now is between open and close
                    return now >= open && now <= close;
                }
                if (close && accepting) {
                    // Do not show if close date has passed
                    return now <= close;
                }
                if (open && accepting) {
                    // Show
                    return true;
                }
                if (open && !accepting) {
                    // Show if past open
                    return now >= open;
                }
                if (!open && !close && accepting) {
                    // Show
                    return true;
                }
                // If none set and not accepting, do not show
                return false;
            });
            if (!applications.length) {
                interaction.respond([
                    {
                        name: "There are no open applications!",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = applications.filter((m) => m.name.toLowerCase().includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: m.name,
                value: m._id,
            }))
                .slice(0, 25));
        }
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "APPLICATION_PENDING_CHECKS"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const application = await (0, getServer_1.getServerApplication)(interaction.options.getString("application", true), interaction.guildId);
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
        const checks = await (0, performChecks_1.performApplicationChecks)(applicationTyped, interaction.member, true);
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
exports.default = command;
//# sourceMappingURL=apply.js.map
//# debugId=d58f18a5-04d9-5eb0-84dd-6062cd4819c0
