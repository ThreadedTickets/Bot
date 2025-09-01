"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a03bf2f6-f850-5178-929a-48a77faba5f0")}catch(e){}}();

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
//# debugId=a03bf2f6-f850-5178-929a-48a77faba5f0
