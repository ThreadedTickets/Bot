import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Guild,
  User,
} from "discord.js";
import { registerHook } from "../../index";
import colours from "../../../../constants/colours";
import { Locale } from "../../../../types/Locale";
import { t } from "../../../../lang";
import serverMessageToDiscordMessage from "../../../formatters/serverMessageToDiscordMessage";
import { getServerMessage } from "../../../bot/getServer";
import { Application } from "../../../../types/Application";
import { resolveDiscordMessagePlaceholders } from "../../../message/placeholders/resolvePlaceholders";
import { generateBasePlaceholderContext } from "../../../message/placeholders/generateBaseContext";

registerHook(
  "ApplicationStart",
  async ({
    application,
    user,
    lang,
    server,
  }: {
    application: Application;
    user: User;
    lang: Locale;
    server: Guild;
  }) => {
    let startConfirmationMessage = null;
    if (application.confirmationMessage) {
      const customConfirmationMessage = await getServerMessage(
        application.confirmationMessage,
        server.id
      );
      if (customConfirmationMessage)
        startConfirmationMessage = serverMessageToDiscordMessage(
          customConfirmationMessage
        );
    }
    if (!startConfirmationMessage)
      startConfirmationMessage = {
        embeds: [
          {
            color: parseInt(colours.primary, 16),
            description: t(lang, "APPLICATION_DEFAULT_MESSAGE_CONFIRMATION"),
          },
        ],
      };

    user.send({
      ...resolveDiscordMessagePlaceholders(startConfirmationMessage, {
        ...generateBasePlaceholderContext({ server, user: user }),
        applicationName: application.name,
      }),
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`startApp:${application._id}:${server.id}`)
            .setLabel("Start")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId(`cancelApp:${application._id}:${server.id}`)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });
  }
);
