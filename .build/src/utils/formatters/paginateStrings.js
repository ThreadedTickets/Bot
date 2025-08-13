"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateStrings = paginateStrings;
const discord_js_1 = require("discord.js");
const colours_1 = __importDefault(require("../../constants/colours"));
/**
 * Splits an array of items into multiple Discord embeds, each containing a given number of items.
 * @param items The list of string items to paginate.
 * @param itemsPerEmbed The number of items to include per embed.
 * @param embedTitle Optional title to show on each embed.
 * @returns Array of MessageEditOptions, each containing one embed.
 */
function paginateStrings(items, itemsPerEmbed = 10, embedTitle) {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerEmbed) {
        const chunk = items.slice(i, i + itemsPerEmbed);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(embedTitle?.slice(0, 250) || null)
            .setDescription(chunk.join("\n"))
            .setFooter({
            text: `Page ${Math.floor(i / itemsPerEmbed) + 1} of ${Math.ceil(items.length / itemsPerEmbed)}`,
        })
            .setColor(parseInt(colours_1.default.primary, 16)); // Optional: customize the embed color
        pages.push({ embeds: [embed], content: "" });
    }
    return pages;
}
//# sourceMappingURL=/src/utils/formatters/paginateStrings.js.map