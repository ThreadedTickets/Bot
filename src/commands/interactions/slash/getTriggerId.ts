import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerTicketTrigger,
  getServerTicketTriggers,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { t } from "../../../lang";
import { Locale } from "../../../types/Locale";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("get_trigger_id")
    .setDescription("A command to help you get a ticket trigger ID")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("trigger")
        .setDescription("Choose a trigger")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "trigger") {
      const focusedValue = interaction.options.getString("trigger", true);
      const triggers = await getServerTicketTriggers(interaction.guildId);
      if (!triggers.length) {
        interaction.respond([
          {
            name: "You don't have any ticket triggers!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = triggers.filter((m) =>
        m.label.toLowerCase().includes(focusedValue.toLowerCase())
      );

      interaction.respond(
        filtered
          .map((m) => ({
            name: m.label,
            value: m._id,
          }))
          .slice(0, 25)
      );
    }
  },
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;

    const trigger = await getServerTicketTrigger(
      interaction.options.getString("trigger", true),
      interaction.guildId
    );
    if (!trigger) {
      const error = (
        await onError(
          "Commands",
          t(data.lang!, "CONFIG_CREATE_TICKET_TRIGGER_NOT_FOUND"),
          {},
          data.lang! as Locale
        )
      ).discordMsg;

      interaction.reply(error);
      return;
    }

    interaction.reply({
      flags: [MessageFlags.Ephemeral],
      content: trigger._id,
    });
  },
};

export default command;
