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
const TicketChannelManager_1 = require("../../../utils/bot/TicketChannelManager");
const fetchMessage_1 = require("../../../utils/bot/fetchMessage");
const main_1 = require("../../../utils/hooks/events/tickets/new/main");
const ticketOwnerPermissions_1 = __importDefault(require("../../../constants/ticketOwnerPermissions"));
const ticketOwnerPermissionsClosed_1 = __importDefault(require("../../../constants/ticketOwnerPermissionsClosed"));
const everyoneTicketPermissions_1 = __importDefault(require("../../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../../constants/botTicketPermissions"));
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("move")
        .setDescription("Move this ticket")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((opt) => opt
        .setName("channel")
        .setDescription("The channel to move this ticket to")
        .setRequired(true)
        .setAutocomplete(true)),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "channel") {
            const focusedValue = interaction.options.getString("channel", true);
            const ticketId = await new TicketChannelManager_1.TicketChannelManager().getTicketId(interaction.channelId);
            if (!ticketId) {
                interaction.respond([
                    {
                        name: "This is not a ticket that can be moved",
                        value: "",
                    },
                ]);
                return;
            }
            const ticket = await (0, getServer_1.getTicketTrust)(ticketId);
            const channels = await Promise.all(ticket.categoriesAvailableToMoveTicketsTo
                .map(async (c) => await (0, fetchMessage_1.fetchChannelById)(client, c))
                .filter(async (c) => (await c)?.type === discord_js_1.ChannelType.GuildCategory));
            if (!channels.length) {
                interaction.respond([
                    {
                        name: "No channels available",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = channels.filter((c) => c.name
                .toLowerCase()
                .includes(focusedValue.toLowerCase()));
            const map = filtered
                .map((c) => ({
                name: c.name.slice(0, 100) ?? "Unknown",
                value: c.id,
            }))
                .slice(0, 25);
            interaction.respond(map);
        }
    },
    async execute(client, data, interaction) {
        if (!interaction.guildId)
            return;
        await interaction.reply({
            content: (0, lang_1.t)(data.lang, "THINK"),
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        const ticketId = await new TicketChannelManager_1.TicketChannelManager().getTicketId(interaction.channelId);
        if (!ticketId)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const ticket = await (0, getServer_1.getTicketTrust)(ticketId);
        if (!ticket)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        const ticketChannel = interaction.channel;
        if (ticketChannel.isThread() || !ticketChannel.isTextBased())
            return interaction.editReply((await (0, onError_1.onError)(new Error("Ticket can't move"), {
                ticketId: ticketId,
            })).discordMsg);
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        if (!userPermissions.tickets.canMove &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error("Missing move permission"), {
                ticketId: ticketId,
            })).discordMsg);
        const newParentId = interaction.options.getString("channel", true);
        const newParent = await (0, fetchMessage_1.fetchChannelById)(client, newParentId);
        if (!newParent || newParent?.type !== discord_js_1.ChannelType.GuildCategory)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Invalid channel type"), {
                ticketId: ticketId,
            })).discordMsg);
        ticketChannel
            .edit({ parent: newParent.id })
            .then(async () => {
            if (ticket.syncChannelPermissionsWhenMoved) {
                ticketChannel.edit({
                    permissionOverwrites: [
                        ...newParent.permissionOverwrites.cache.map((overwrite) => {
                            return {
                                id: overwrite.id,
                                type: overwrite.type,
                                allow: overwrite.allow.toArray(),
                                deny: overwrite.deny.toArray(),
                            };
                        }),
                        ...(0, main_1.buildChannelPermissionOverwrites)([], interaction.guildId, {
                            id: ticket.owner,
                            ...(ticket.status === "Open"
                                ? ticketOwnerPermissions_1.default
                                : ticketOwnerPermissionsClosed_1.default),
                        }, everyoneTicketPermissions_1.default, { id: client.user.id, ...botTicketPermissions_1.default }),
                    ].slice(0, 100),
                });
            }
        });
        interaction.editReply({
            content: (0, lang_1.t)(data.lang, "TICKET_MOVED"),
        });
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/move.js.map