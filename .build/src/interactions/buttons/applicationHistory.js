"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a5f05dd5-4577-5593-9371-3f47f7ea3f7d")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../lang");
const getServer_1 = require("../../utils/bot/getServer");
const paginateStrings_1 = require("../../utils/formatters/paginateStrings");
const paginateWithButtons_1 = require("../../utils/paginateWithButtons");
const calculateUserPermissions_1 = require("../../utils/calculateUserPermissions");
const onError_1 = require("../../utils/onError");
const button = {
    customId: "appHistory",
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const [, applicationId, userId] = interaction.customId.split(":");
        const application = await (0, getServer_1.getServerApplication)(applicationId, interaction.guildId);
        if (!application)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Application not found"), {
                applicationId,
                guildId: interaction.guildId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(application.groups, interaction.guildId));
        if (!userPermissions.applications.manage &&
            !userPermissions.applications.respond &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing manage/respond permission")))
                .discordMsg);
        const allApplications = await (0, getServer_1.getUserCompletedApplications)(application._id, userId);
        const applicationHistoryStrings = allApplications
            .map((a) => `<t:${Math.round(new Date(a.createdAt).getTime() / 1000)}:f>\n> Attempt ID: \`${a._id}\`\n> Status: ${a.messageLink
            ? `[\`${a.status}\`](${a.messageLink})`
            : `\`${a.status}\``}\n`)
            .reverse();
        const paginatedMessages = (0, paginateStrings_1.paginateStrings)(applicationHistoryStrings, 5, `Applications for ${application?.name ?? "`Unknown application`"}`);
        await (0, paginateWithButtons_1.paginateWithButtons)(interaction.user.id, interaction, paginatedMessages);
    },
};
exports.default = button;
//# sourceMappingURL=applicationHistory.js.map
//# debugId=a5f05dd5-4577-5593-9371-3f47f7ea3f7d
