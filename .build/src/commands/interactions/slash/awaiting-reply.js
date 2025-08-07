"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="90a39b8b-d2a9-5fb9-b6f8-60437d70d06b")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lang_1 = require("../../../lang");
const TicketChannelManager_1 = require("../../../utils/bot/TicketChannelManager");
const getServer_1 = require("../../../utils/bot/getServer");
const onError_1 = require("../../../utils/onError");
const calculateUserPermissions_1 = require("../../../utils/calculateUserPermissions");
const sendDirectMessage_1 = require("../../../utils/bot/sendDirectMessage");
const colours_1 = __importDefault(require("../../../constants/colours"));
const duration_1 = require("../../../utils/formatters/duration");
const __1 = require("../../..");
const logger_1 = __importDefault(require("../../../utils/logger"));
const command = {
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("awaiting-reply")
        .setDescription("A friendly reminder to a user to respond to a ticket")
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .addStringOption((o) => o
        .setName("message")
        .setDescription("Attach a short message")
        .setMaxLength(250))
        .addStringOption((o) => o
        .setName("action")
        .setDescription("What action should be taken if there is no response?")
        .addChoices([
        {
            name: "Close the ticket",
            value: "close",
        },
        {
            name: "Lock the ticket",
            value: "lock",
        },
        {
            name: "Nothing (Default)",
            value: "nothing",
        },
    ]))
        .addStringOption((o) => o
        .setName("time")
        .setDescription("How long should the user have to respond?")
        .addChoices([
        {
            name: "1 hour",
            value: "1h",
        },
        {
            name: "2 hours",
            value: "2h",
        },
        {
            name: "6 hours",
            value: "6h",
        },
        {
            name: "12 hours",
            value: "12h",
        },
        {
            name: "24 hours (Default)",
            value: "24h",
        },
        {
            name: "2 days",
            value: "48h",
        },
        {
            name: "3 days",
            value: "72h",
        },
    ]))
        .addStringOption((o) => o
        .setName("notify")
        .setDescription("Do you want to be notified when the user responds?")
        .addChoices([
        {
            name: "Yes (Default)",
            value: "true",
        },
        {
            name: "No",
            value: "false",
        },
    ])),
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
        if (await __1.TaskScheduler.taskExists(`AWAIT-${ticketId}`))
            return interaction.editReply({
                content: (0, lang_1.t)(data.lang, "TICKET_ALREADY_AWAITING"),
                components: [
                    new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId(`cancelAwait:${ticketId}`)
                        .setLabel((0, lang_1.t)(data.lang, "CANCEL"))
                        .setStyle(discord_js_1.ButtonStyle.Danger)),
                ],
            });
        const ticket = await (0, getServer_1.getTicket)(ticketId, interaction.guildId);
        if (!ticket)
            return interaction.editReply((await (0, onError_1.onError)(new Error("Ticket not found"), {
                ticketId: ticketId,
            })).discordMsg);
        if (ticket.owner === interaction.user.id)
            return interaction.editReply({
                content: (0, lang_1.t)(data.lang, "NO_ACTION_SELF"),
            });
        if (ticket.status !== "Open")
            return interaction.editReply({
                content: (0, lang_1.t)(data.lang, "TICKET_NOT_OPEN"),
            });
        const userPermissions = (0, calculateUserPermissions_1.getUserPermissions)(interaction.member, await (0, getServer_1.getServerGroupsByIds)(ticket.groups, interaction.guildId));
        const message = interaction.options.getString("message");
        const action = interaction.options.getString("action") || "nothing";
        const time = (0, duration_1.parseDurationToMs)(interaction.options.getString("time") || "24h");
        const futureTime = Math.round(new Date().setMilliseconds(new Date().getMilliseconds() + time) / 1000);
        const notify = interaction.options.getString("notify")
            ? interaction.options.getString("notify") === "true"
                ? interaction.user.id
                : null
            : interaction.user.id;
        if (((action === "lock" && !userPermissions.tickets.canLock) ||
            (action === "close" && !userPermissions.tickets.canClose)) &&
            !interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild))
            return interaction.editReply((await (0, onError_1.onError)(new Error(`Missing ${action} permission`), {
                ticketId: ticketId,
            })).discordMsg);
        const dm = await (0, sendDirectMessage_1.sendDirectMessage)(client, ticket.owner, {
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor(parseInt(colours_1.default.primary, 16))
                    .setDescription(`Hey! The support team in **${interaction.guild.name}** have responded to [your ticket](${interaction.channel.url}) and require a reply.${action !== "nothing"
                    ? `\n-# If you do not respond <t:${futureTime}:R> then your ticket will be ${action === "close" ? "closed" : "locked"}.`
                    : ""}`)
                    .setFields(message
                    ? [
                        {
                            name: "Message from support team",
                            value: `\`\`\`\n${message}\n\`\`\``,
                        },
                    ]
                    : []),
            ],
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setURL(interaction.channel.url)
                    .setStyle(discord_js_1.ButtonStyle.Link)
                    .setLabel("Respond in ticket")),
            ],
        });
        const dmSent = dm !== null;
        __1.TaskScheduler.scheduleTask("awaitingReply", { ticketId, action, notify, serverId: interaction.guildId }, time, `AWAIT-${ticketId}`);
        logger_1.default.debug(`Scheduled await-reply task on ${ticketId}`);
        const msg = {
            content: (0, lang_1.t)(data.lang, "TICKET_AWAIT_REQUEST_DONE", {
                time: `<t:${futureTime}:R>`,
                action: action === "close"
                    ? "closed"
                    : action === "lock"
                        ? "locked"
                        : "ignored",
            }) + (dmSent ? "" : (0, lang_1.t)(data.lang, "UNABLE_TO_DM_TICKET_AWAIT")),
        };
        interaction.editReply(msg);
        interaction.channel.send({
            ...msg,
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`cancelAwait:${ticketId}`)
                    .setLabel((0, lang_1.t)(data.lang, "CANCEL"))
                    .setStyle(discord_js_1.ButtonStyle.Danger)),
            ],
        });
    },
};
exports.default = command;
//# sourceMappingURL=awaiting-reply.js.map
//# debugId=90a39b8b-d2a9-5fb9-b6f8-60437d70d06b
