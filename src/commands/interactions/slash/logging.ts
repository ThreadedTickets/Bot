import {
  ChannelType,
  ClientUser,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import { onError } from "../../../utils/onError";
import { getServer } from "../../../utils/bot/getServer";
import { t } from "../../../lang";
import { deleteWebhookByUrl } from "../../../utils/bot/deleteWebhook";
import { getOrCreateWebhook } from "../../../utils/bot/getOrCreateWebhook";
import {
  LogConfig,
  postLogToWebhook,
} from "../../../utils/bot/sendLogToWebhook";
import colours from "../../../constants/colours";
import { updateServerCache } from "../../../utils/bot/updateServerCache";
export interface LogChannel {
  enabled: boolean;
  channel: string | null;
  webhook: string | null;
}

export interface LoggingSettings {
  general: LogChannel;
  tickets: {
    feedback: LogChannel;
    open: LogChannel;
    close: LogChannel;
    lock: LogChannel;
    unlock: LogChannel;
    raise: LogChannel;
    lower: LogChannel;
    move: LogChannel;
    transcripts: LogChannel;
  };
  applications: {
    create: LogChannel;
    approve: LogChannel;
    reject: LogChannel;
    delete: LogChannel;
  };
}

export type LoggingGroup = "tickets" | "applications";
export type TicketSubcommand =
  | "feedback"
  | "open"
  | "close"
  | "lock"
  | "unlock"
  | "raise"
  | "lower"
  | "move"
  | "transcripts";
export type ApplicationSubcommand = "create" | "approve" | "reject" | "delete";

export type Subcommand = "general" | TicketSubcommand | ApplicationSubcommand;

export function getLogConfig(
  settings: LoggingSettings,
  group: LoggingGroup | "general",
  subcommand: Subcommand
): LogChannel | null {
  if (subcommand === "general") {
    return settings.general;
  }

  const section = settings[group];
  if (!section) return null;

  return (section as Record<string, LogChannel>)[subcommand] ?? null;
}

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("logging")
    .setDescription("Setup Threaded logging")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup((g) =>
      g
        .setName("tickets")
        .setDescription("Setup logging for tickets")
        .addSubcommand((cmd) =>
          cmd
            .setName("feedback")
            .setDescription("Set a log channel for ticket feedback")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("open")
            .setDescription("Set a log channel for ticket opening")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("close")
            .setDescription("Set a log channel for ticket closing")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("lock")
            .setDescription("Set a log channel for ticket locking")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("unlock")
            .setDescription("Set a log channel for ticket unlocking")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("raise")
            .setDescription("Set a log channel for ticket raising")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("lower")
            .setDescription("Set a log channel for ticket lowering")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("move")
            .setDescription("Set a log channel for ticket moving")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("transcripts")
            .setDescription("Set a log channel for ticket transcripts")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
    )
    .addSubcommandGroup((g) =>
      g
        .setName("applications")
        .setDescription("Setup logging for tickets")
        .addSubcommand((cmd) =>
          cmd
            .setName("create")
            .setDescription(
              "Set a log channel for when a new application is submitted"
            )
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("approve")
            .setDescription("Set a log channel when an application is approved")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("reject")
            .setDescription("Set a log channel when an application is rejected")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
        .addSubcommand((cmd) =>
          cmd
            .setName("delete")
            .setDescription("Set a log channel when an application is deleted")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .addChannelTypes(
                  ChannelType.AnnouncementThread,
                  ChannelType.GuildAnnouncement,
                  ChannelType.GuildText,
                  ChannelType.PrivateThread,
                  ChannelType.PublicThread
                )
                .setDescription(
                  "Choose a channel to assign (leave blank to clear)"
                )
                .setRequired(false)
            )
            .addStringOption((option) =>
              option
                .setName("status")
                .setDescription("Sets the status of this log event")
                .setRequired(false)
                .setChoices(
                  {
                    name: "Enabled",
                    value: "true",
                  },
                  {
                    name: "Disabled",
                    value: "false",
                  }
                )
            )
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("general")
        .setDescription(
          "Set the general log channel where all enabled events without a channel will appear"
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .addChannelTypes(
              ChannelType.AnnouncementThread,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildText,
              ChannelType.PrivateThread,
              ChannelType.PublicThread
            )
            .setDescription("Choose a channel to assign (leave blank to clear)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("status")
            .setDescription("Sets the status of this log event")
            .setRequired(false)
            .setChoices(
              {
                name: "Enabled",
                value: "true",
              },
              {
                name: "Disabled",
                value: "false",
              }
            )
        )
    )
    .addSubcommand((cmd) =>
      cmd.setName("view").setDescription("View your full logging configuration")
    ),

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();
    const server = await getServer(interaction.guildId);
    const lang = data.lang!;

    if (subcommand === "view")
      return interaction.reply({
        flags: [MessageFlags.Ephemeral],
        embeds: [
          {
            color: parseInt(colours.info, 16),
            title: t(lang, "LOG_COMMAND_VIEW_TITLE"),
            fields: [
              // General logging
              {
                name: t(lang, "LOG_COMMAND_VIEW_GENERAL_FIELD_NAME"),
                value: t(lang, "LOG_COMMAND_VIEW_GENERAL_FIELD_VALUE", {
                  general_logs: server.settings.logging.general.channel
                    ? `<#${server.settings.logging.general.channel}>`
                    : "-",
                  general_status: server.settings.logging.general.enabled
                    ? `🟢`
                    : "🔴",
                }),
              },
              // Ticket Logging
              {
                name: t(lang, "LOG_COMMAND_VIEW_TICKET_FIELD_NAME"),
                value: t(lang, "LOG_COMMAND_VIEW_TICKET_FIELD_VALUE", {
                  feedback_logs: server.settings.logging.tickets.feedback
                    .channel
                    ? `<#${server.settings.logging.tickets.feedback.channel}>`
                    : "-",
                  feedback_status: server.settings.logging.tickets.feedback
                    .enabled
                    ? `🟢`
                    : "🔴",
                  open_logs: server.settings.logging.tickets.open.channel
                    ? `<#${server.settings.logging.tickets.open.channel}>`
                    : "-",
                  open_status: server.settings.logging.tickets.open.enabled
                    ? `🟢`
                    : "🔴",
                  close_logs: server.settings.logging.tickets.close.channel
                    ? `<#${server.settings.logging.tickets.close.channel}>`
                    : "-",
                  close_status: server.settings.logging.tickets.close.enabled
                    ? `🟢`
                    : "🔴",
                  lock_logs: server.settings.logging.tickets.lock.channel
                    ? `<#${server.settings.logging.tickets.lock.channel}>`
                    : "-",
                  lock_status: server.settings.logging.tickets.lock.enabled
                    ? `🟢`
                    : "🔴",
                  unlock_logs: server.settings.logging.tickets.unlock.channel
                    ? `<#${server.settings.logging.tickets.unlock.channel}>`
                    : "-",
                  unlock_status: server.settings.logging.tickets.unlock.enabled
                    ? `🟢`
                    : "🔴",
                  raise_logs: server.settings.logging.tickets.raise.channel
                    ? `<#${server.settings.logging.tickets.raise.channel}>`
                    : "-",
                  raise_status: server.settings.logging.tickets.raise.enabled
                    ? `🟢`
                    : "🔴",
                  lower_logs: server.settings.logging.tickets.lower.channel
                    ? `<#${server.settings.logging.tickets.lower.channel}>`
                    : "-",
                  lower_status: server.settings.logging.tickets.lower.enabled
                    ? `🟢`
                    : "🔴",
                  move_logs: server.settings.logging.tickets.move.channel
                    ? `<#${server.settings.logging.tickets.move.channel}>`
                    : "-",
                  move_status: server.settings.logging.tickets.move.enabled
                    ? `🟢`
                    : "🔴",
                  transcript_logs: server.settings.logging.tickets.transcripts
                    .channel
                    ? `<#${server.settings.logging.tickets.transcripts.channel}>`
                    : "-",
                  transcript_status: server.settings.logging.tickets.transcripts
                    .enabled
                    ? `🟢`
                    : "🔴",
                }),
              },
              // Application Logging
              {
                name: t(lang, "LOG_COMMAND_VIEW_APPLICATION_FIELD_NAME"),
                value: t(lang, "LOG_COMMAND_VIEW_APPLICATION_FIELD_VALUE", {
                  create_logs: server.settings.logging.applications.create
                    .channel
                    ? `<#${server.settings.logging.applications.create.channel}>`
                    : "-",
                  create_status: server.settings.logging.applications.create
                    .enabled
                    ? `🟢`
                    : "🔴",
                  approve_logs: server.settings.logging.applications.approve
                    .channel
                    ? `<#${server.settings.logging.applications.approve.channel}>`
                    : "-",
                  approve_status: server.settings.logging.applications.approve
                    .enabled
                    ? `🟢`
                    : "🔴",
                  reject_logs: server.settings.logging.applications.create
                    .channel
                    ? `<#${server.settings.logging.applications.create.channel}>`
                    : "-",
                  reject_status: server.settings.logging.applications.reject
                    .enabled
                    ? `🟢`
                    : "🔴",
                  delete_logs: server.settings.logging.applications.delete
                    .channel
                    ? `<#${server.settings.logging.applications.delete.channel}>`
                    : "-",
                  delete_status: server.settings.logging.applications.delete
                    .enabled
                    ? `🟢`
                    : "🔴",
                }),
              },
            ],
          },
        ],
      });

    const channel = interaction.options.getChannel(
      "channel"
    ) as TextBasedChannel;
    const status = interaction.options.getString("status");

    const root = getLogConfig(
      server.settings.logging,
      subcommand === "general" ? "general" : (subcommandGroup! as LoggingGroup),
      subcommand as Subcommand
    );

    if (!root)
      return interaction.reply(
        (await onError(new Error("Can't find log category"))).discordMsg
      );

    if (!channel && !status)
      return interaction.reply(
        (await onError(new Error("Invalid usage"))).discordMsg
      );

    if (channel) {
      if (!channel || !channel.isTextBased()) {
        return interaction.reply(
          (await onError(new Error("Invalid channel type"))).discordMsg
        );
      }

      let webhookChannel = channel;
      let storedChannelId = channel.id;

      if (channel.isThread()) {
        if (!channel.parent || !channel.parent.isTextBased()) {
          return interaction.reply(
            (await onError(new Error("Invalid channel type"))).discordMsg
          );
        }
        webhookChannel = channel.parent;
        storedChannelId = channel.id;
      }

      root.channel = storedChannelId;
      root.enabled = status ? status === "true" : true;

      if (
        root.webhook &&
        !isWebhookUsedElsewhere(
          subcommand === "general"
            ? "general"
            : `${subcommandGroup}.${subcommand}`,
          root.webhook,
          server.settings.logging
        )
      ) {
        await deleteWebhookByUrl(root.webhook);
      }

      root.webhook = await getOrCreateWebhook(
        webhookChannel as TextChannel,
        client.user as ClientUser
      );

      interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `${t(
          lang,
          `LOG_CHANNEL_SET${root.enabled ? "_AND_ENABLED" : "_AND_DISABLED"}`
        )} ${
          root.enabled && root.webhook
            ? t(lang, "TEST_NOTIFICATION_ALSO_SENT")
            : ""
        }`,
      });

      if (root.webhook)
        postLogToWebhook(client, root as LogConfig, {
          embeds: [
            {
              color: parseInt(colours.success, 16),
              description: t(lang, "TEST_NOTIFICATION"),
            },
          ],
        });
    } else if (!channel && !status) {
      root.channel = null;
      root.enabled = false;

      if (
        root.webhook &&
        !isWebhookUsedElsewhere(
          subcommand === "general"
            ? "general"
            : `${subcommandGroup}.${subcommand}`,
          root.webhook,
          server.settings.logging
        )
      ) {
        await deleteWebhookByUrl(root.webhook);
      }

      root.webhook = null;

      interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `${t(lang, `LOG_CHANNEL_UNSET`)}`,
      });
    } else if (status) {
      root.enabled = status === "true";
      interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `${t(
          lang,
          `LOG_CHANNEL_${root.enabled ? "ENABLED" : "DISABLED"}`
        )}`,
      });
    }

    await server.save();
    await updateServerCache(interaction.guildId, server);
  },
};

export default command;

function isWebhookUsedElsewhere(
  currentKey: string,
  webhookUrl: string,
  loggingConfig: any
): boolean {
  for (const [typeKey, logTypes] of Object.entries(loggingConfig)) {
    if (typeof logTypes !== "object") continue;

    for (const [logKey, config] of Object.entries(
      logTypes as Record<string, any>
    )) {
      const key = `${typeKey}.${logKey}`;
      if (key === currentKey) continue;
      if (config?.webhook === webhookUrl) return true;
    }
  }

  return false;
}
