"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="bb0201fd-1527-5400-ae96-fe27112148b5")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const getServer_1 = require("../../utils/bot/getServer");
const onError_1 = require("../../utils/onError");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const discord_js_1 = require("discord.js");
const generateReasonModal_1 = require("../../utils/bot/generateReasonModal");
const button = {
    customId: "rejApp",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const [, applicationId, owner] = interaction.customId.split(":");
        const application = await (0, getServer_1.getCompletedApplication)(applicationId, owner);
        if (!application)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application attempt not found"))).discordMsg);
        if (application.status !== "Pending")
            return interaction.reply((await (0, onError_1.onError)(new Error("Application already responded"), {
                id: applicationId,
            })).discordMsg);
        const applicationTrigger = await (0, getServer_1.getServerApplication)(application.application, interaction.guildId);
        if (!applicationTrigger)
            return interaction.reply((await (0, onError_1.onError)(new Error("Application not found"))).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(applicationTrigger.groups, interaction.guildId));
        if (!userPermissions.applications.respond &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing respond permission"))).discordMsg);
        return interaction.showModal((0, generateReasonModal_1.generateReasonModal)(interaction.customId, false));
    },
};
exports.default = button;
//# sourceMappingURL=/src/interactions/buttons/rejectApp.js.map
//# debugId=bb0201fd-1527-5400-ae96-fe27112148b5
