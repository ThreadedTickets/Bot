"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateWebhook = getOrCreateWebhook;
async function getOrCreateWebhook(channel, clientUser) {
    if (!channel.isTextBased() || channel.isDMBased())
        throw new Error("Invalid channel type");
    const webhooks = await channel.fetchWebhooks();
    const existing = webhooks.find((wh) => wh.owner?.id === clientUser.id);
    if (existing)
        return existing.url;
    // Create a new webhook if not found
    return (await channel.createWebhook({
        name: clientUser.displayName,
        avatar: clientUser.displayAvatarURL() || null,
    })).url;
}
//# sourceMappingURL=/src/utils/bot/getOrCreateWebhook.js.map