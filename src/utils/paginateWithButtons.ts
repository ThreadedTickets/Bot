import {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  Message,
  MessageEditOptions,
  ButtonInteraction,
  ChatInputCommandInteraction,
} from "discord.js";

/**
 * Accepts a replyable (CommandInteraction or Message) and a list of paginated message edit options,
 * and presents button-based pagination to the user.
 */
export async function paginateWithButtons(
  ownerId: string,
  target: ButtonInteraction | ChatInputCommandInteraction | Message,
  pages: MessageEditOptions[],
  timeoutMs: number = 60_000
): Promise<void> {
  if (pages.length === 0) return;

  let currentPage = 0;

  const buildComponents = () =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("first")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("cancel")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === pages.length - 1),
      new ButtonBuilder()
        .setCustomId("last")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === pages.length - 1)
    );

  const applyPage = (index: number): MessageEditOptions => ({
    ...pages[index],
    components: [buildComponents()],
  });

  const message =
    "editReply" in target
      ? await target.editReply(applyPage(currentPage))
      : await target.edit(applyPage(currentPage));

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeoutMs,
    filter: (i: ButtonInteraction) => i.user.id === ownerId,
  });

  collector.on("collect", async (interaction) => {
    switch (interaction.customId) {
      case "first":
        currentPage = 0;
        break;
      case "prev":
        currentPage = Math.max(0, currentPage - 1);
        break;
      case "next":
        currentPage = Math.min(pages.length - 1, currentPage + 1);
        break;
      case "last":
        currentPage = pages.length - 1;
        break;
      case "cancel":
        collector.stop("cancelled");
        await interaction.update({ components: [] });
        return;
    }

    await interaction.update(applyPage(currentPage));
  });

  collector.on("end", async (_, reason) => {
    if (reason !== "cancelled") {
      await message.edit({ components: [] }).catch(() => {});
    }
  });
}
