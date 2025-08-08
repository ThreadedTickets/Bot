"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="264d0506-4be5-503f-ac31-7b548775b606")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChannelPermissionOverwrites = buildChannelPermissionOverwrites;
const discord_js_1 = require("discord.js");
const __1 = require("../../..");
const Ticket_1 = require("../../../../../database/modals/Ticket");
const generateId_1 = require("../../../../database/generateId");
const fetchMessage_1 = require("../../../../bot/fetchMessage");
const onError_1 = require("../../../../onError");
const lang_1 = require("../../../../../lang");
const resolvePlaceholders_1 = require("../../../../message/placeholders/resolvePlaceholders");
const generateBaseContext_1 = require("../../../../message/placeholders/generateBaseContext");
const getServer_1 = require("../../../../bot/getServer");
const serverMessageToDiscordMessage_1 = __importDefault(require("../../../../formatters/serverMessageToDiscordMessage"));
const sendToSubmissionChannel_1 = require("../../applications/end/sendToSubmissionChannel");
const sendLogToWebhook_1 = require("../../../../bot/sendLogToWebhook");
const colours_1 = __importDefault(require("../../../../../constants/colours"));
const TicketChannelManager_1 = require("../../../../bot/TicketChannelManager");
const ticketOwnerPermissions_1 = __importDefault(require("../../../../../constants/ticketOwnerPermissions"));
const everyoneTicketPermissions_1 = __importDefault(require("../../../../../constants/everyoneTicketPermissions"));
const botTicketPermissions_1 = __importDefault(require("../../../../../constants/botTicketPermissions"));
const invalidateCache_1 = require("../../../../database/invalidateCache");
const getGuildMember_1 = require("../../../../bot/getGuildMember");
const logger_1 = __importDefault(require("../../../../logger"));
(0, __1.registerHook)("TicketCreate", async ({ trigger, guild, owner, responses, messageOrInteraction, client, lang, user, }) => {
    const id = (0, generateId_1.generateId)("TK");
    const parentChannel = await (0, fetchMessage_1.fetchChannelById)(client, trigger.openChannel
        ? trigger.openChannel
        : trigger.isThread
            ? messageOrInteraction.channelId
            : null);
    // We know this wont be an issue as the components make it non-empty
    const fetchedMessage = await (0, getServer_1.getServerMessage)(trigger.message, guild.id);
    const components = [
        new discord_js_1.ButtonBuilder()
            .setLabel((0, lang_1.t)(lang, "TICKET_PIN_MESSAGE_COMPONENTS_CLOSE"))
            .setCustomId(`close:${id}`)
            .setStyle(discord_js_1.ButtonStyle.Danger),
        new discord_js_1.ButtonBuilder()
            .setLabel((0, lang_1.t)(lang, "TICKET_PIN_MESSAGE_COMPONENTS_LOCK"))
            .setCustomId(`lock:${id}`)
            .setStyle(discord_js_1.ButtonStyle.Secondary),
    ];
    if (trigger.allowRaising) {
        components.push(new discord_js_1.ButtonBuilder()
            .setLabel((0, lang_1.t)(lang, `TICKET_PIN_MESSAGE_COMPONENTS_${trigger.defaultToRaised ? "LOWER" : "RAISE"}`))
            .setCustomId(`${trigger.defaultToRaised ? "lower" : "raise"}:${id}`)
            .setStyle(discord_js_1.ButtonStyle.Secondary));
    }
    const actionRow = new discord_js_1.ActionRowBuilder()
        .setComponents(...components)
        .toJSON();
    const startMessage = {
        ...(fetchedMessage
            ? { ...(0, serverMessageToDiscordMessage_1.default)(fetchedMessage) }
            : {}),
        components: [actionRow],
    };
    const groups = await (0, getServer_1.getServerGroupsByIds)(trigger.groups, guild.id);
    const groupMentionableString = groups
        .map((g) => [
        ...g.roles.map((r) => `<@&${r}>`),
        ...g.extraMembers.map((m) => `<@${m}>`),
    ].join(", "))
        .join(", ");
    let ticketChannel = null;
    try {
        if (trigger.isThread && !parentChannel?.isTextBased())
            return returnError(new Error("Incorrect channel type for threads"), messageOrInteraction, "ERROR_CODE_2015", lang);
        else if (trigger.isThread) {
            const channel = parentChannel;
            ticketChannel = await channel.threads.create({
                name: (0, resolvePlaceholders_1.resolvePlaceholders)(trigger.channelNameFormat, (0, generateBaseContext_1.generateBasePlaceholderContext)({ server: guild, user: user })),
                invitable: false,
                type: discord_js_1.ChannelType.PrivateThread,
                reason: `Creating ticket: ${trigger._id}`,
            });
        }
        else if (!trigger.isThread &&
            parentChannel &&
            parentChannel.type !== discord_js_1.ChannelType.GuildCategory) {
            return returnError(new Error("Incorrect channel type for channel tickets"), messageOrInteraction, "ERROR_CODE_2015", lang);
        }
        else if (!trigger.isThread) {
            ticketChannel = await guild.channels.create({
                name: (0, resolvePlaceholders_1.resolvePlaceholders)(trigger.channelNameFormat, (0, generateBaseContext_1.generateBasePlaceholderContext)({ server: guild, user: user })),
                parent: parentChannel?.id || null,
                type: discord_js_1.ChannelType.GuildText,
                permissionOverwrites: buildChannelPermissionOverwrites(await (0, getServer_1.getServerGroupsByIds)(trigger.groups, guild.id), guild.id, {
                    id: user.id,
                    ...ticketOwnerPermissions_1.default,
                }, everyoneTicketPermissions_1.default, { id: client.user.id, ...botTicketPermissions_1.default }),
            });
        }
    }
    catch (error) {
        return returnError(new Error(`Failed to create ticket channel: ${error}`), messageOrInteraction, "ERROR_CODE_2015", lang);
    }
    if (!ticketChannel)
        return returnError(new Error("Failed to create ticket channel"), messageOrInteraction, "ERROR_CODE_2015", lang);
    // Next most important thing is the DB
    await Ticket_1.TicketSchema.create({
        _id: id,
        owner: owner,
        server: guild.id,
        status: "Open",
        responses: responses,
        trigger: trigger._id,
        isRaised: trigger.defaultToRaised,
        allowRaising: trigger.allowRaising,
        allowReopening: trigger.allowReopening,
        addRolesOnClose: trigger.addRolesOnClose,
        addRolesOnOpen: trigger.addRolesOnOpen,
        allowAutoResponders: trigger.allowAutoresponders,
        categoriesAvailableToMoveTicketsTo: trigger.categoriesAvailableToMoveTicketsTo,
        closeChannel: trigger.closeChannel,
        closeOnLeave: trigger.closeOnLeave,
        groups: trigger.groups,
        removeRolesOnClose: trigger.removeRolesOnClose,
        removeRolesOnOpen: trigger.removeRolesOnOpen,
        syncChannelPermissionsWhenMoved: trigger.syncChannelPermissionsWhenMoved,
        takeTranscripts: trigger.takeTranscripts,
        channel: ticketChannel.id,
        createdAt: new Date(),
        dmOnClose: trigger.dmOnClose ?? null,
    });
    (0, invalidateCache_1.invalidateCache)(`tickets:${trigger.server}:${owner}:Open`);
    (0, invalidateCache_1.invalidateCache)(`tickets:${trigger.server}:Open`);
    await new TicketChannelManager_1.TicketChannelManager().add(ticketChannel.id, id, trigger.takeTranscripts, trigger.hideUsersInTranscript, trigger.allowAutoresponders, owner);
    /**
     * Now we can send all the messages,
     * 1. Form responses
     * 2. Header info
     * 3. Pings
     */
    if (responses.length) {
        const QAMessages = (0, sendToSubmissionChannel_1.buildQAMessages)(responses);
        for (const message of QAMessages) {
            ticketChannel.send(message).catch((err) => {
                logger_1.default.warn(`Failed to send form response message on ticket open`, err);
            });
        }
    }
    const infoHeader = await ticketChannel
        .send((0, resolvePlaceholders_1.resolveDiscordMessagePlaceholders)(startMessage, {
        ...(0, generateBaseContext_1.generateBasePlaceholderContext)({
            server: guild,
            user: user,
            member: await (0, getGuildMember_1.getGuildMember)(client, guild.id, user.id),
            channel: ticketChannel,
        }),
    }))
        .catch((err) => {
        logger_1.default.warn(`Failed to send info header on ticket open`, err);
    });
    if (infoHeader)
        infoHeader.pin().catch((err) => {
            logger_1.default.warn(`Failed to pin info header on ticket open`, err);
        });
    let finalMentionableString = trigger.notifyStaff
        .map((r) => `<@&${r}>`)
        .filter(Boolean) // remove falsy values
        .join(", ");
    if (ticketChannel.isThread()) {
        finalMentionableString = [finalMentionableString, groupMentionableString]
            .filter(Boolean) // remove empty strings
            .join(", ")
            .slice(0, 2000);
    }
    const mentionParts = [finalMentionableString, `<@${user.id}>`]
        .filter(Boolean) // again, remove empty entries
        .join(", ");
    ticketChannel.send(mentionParts).catch((err) => {
        logger_1.default.warn(`Failed to send mentionable string on ticket open`, err);
    });
    const confirmContent = {
        content: (0, lang_1.t)(lang, "TICKET_CREATE_DONE"),
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setURL(`discord://discord.com/channels/${guild.id}/${ticketChannel.id}`)
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel((0, lang_1.t)(lang, "TICKET_CREATE_BUTTON_LABEL"))),
        ],
    };
    if ("edit" in messageOrInteraction)
        messageOrInteraction.edit(confirmContent).catch(() => { });
    else if ("editReply" in messageOrInteraction)
        messageOrInteraction.editReply(confirmContent).catch(() => { });
    const server = await (0, getServer_1.getServer)(guild.id);
    const logChannel = (0, sendLogToWebhook_1.getAvailableLogChannel)(server.settings.logging, "tickets.open");
    if (!logChannel)
        return;
    await (0, sendLogToWebhook_1.postLogToWebhook)(client, {
        channel: logChannel.channel,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook,
    }, {
        embeds: [
            {
                color: parseInt(colours_1.default.info, 16),
                title: (0, lang_1.t)(server.preferredLanguage, "NEW_TICKET_LOG_TITLE"),
                description: (0, lang_1.t)(server.preferredLanguage, `NEW_TICKET_LOG_BODY`, {
                    user: `<@${owner}>`,
                    trigger: trigger.label,
                }),
            },
        ],
    });
});
async function returnError(error, replyable, key, locale) {
    const message = (await (0, onError_1.onError)(error, {
        stack: error.stack,
    })).discordMsg;
    if ("editReply" in replyable)
        replyable.editReply(message);
    else if ("edit" in replyable)
        replyable.edit(message);
}
const validSnowflake = (id) => /^\d{17,20}$/.test(id);
function buildChannelPermissionOverwrites(groups, guildId, ticketOwner, defaultEveryone, botPermissions) {
    const map = new Map();
    // Add group-based permissions
    for (const group of groups) {
        const ids = [
            ...group.roles.map((id) => ({ id, type: 0 })),
            ...group.extraMembers.map((id) => ({ id, type: 1 })),
        ];
        const perms = group.permissions?.tickets?.channelPermissions ?? {
            allow: [],
            deny: [],
        };
        for (const { id, type } of ids) {
            if (!validSnowflake(id))
                continue;
            if (!map.has(id)) {
                map.set(id, {
                    allow: new Set(),
                    deny: new Set(),
                    type,
                    priority: type === 0 ? 1 : 2, // roles: 1, members: 2
                });
            }
            const entry = map.get(id);
            for (const perm of perms.allow) {
                entry.allow.add(perm);
                entry.deny.delete(perm);
            }
            for (const perm of perms.deny) {
                if (!entry.allow.has(perm)) {
                    entry.deny.add(perm);
                }
            }
        }
    }
    // Add ticket owner with highest priority
    if (botPermissions && validSnowflake(botPermissions.id)) {
        map.set(botPermissions.id, {
            allow: new Set(botPermissions.allow),
            deny: new Set(botPermissions.deny),
            type: 1,
            priority: -2, // highest priority
        });
    }
    if (ticketOwner && validSnowflake(ticketOwner.id)) {
        map.set(ticketOwner.id, {
            allow: new Set(ticketOwner.allow),
            deny: new Set(ticketOwner.deny),
            type: 1,
            priority: -1, // highest priority
        });
    }
    // Ensure @everyone (guildId) has an entry if not already present
    if (!map.has(guildId) && defaultEveryone) {
        map.set(guildId, {
            allow: new Set(defaultEveryone.allow),
            deny: new Set(defaultEveryone.deny),
            type: 0,
            priority: 0, // @everyone priority
        });
    }
    const entries = Array.from(map.entries());
    // Sort entries by priority: ticketOwner (-1), @everyone (0), roles (1), members (2)
    const sorted = entries.sort((a, b) => a[1].priority - b[1].priority);
    const overwrites = [];
    for (const [id, { allow, deny, type }] of sorted.slice(0, 100)) {
        overwrites.push({
            id,
            type,
            allow: discord_js_1.PermissionsBitField.resolve([...allow]),
            deny: discord_js_1.PermissionsBitField.resolve([...deny]),
        });
    }
    const dropped = sorted.length - overwrites.length;
    if (dropped > 0) {
        logger_1.default.warn(`Dropped ${dropped} permission overwrites due to Discord's 100-overwrite limit on ticket open`);
    }
    return overwrites;
}
//# sourceMappingURL=/src/utils/hooks/events/tickets/new/main.js.map
//# debugId=264d0506-4be5-503f-ac31-7b548775b606
