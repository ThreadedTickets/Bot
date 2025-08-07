import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Guild,
  Interaction,
  Message,
  OverwriteData,
  PermissionResolvable,
  PermissionsBitField,
  TextChannel,
  User,
} from "discord.js";
import { registerHook } from "../../..";
import { TicketFormResponse, TicketTrigger } from "../../../../../types/Ticket";
import { TicketSchema } from "../../../../../database/modals/Ticket";
import { generateId } from "../../../../database/generateId";
import { fetchChannelById } from "../../../../bot/fetchMessage";
import { onError } from "../../../../onError";
import { Locale } from "../../../../../types/Locale";
import { t } from "../../../../../lang";
import {
  resolveDiscordMessagePlaceholders,
  resolvePlaceholders,
} from "../../../../message/placeholders/resolvePlaceholders";
import { generateBasePlaceholderContext } from "../../../../message/placeholders/generateBaseContext";
import {
  getServer,
  getServerGroupsByIds,
  getServerMessage,
} from "../../../../bot/getServer";
import serverMessageToDiscordMessage from "../../../../formatters/serverMessageToDiscordMessage";
import { buildQAMessages } from "../../applications/end/sendToSubmissionChannel";
import {
  getAvailableLogChannel,
  postLogToWebhook,
} from "../../../../bot/sendLogToWebhook";
import colours from "../../../../../constants/colours";
import { TicketChannelManager } from "../../../../bot/TicketChannelManager";
import ticketOwnerPermissions from "../../../../../constants/ticketOwnerPermissions";
import everyoneTicketPermissions from "../../../../../constants/everyoneTicketPermissions";
import botTicketPermissions from "../../../../../constants/botTicketPermissions";
import { invalidateCache } from "../../../../database/invalidateCache";
import { getGuildMember } from "../../../../bot/getGuildMember";
import logger from "../../../../logger";

registerHook(
  "TicketCreate",
  async ({
    trigger,
    guild,
    owner,
    responses,
    messageOrInteraction,
    client,
    lang,
    user,
  }: {
    client: Client;
    trigger: TicketTrigger;
    guild: Guild;
    responses: TicketFormResponse[];
    owner: string;
    messageOrInteraction: Message | Interaction;
    lang: Locale;
    user: User;
  }) => {
    const id = generateId("TK");
    const parentChannel = await fetchChannelById(
      client,
      trigger.openChannel
        ? trigger.openChannel
        : trigger.isThread
        ? messageOrInteraction.channelId
        : null
    );

    // We know this wont be an issue as the components make it non-empty
    const fetchedMessage = await getServerMessage(trigger.message, guild.id);
    const components = [
      new ButtonBuilder()
        .setLabel(t(lang, "TICKET_PIN_MESSAGE_COMPONENTS_CLOSE"))
        .setCustomId(`close:${id}`)
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setLabel(t(lang, "TICKET_PIN_MESSAGE_COMPONENTS_LOCK"))
        .setCustomId(`lock:${id}`)
        .setStyle(ButtonStyle.Secondary),
    ];

    if (trigger.allowRaising) {
      components.push(
        new ButtonBuilder()
          .setLabel(
            t(
              lang,
              `TICKET_PIN_MESSAGE_COMPONENTS_${
                trigger.defaultToRaised ? "LOWER" : "RAISE"
              }`
            )
          )
          .setCustomId(`${trigger.defaultToRaised ? "lower" : "raise"}:${id}`)
          .setStyle(ButtonStyle.Secondary)
      );
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(...components)
      .toJSON();

    const startMessage = {
      ...(fetchedMessage
        ? { ...serverMessageToDiscordMessage(fetchedMessage) }
        : {}),
      components: [actionRow],
    };

    const groups = await getServerGroupsByIds(trigger.groups, guild.id);
    const groupMentionableString = groups
      .map((g) =>
        [
          ...g.roles.map((r) => `<@&${r}>`),
          ...g.extraMembers.map((m) => `<@${m}>`),
        ].join(", ")
      )
      .join(", ");

    let ticketChannel = null;
    try {
      if (trigger.isThread && !parentChannel?.isTextBased())
        return returnError(
          new Error("Incorrect channel type for threads"),
          messageOrInteraction,
          "ERROR_CODE_2015",
          lang
        );
      else if (trigger.isThread) {
        const channel: TextChannel = parentChannel! as TextChannel;
        ticketChannel = await channel.threads.create({
          name: resolvePlaceholders(
            trigger.channelNameFormat,
            generateBasePlaceholderContext({ server: guild, user: user })
          ),
          invitable: false,
          type: ChannelType.PrivateThread,
          reason: `Creating ticket: ${trigger._id}`,
        });
      } else if (
        !trigger.isThread &&
        parentChannel &&
        parentChannel.type !== ChannelType.GuildCategory
      ) {
        return returnError(
          new Error("Incorrect channel type for channel tickets"),
          messageOrInteraction,
          "ERROR_CODE_2015",
          lang
        );
      } else if (!trigger.isThread) {
        ticketChannel = await guild.channels.create({
          name: resolvePlaceholders(
            trigger.channelNameFormat,
            generateBasePlaceholderContext({ server: guild, user: user })
          ),
          parent: parentChannel?.id || null,
          type: ChannelType.GuildText,
          permissionOverwrites: buildChannelPermissionOverwrites(
            await getServerGroupsByIds(trigger.groups, guild.id),
            guild.id,
            {
              id: user.id,
              ...ticketOwnerPermissions,
            },
            everyoneTicketPermissions,
            { id: client.user!.id, ...botTicketPermissions }
          ),
        });
      }
    } catch (error) {
      return returnError(
        new Error(`Failed to create ticket channel: ${error}`),
        messageOrInteraction,
        "ERROR_CODE_2015",
        lang
      );
    }
    if (!ticketChannel)
      return returnError(
        new Error("Failed to create ticket channel"),
        messageOrInteraction,
        "ERROR_CODE_2015",
        lang
      );

    // Next most important thing is the DB
    await TicketSchema.create({
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
      categoriesAvailableToMoveTicketsTo:
        trigger.categoriesAvailableToMoveTicketsTo,
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

    invalidateCache(`tickets:${trigger.server}:${owner}:Open`);
    invalidateCache(`tickets:${trigger.server}:Open`);

    await new TicketChannelManager().add(
      ticketChannel.id,
      id,
      trigger.takeTranscripts,
      trigger.hideUsersInTranscript,
      trigger.allowAutoresponders
    );

    /**
     * Now we can send all the messages,
     * 1. Form responses
     * 2. Header info
     * 3. Pings
     */
    if (responses.length) {
      const QAMessages = buildQAMessages(responses);
      for (const message of QAMessages) {
        ticketChannel.send(message).catch((err) => {
          logger.warn(
            `Failed to send form response message on ticket open`,
            err
          );
        });
      }
    }
    const infoHeader = await ticketChannel
      .send(
        resolveDiscordMessagePlaceholders(startMessage, {
          ...generateBasePlaceholderContext({
            server: guild,
            user: user,
            member: await getGuildMember(client, guild.id, user.id),
            channel: ticketChannel,
          }),
        })
      )
      .catch((err) => {
        logger.warn(`Failed to send info header on ticket open`, err);
      });
    if (infoHeader)
      infoHeader.pin().catch((err) => {
        logger.warn(`Failed to pin info header on ticket open`, err);
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
      logger.warn(`Failed to send mentionable string on ticket open`, err);
    });

    const confirmContent = {
      content: t(lang, "TICKET_CREATE_DONE"),
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setURL(
              `discord://discord.com/channels/${guild.id}/${ticketChannel.id}`
            )
            .setStyle(ButtonStyle.Link)
            .setLabel(t(lang, "TICKET_CREATE_BUTTON_LABEL"))
        ),
      ],
    };
    if ("edit" in messageOrInteraction)
      messageOrInteraction.edit(confirmContent).catch(() => {});
    else if ("editReply" in messageOrInteraction)
      messageOrInteraction.editReply(confirmContent).catch(() => {});

    const server = await getServer(guild.id);
    const logChannel = getAvailableLogChannel(
      server.settings.logging,
      "tickets.open"
    );
    if (!logChannel) return;

    await postLogToWebhook(
      client,
      {
        channel: logChannel.channel!,
        enabled: logChannel.enabled,
        webhook: logChannel.webhook!,
      },
      {
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(server.preferredLanguage, "NEW_TICKET_LOG_TITLE"),
            description: t(server.preferredLanguage, `NEW_TICKET_LOG_BODY`, {
              user: `<@${owner}>`,
              trigger: trigger.label,
            }),
          },
        ],
      }
    );
  }
);

