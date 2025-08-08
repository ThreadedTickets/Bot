import {
  GuildMember,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { AppCommand } from "../../../types/Command";
import {
  getServerApplication,
  getServerApplications,
} from "../../../utils/bot/getServer";
import { onError } from "../../../utils/onError";
import { t } from "../../../lang";
import { performApplicationChecks } from "../../../utils/applications/performChecks";
import { runHooks } from "../../../utils/hooks";
import { Application } from "../../../types/Application";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("apply")
    .setDescription("Apply for an application")
    .setContexts(InteractionContextType.Guild)
    .setNameLocalizations({})
    .setDescriptionLocalizations({})
    .addStringOption((opt) =>
      opt
        .setName("application")
        .setDescription("Which application would you like to apply for?")
        .setRequired(true)
        .setNameLocalizations({})
        .setDescriptionLocalizations({})
        .setAutocomplete(true)
    ),

  async autocomplete(client, interaction) {
    if (!interaction.guildId) return;
    const focused = interaction.options.getFocused(true).name;

    if (focused === "application") {
      const focusedValue = interaction.options.getString("application", true);
      const now = new Date().getTime();
      const applications = (
        await getServerApplications(interaction.guildId)
      ).filter((app) => {
        const open = app.open ? new Date(app.open).getTime() : null;
        const close = app.close ? new Date(app.close).getTime() : null;
        const accepting = app.acceptingResponses;

        if (open && close && !accepting) {
          // Only show if now is between open and close
          return now >= open && now <= close;
        }

        if (close && accepting) {
          // Do not show if close date has passed
          return now <= close;
        }

        if (open && accepting) {
          // Show
          return true;
        }

        if (open && !accepting) {
          // Show if past open
          return now >= open;
        }

        if (!open && !close && accepting) {
          // Show
          return true;
        }

        // If none set and not accepting, do not show
        return false;
      });
      if (!applications.length) {
        interaction.respond([
          {
            name: "There are no open applications!",
            value: "",
          },
        ]);
        return;
      }

      const filtered = applications.filter((m) =>
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
    }
  },

  async execute(client, data, interaction) {
    if (!interaction.guildId) return;

    await interaction.reply({
      content: t(data.lang!, "APPLICATION_PENDING_CHECKS"),
      flags: [MessageFlags.Ephemeral],
    });

    const application = await getServerApplication(
      interaction.options.getString("application", true),
      interaction.guildId
    );
    if (!application)
      return interaction.editReply(
        (await onError(new Error("Application not found"))).discordMsg
      );

    const appObject = application.toObject();
    const applicationTyped: Application = {
      ...appObject,
      open: appObject.open?.toISOString() ?? null,
      close: appObject.close?.toISOString() ?? null,
      acceptedMessage: appObject.acceptedMessage ?? null,
      rejectedMessage: appObject.rejectedMessage ?? null,
      submissionMessage: appObject.submissionMessage ?? null,
      cancelMessage: appObject.cancelMessage ?? null,
      confirmationMessage: appObject.confirmationMessage ?? null,
    };

    const checks = await performApplicationChecks(
      applicationTyped,
      interaction.member as GuildMember,
      true,
      true
    );

    if (!checks.allowed) {
      return interaction.editReply(
        (await onError(new Error(t(data.lang!, `ERROR_CODE_${checks.error}`))))
          .discordMsg
      );
    }

    interaction.editReply({
      content: t(data.lang!, "APPLICATION_DIRECT_TO_DMS"),
    });

    runHooks("ApplicationStart", {
      lang: data.lang!,
      user: interaction.user,
      application: applicationTyped,
      server: interaction.guild!,
    });
  },
};

export default command;
