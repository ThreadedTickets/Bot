import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextBasedChannel,
  TextChannel,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerApplications,
  getServerGroups,
  getServerMessage,
  getServerMessages,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { t } from "../../../lang";
import { Locale } from "../../../types/Locale";
import { resolveDiscordMessagePlaceholders } from "../../../utils/message/placeholders/resolvePlaceholders";
import serverMessageToDiscordMessage from "../../../utils/formatters/serverMessageToDiscordMessage";
import { generateBasePlaceholderContext } from "../../../utils/message/placeholders/generateBaseContext";
import { logger } from "../../../utils/logger";
import { formatDuration } from "../../../utils/formatters/duration";
import { getUserPermissions } from "../../../utils/calculateUserPermissions";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Create a new panel!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("Choose a trigger")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("What component type should the panel use?")
        .setRequired(true)
        .setChoices([
          { name: "Buttons (better for 1-5 triggers)", value: "button" },
          { name: "Dropdown (better for 5+ triggers)", value: "select" },
        ])
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_1")
        .setDescription("Pick a trigger")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_2")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_3")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_4")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_5")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_6")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_7")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_8")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_9")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_10")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_11")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_12")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_13")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_14")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_15")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_16")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_17")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_18")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_19")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("trigger_20")
        .setDescription("Pick a trigger")
        .setAutocomplete(true)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "message") {
      const focusedValue = interaction.options.getString("message", true);
      const message = await getServerMessages(interaction.guildId);
      if (!message.length) {
        interaction.respond([
          {
            name: "You don't have any message!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = message.filter((m) =>
        m.name.toLowerCase().includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name: m.name,
            value: m._id,
          }))
          .slice(0, 25)
      );
    } else if (focused.startsWith("trigger")) {
      const focusedValue = interaction.options.getString(
        `trigger_${focused.split("_")[1]}`,
        true
      );
      const triggers = [
        ...(await getServerApplications(interaction.guildId)),
        ...(await getServerTicketTriggers(interaction.guildId)),
      ];
      if (!triggers.length) {
        interaction.respond([
          {
            name: "You don't have any triggers!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = triggers.filter((m) =>
        "name" in m
          ? m.name.toLowerCase().includes(focusedValue.toLowerCase())
          : m.label.toLowerCase().includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name:
              "name" in m
                ? `[Ticket] ${m.name}`.slice(0, 100)
                : `[Application] ${m.label}`.slice(0, 100),
            value: m._id,
          }))
          .slice(0, 25)
      );
    }
  },
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const start = new Date();

    const groups = await getServerGroups(interaction.guildId);
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      groups
    );
    if (
      !userPermissions.panels.manage &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "MISSING_PERMISSIONS"),
            {},
            data.lang! as Locale
          )
        ).discordMsg
      );

    const message = await getServerMessage(
      interaction.options.getString("message", true),
      interaction.guildId
    );
    if (!message) {
      const error = (
        await onError(
          "Commands",
          t(data.lang!, "CONFIG_CREATE_MESSAGE_NOT_FOUND"),
          {},
          data.lang! as Locale
        )
      ).discordMsg;

      interaction.reply(error);
      return;
    }

    await interaction.reply({
      content: t(data.lang!, "PROCESSING_PANEL"),
      flags: [MessageFlags.Ephemeral],
    });

    const triggerValues = interaction.options.data
      .filter((opt) => opt.name.startsWith("trigger_") && opt.value != null)
      .sort(
        (a, b) => Number(a.name.split("_")[1]) - Number(b.name.split("_")[1])
      )
      .map((opt) => opt.value as string);

    // Validate all values
    const ticketTriggers = await getServerTicketTriggers(interaction.guildId);
    const applicationTriggers = await getServerApplications(
      interaction.guildId
    );

    const validTriggers = [];
    for (const value of triggerValues) {
      if (value.startsWith("TT_")) {
        const ticket = ticketTriggers.find((t) => t._id === value);
        if (!ticket) continue;

        validTriggers.push({
          label: ticket.label,
          description: ticket.description,
          colour: ticket.colour,
          value: `ticket:${ticket._id}`,
        });
      } else {
        const app = applicationTriggers.find((a) => a._id === value);
        if (!app) continue;

        validTriggers.push({
          label: app.name,
          colour: ButtonStyle.Secondary,
          value: `apply:${app._id}`,
        });
      }
    }

    const channel = interaction.channel as TextChannel;
    channel.send({
      ...resolveDiscordMessagePlaceholders(
        serverMessageToDiscordMessage(message),
        generateBasePlaceholderContext({ server: interaction.guild! })
      ),
      components: buildTriggerActionRows(
        validTriggers,
        interaction.options.getString("type", true) as "button" | "select"
      ),
    });

    logger(
      "Commands",
      "Info",
      `Processing new panel took ${formatDuration(
        new Date().getTime() - start.getTime()
      )}`
    );
  },
};

export default command;

function buildTriggerActionRows(
  triggers: {
    label: string;
    value: string;
    description?: string;
    colour?: ButtonStyle;
  }[],
  type: "button" | "select"
): ActionRowBuilder<any>[] {
  // Remove duplicates by `value`
  const uniqueTriggers = Array.from(
    new Map(triggers.map((t) => [t.value, t])).values()
  );

  if (type === "button") {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < uniqueTriggers.length; i += 5) {
      const chunk = uniqueTriggers.slice(i, i + 5);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...chunk.map((trigger) =>
          new ButtonBuilder()
            .setCustomId(trigger.value)
            .setLabel(trigger.label)
            .setStyle(trigger.colour ?? ButtonStyle.Secondary)
        )
      );
      rows.push(row);
    }
    return rows;
  }

  if (type === "select") {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("triggerSelect")
        .setPlaceholder("Select a trigger")
        .addOptions(
          uniqueTriggers.slice(0, 25).map((trigger) => {
            const option = new StringSelectMenuOptionBuilder()
              .setLabel(trigger.label)
              .setValue(trigger.value);
            if (trigger.description) {
              option.setDescription(trigger.description.slice(0, 100));
            }
            return option;
          })
        )
    );
    return [row];
  }

  throw new Error("Invalid type: must be 'button' or 'select'");
}