async function returnError(
  error: Error,
  replyable: Message | Interaction,
  key: string,
  locale: Locale
) {
  const message = (
    await onError(error, {
      stack: error.stack,
    })
  ).discordMsg;

  if ("editReply" in replyable) replyable.editReply(message);
  else if ("edit" in replyable) replyable.edit(message);
}

const validSnowflake = (id: string): boolean => /^\d{17,20}$/.test(id);

export function buildChannelPermissionOverwrites(
  groups: any[],
  guildId: string,
  ticketOwner?: {
    id: string;
    allow: PermissionResolvable[];
    deny: PermissionResolvable[];
  },
  defaultEveryone?: {
    allow: PermissionResolvable[];
    deny: PermissionResolvable[];
  },
  botPermissions?: {
    id: string;
    allow: PermissionResolvable[];
    deny: PermissionResolvable[];
  }
): OverwriteData[] {
  const map = new Map<
    string,
    {
      allow: Set<PermissionResolvable>;
      deny: Set<PermissionResolvable>;
      type: 0 | 1;
      priority: number;
    }
  >();

  // Add group-based permissions
  for (const group of groups) {
    const ids = [
      ...group.roles.map((id: string) => ({ id, type: 0 as const })),
      ...group.extraMembers.map((id: string) => ({ id, type: 1 as const })),
    ];

    const perms = group.permissions?.tickets?.channelPermissions ?? {
      allow: [],
      deny: [],
    };

    for (const { id, type } of ids) {
      if (!validSnowflake(id)) continue;

      if (!map.has(id)) {
        map.set(id, {
          allow: new Set<PermissionResolvable>(),
          deny: new Set<PermissionResolvable>(),
          type,
          priority: type === 0 ? 1 : 2, // roles: 1, members: 2
        });
      }

      const entry = map.get(id)!;

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

  const overwrites: OverwriteData[] = [];

  for (const [id, { allow, deny, type }] of sorted.slice(0, 100)) {
    overwrites.push({
      id,
      type,
      allow: PermissionsBitField.resolve([...allow] as PermissionResolvable[]),
      deny: PermissionsBitField.resolve([...deny] as PermissionResolvable[]),
    });
  }

  const dropped = sorted.length - overwrites.length;
  if (dropped > 0) {
    logger.warn(
      `Dropped ${dropped} permission overwrites due to Discord's 100-overwrite limit on ticket open`
    );
  }

  return overwrites;
}
