import {
  EmbedBuilder,
  MessageCreateOptions,
  MessageEditOptions,
} from "discord.js";
import colours from "../../constants/colours";

/**
 * Splits an array of items into multiple Discord embeds, each containing a given number of items.
 * @param items The list of string items to paginate.
 * @param itemsPerEmbed The number of items to include per embed.
 * @param embedTitle Optional title to show on each embed.
 * @returns Array of MessageEditOptions, each containing one embed.
 */
export function paginateStrings(
  items: string[],
  itemsPerEmbed: number = 10,
  embedTitle?: string
): MessageEditOptions[] {
  const pages: MessageEditOptions[] = [];

  for (let i = 0; i < items.length; i += itemsPerEmbed) {
    const chunk = items.slice(i, i + itemsPerEmbed);
    const embed = new EmbedBuilder()
      .setTitle(embedTitle?.slice(0, 250) || null)
      .setDescription(chunk.join("\n"))
      .setFooter({
        text: `Page ${Math.floor(i / itemsPerEmbed) + 1} of ${Math.ceil(
          items.length / itemsPerEmbed
        )}`,
      })
      .setColor(parseInt(colours.primary, 16)); // Optional: customize the embed color

    pages.push({ embeds: [embed], content: "" });
  }

  return pages;
}
