"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4140c62c-b6d6-5b74-a8df-d1de83896d84")}catch(e){}}();

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
//# sourceMappingURL=getOrCreateWebhook.js.map
//# debugId=4140c62c-b6d6-5b74-a8df-d1de83896d84
