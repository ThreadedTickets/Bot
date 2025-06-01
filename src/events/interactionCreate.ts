import { appCommands } from "../handlers/interactionCommandHandler";
import { Event } from "../types/Event";
import {
  AutocompleteInteraction,
  Interaction,
  Client,
  MessageFlags,
} from "discord.js";
import { logger } from "../utils/logger";
import {
  commandErrors,
  commandsRun,
  interactionErrors,
  interactionsRun,
} from "../metricsServer";
import {
  buttonHandlers,
  modalHandlers,
  selectMenuHandlers,
} from "../handlers/interactionHandlers";
import { onError } from "../utils/onError";
import { t } from "../lang";
import { EventData } from "../handlers/eventHandler";
import { viewAnnouncement } from "../utils/bot/viewAnnouncement";

const event: Event<"interactionCreate"> = {
  name: "interactionCreate",
  once: false,
  async execute(client: Client, data, interaction: Interaction) {
    if (interaction.guildId && data?.blacklist?.active) {
      // We know the user is blacklisted, im gonna just use en as locale as this is per-user not server
      if (!interaction.isAutocomplete()) {
        interaction.reply(
          (
            await onError(
              "Commands",
              t(
                // (
                //   await getServer(interaction.guildId)
                // ).preferredLanguage,
                "en",
                `BLACKLISTED_${
                  data.blacklist.type === "user" ? "USER" : "SERVER"
                }`,
                {
                  reason: data.blacklist.reason,
                }
              )
            )
          ).discordMsg
        );
        return;
      } else
        return interaction.respond([
          {
            name: t(
              // (
              //   await getServer(interaction.guildId)
              // ).preferredLanguage,
              "en",
              `BLACKLISTED_${
                data.blacklist.type === "user" ? "USER" : "SERVER"
              }`,
              {
                reason: data.blacklist.reason,
              }
            ).slice(0, 100),
            value: "-",
          },
        ]);
    }

    if (
      interaction.isChatInputCommand() ||
      interaction.isUserContextMenuCommand() ||
      interaction.isMessageContextMenuCommand()
    ) {
      const command = appCommands.get(interaction.commandName);
      if (!command) return;

      commandsRun.inc({
        command: interaction.commandName,
        type: interaction.isChatInputCommand()
          ? "Chat Input"
          : interaction.isUserContextMenuCommand()
          ? "User Context"
          : "Message Context",
      });

      try {
        await command.execute(
          client as Client,
          data as EventData,
          interaction as any
        );

        // After successful execution, check for announcement
        setTimeout(async () => {
          const announcement = await viewAnnouncement(interaction.user.id);
          if (announcement) {
            await interaction
              .followUp({
                ...announcement,
                flags: [MessageFlags.Ephemeral],
              })
              .catch((err) => {
                logger(
                  "Commands",
                  "Warn",
                  `Error when showing announcement: ${err}`
                );
              });
          }
        }, 3000);
      } catch (err: any) {
        logger(
          "Commands",
          "Error",
          `Error executing /${interaction.commandName}: ${err}`
        );
        commandErrors.inc({
          command: interaction.commandName,
          type: interaction.isChatInputCommand()
            ? "Chat Input"
            : interaction.isUserContextMenuCommand()
            ? "User Context"
            : "Message Context",
        });
        const replyMethod =
          interaction.replied || interaction.deferred ? "followUp" : "reply";
        await interaction[replyMethod](
          (
            await onError("Commands", `${err}`, {
              command: interaction.commandName,
              user: interaction.user.id,
              server: interaction.guild?.id || "DMs",
              stack: err.stack,
            })
          ).discordMsg
        ).catch(() => {});
      }
    }

    if (interaction.isButton()) {
      const customId = interaction.customId.split(":")[0];
      const handler = buttonHandlers.get(customId);
      if (handler) {
        interactionsRun.inc({ name: customId, type: "Button" });
        try {
          await handler.execute(client, data as EventData, interaction);
        } catch (err: any) {
          logger(
            "Buttons",
            "Error",
            `Error in button ${interaction.customId}: ${err}`
          );
          interactionErrors.inc({ name: customId, type: "Button" });

          const replyMethod =
            interaction.replied || interaction.deferred ? "followUp" : "reply";
          await interaction[replyMethod](
            (
              await onError("Buttons", `${err}`, {
                button: customId,
                fullId: interaction.customId,
                user: interaction.user.id,
                server: interaction.guild?.id || "DMs",
                stack: err.stack,
              })
            ).discordMsg
          ).catch(() => {});
        }
      }
    }

    if (interaction.isModalSubmit()) {
      const customId = interaction.customId.split(":")[0];
      const handler = modalHandlers.get(customId);
      if (handler) {
        interactionsRun.inc({ name: customId, type: "Modal" });
        try {
          await handler.execute(client, data as EventData, interaction);
        } catch (err) {
          logger(
            "Modals",
            "Error",
            `Error in modal ${interaction.customId}: ${err}`
          );
          interactionErrors.inc({ name: customId, type: "Modal" });

          const replyMethod =
            interaction.replied || interaction.deferred ? "followUp" : "reply";
          await interaction[replyMethod](
            (
              await onError("Modals", `${err}`, {
                modal: customId,
                fullId: interaction.customId,
                user: interaction.user.id,
                server: interaction.guild?.id || "DMs",
              })
            ).discordMsg
          ).catch(() => {});
        }
      }
    }

    if (interaction.isAnySelectMenu()) {
      const customId = interaction.customId.split(":")[0];
      const handler = selectMenuHandlers.get(customId);
      if (handler) {
        interactionsRun.inc({ name: customId, type: "Select Menu" });
        try {
          await handler.execute(client, data as EventData, interaction);
        } catch (err) {
          logger(
            "Select Menus",
            "Error",
            `Error in select menu ${interaction.customId}: ${err}`
          );
          interactionErrors.inc({ name: customId, type: "Select Menu" });

          const replyMethod =
            interaction.replied || interaction.deferred ? "followUp" : "reply";
          await interaction[replyMethod](
            (
              await onError("Select Menus", `${err}`, {
                menu: customId,
                fullId: interaction.customId,
                user: interaction.user.id,
                server: interaction.guild?.id || "DMs",
              })
            ).discordMsg
          ).catch(() => {});
        }
      }
    }

    if (interaction.isAutocomplete()) {
      const command = appCommands.get(interaction.commandName);
      if (command?.type === "slash" && command.autocomplete) {
        try {
          await command.autocomplete(
            client as Client,
            interaction as AutocompleteInteraction
          );
        } catch (err) {
          logger(
            "Commands",
            "Error",
            `Error executing autocomplete ${interaction.commandName}: ${err}`
          );
        }
      }
    }
  },
};

export default event;
