"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../../lang");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const date_1 = require("../../../utils/formatters/date");
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("transcript")
        .setDescription("Get a ticket transcript")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("ticket")
        .setDescription("The ticket to view the transcript of")
        .setRequired(true)
        .setAutocomplete(true)),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "ticket") {
            const focusedValue = interaction.options.getString("ticket", true);
            const tickets = await (0, getServer_1.getTickets)(interaction.guildId, ["Closed"]);
            if (!tickets.length) {
                interaction.respond([
                    {
                        name: "There are no closed tickets",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = tickets.filter((m) => m._id.toLowerCase().includes(focusedValue.toLowerCase()) ||
                m.owner.includes(focusedValue.toLowerCase()));
            interaction.respond(filtered
                .map((m) => ({
                name: `[${(0, date_1.formatDate)(m.createdAt, "DD/MM/YY")}] [${m.owner}] ${m._id}`.slice(0, 100),
                value: m._id,
            }))
                .slice(0, 25));
        }
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        const ticketId = interaction.options.getString("ticket", true);
        if (!ticketId)
            return interaction.reply((await (0, onError_1.onError)(new Error("Transcript not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const ticket = await (0, getServer_1.getTicket)(ticketId, interaction.guildId);
        if (!ticket)
            return interaction.reply((await (0, onError_1.onError)(new Error("Transcript not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (((ticket.isRaised && !userPermissions.tickets.canViewLockedTranscripts) ||
            (!ticket.isRaised && !userPermissions.tickets.canViewTranscripts)) &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.reply((await (0, onError_1.onError)(new Error("Missing view permission"), {
                ticketId: ticketId,
            })).discordMsg);
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const transcriptPath = path_1.default.join(process.cwd(), "transcripts", `${ticket.isRaised ? "LOCKED_" : ""}${ticketId}.html`);
        if (!fs_1.default.existsSync(transcriptPath))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Transcript not found"), {
                ticketId: ticketId,
                path: transcriptPath,
            })).discordMsg);
        interaction
            .editReply({
            content: "",
            files: [transcriptPath],
        })
            .catch(async (err) => {
            interaction.editReply((await (0, onError_1.onError)(err, {
                ticketId: ticketId,
                path: transcriptPath,
            })).discordMsg);
        });
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/transcript.js.map