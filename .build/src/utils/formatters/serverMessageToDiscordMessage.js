"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8c090617-4716-5b5e-b7e9-50dd7cd4e729")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = serverMessageToDiscordMessage;
function serverMessageToDiscordMessage(serverMessage) {
    const returnValue = {};
    returnValue.content = serverMessage.content;
    if (serverMessage.embeds?.length) {
        returnValue.embeds = [];
        for (const embed of serverMessage.embeds) {
            const emb = {};
            if (embed.title)
                emb.title = embed.title;
            if (embed.description)
                emb.description = embed.description;
            if (embed.color) {
                try {
                    emb.color = parseInt(embed.color.replace("#", ""), 16);
                }
                catch { }
            }
            if (embed.fields?.length)
                emb.fields = embed.fields;
            if (embed.author?.name) {
                emb.author = {
                    name: embed.author.name,
                    url: embed.author.url || undefined,
                    icon_url: embed.author.icon_url || undefined,
                };
            }
            if (embed.footer?.text) {
                emb.footer = {
                    text: embed.footer.text,
                    icon_url: embed.footer.icon_url || undefined,
                };
            }
            if (embed.thumbnail?.url) {
                emb.thumbnail = { url: embed.thumbnail.url };
            }
            if (embed.image?.url) {
                emb.image = { url: embed.image.url };
            }
            if (embed.timestamp) {
                emb.timestamp =
                    embed.timestamp === true
                        ? new Date().toISOString()
                        : new Date(embed.timestamp).toISOString();
            }
            returnValue.embeds.push(emb);
        }
    }
    if (serverMessage.components?.length) {
        returnValue.components = serverMessage.components;
    }
    //! This is disabled for now as it will probably become a paid feature
    // if (serverMessage.attachments?.length) {
    //   returnValue.files = serverMessage.attachments.map((att) => ({
    //     name: att.name,
    //     attachment: Buffer.from(att.base64, "base64"),
    //   }));
    // }
    return returnValue;
}
//# sourceMappingURL=serverMessageToDiscordMessage.js.map
//# debugId=8c090617-4716-5b5e-b7e9-50dd7cd4e729
