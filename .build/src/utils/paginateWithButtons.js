"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="379f9349-bd6c-5239-a094-c035ca2d343d")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateWithButtons = paginateWithButtons;
const discord_js_1 = require("discord.js");
/**
 * Accepts a replyable (CommandInteraction or Message) and a list of paginated message edit options,
 * and presents button-based pagination to the user.
 */
async function paginateWithButtons(ownerId, target, pages, timeoutMs = 60000) {
    if (pages.length === 0)
        return;
    let currentPage = 0;
    const buildComponents = () => new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("first")
        .setEmoji("⏪")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(currentPage === 0), new discord_js_1.ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(currentPage === 0), new discord_js_1.ButtonBuilder()
        .setCustomId("cancel")
        .setEmoji("❌")
        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(currentPage === pages.length - 1), new discord_js_1.ButtonBuilder()
        .setCustomId("last")
        .setEmoji("⏩")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(currentPage === pages.length - 1));
    const applyPage = (index) => ({
        ...pages[index],
        components: [buildComponents()],
    });
    const message = "editReply" in target
        ? await target.editReply(applyPage(currentPage))
        : await target.edit(applyPage(currentPage));
    const collector = message.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: timeoutMs,
        filter: (i) => i.user.id === ownerId,
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
            await message.edit({ components: [] }).catch(() => { });
        }
    });
}
//# sourceMappingURL=paginateWithButtons.js.map
//# debugId=379f9349-bd6c-5239-a094-c035ca2d343d
