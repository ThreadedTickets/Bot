"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c4bca06f-deac-5573-833b-637d39026d4b")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTranscriptFromJsonl = renderTranscriptFromJsonl;
// transcriptRenderer.tsx
const react_1 = __importDefault(require("react"));
const server_1 = require("react-dom/server");
const promises_1 = __importDefault(require("fs/promises"));
const readline_1 = __importDefault(require("readline"));
const Transcript = ({ messages, users, messageMap, }) => (react_1.default.createElement("div", { className: "transcript" }, messages.map((msg) => (react_1.default.createElement(Message, { key: msg.messageId, msg: msg, users: users, messageMap: messageMap })))));
const Message = ({ msg, users, messageMap }) => {
    const user = users[msg.userId];
    const isSystem = msg.type !== 0 && msg.type !== 19;
    return (react_1.default.createElement("div", { className: `message ${isSystem ? "system" : "user"}` },
        !isSystem && (react_1.default.createElement("div", { className: "author" },
            user.avatarUrl && (react_1.default.createElement("img", { className: "avatar", src: user.avatarUrl, alt: "avatar" })),
            react_1.default.createElement("span", { className: "username", style: { color: user.color || "#fff" } }, user.username),
            user.isBot && react_1.default.createElement("span", { className: "badge" }, "BOT"),
            react_1.default.createElement("span", { className: "timestamp" }, new Date(msg.timestamp).toLocaleString()))),
        msg.replyTo && messageMap.has(msg.replyTo) && (react_1.default.createElement(Reply, { replyTo: messageMap.get(msg.replyTo), users: users })),
        react_1.default.createElement("div", { className: "content" }, renderContent(msg.content)),
        msg.embeds.map((embed, idx) => (react_1.default.createElement(Embed, { key: idx, embed: embed }))),
        isSystem && react_1.default.createElement("div", { className: "system-message" }, msg.content)));
};
const Reply = ({ replyTo, users }) => {
    const user = users[replyTo.userId];
    return (react_1.default.createElement("div", { className: "reply" },
        react_1.default.createElement("span", { className: "reply-user" },
            "Replying to ",
            user.username),
        react_1.default.createElement("div", { className: "reply-content" }, replyTo.content)));
};
const Embed = ({ embed }) => (react_1.default.createElement("div", { className: "embed", style: {
        borderLeft: `4px solid #${embed.color?.toString(16) || "7289da"}`,
    } },
    embed.author && (react_1.default.createElement("div", { className: "embed-author" },
        embed.author.icon_url && (react_1.default.createElement("img", { src: embed.author.icon_url, alt: "author icon", className: "embed-author-icon" })),
        react_1.default.createElement("span", { className: "embed-author-name" }, embed.author.name))),
    embed.title && react_1.default.createElement("div", { className: "embed-title" }, embed.title),
    embed.description && (react_1.default.createElement("div", { className: "embed-description" }, embed.description)),
    embed.fields &&
        embed.fields.map((f, i) => (react_1.default.createElement("div", { className: "embed-field", key: i },
            react_1.default.createElement("div", { className: "embed-field-name" }, f.name),
            react_1.default.createElement("div", { className: "embed-field-value" }, f.value)))),
    embed.image && (react_1.default.createElement("img", { className: "embed-image", src: embed.image.url, alt: "embed" })),
    embed.footer && react_1.default.createElement("div", { className: "embed-footer" }, embed.footer.text)));
const renderContent = (content) => {
    // Handle custom emojis like <:name:id> or <a:name:id>
    const emojiRegex = /<(a?):(\w+):(\d+)>/g;
    const parts = [];
    let lastIndex = 0;
    for (const match of content.matchAll(emojiRegex)) {
        const [full, animated, name, id] = match;
        const index = match.index ?? 0;
        if (index > lastIndex)
            parts.push(content.slice(lastIndex, index));
        const ext = animated ? "gif" : "png";
        parts.push(react_1.default.createElement("img", { className: "emoji", src: `https://cdn.discordapp.com/emojis/${id}.${ext}`, alt: name }));
        lastIndex = index + full.length;
    }
    if (lastIndex < content.length)
        parts.push(content.slice(lastIndex));
    return parts;
};
async function renderTranscriptFromJsonl(jsonlFilePath, users, metadata) {
    const messages = [];
    const fileStream = await promises_1.default.open(jsonlFilePath);
    const rl = readline_1.default.createInterface({
        input: fileStream.createReadStream(),
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        if (line.trim()) {
            try {
                messages.push(JSON.parse(line));
            }
            catch (e) {
                console.error("Invalid JSON line:", line);
            }
        }
    }
    const messageMap = new Map(messages.map((m) => [m.messageId, m]));
    const html = (0, server_1.renderToStaticMarkup)(react_1.default.createElement("html", null,
        react_1.default.createElement("head", null,
            react_1.default.createElement("meta", { charSet: "utf-8" }),
            react_1.default.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
            react_1.default.createElement("title", null, metadata.name || "Discord Transcript"),
            react_1.default.createElement("style", null, `
          body { font-family: sans-serif; background: #36393f; color: white; padding: 20px; }
          .message { margin-bottom: 16px; }
          .author { display: flex; align-items: center; gap: 8px; }
          .avatar { width: 32px; height: 32px; border-radius: 50%; }
          .username { font-weight: bold; }
          .timestamp { color: #aaa; font-size: 12px; margin-left: auto; }
          .badge { background: #5865f2; color: white; font-size: 10px; padding: 2px 4px; border-radius: 3px; margin-left: 4px; }
          .content { margin-top: 4px; white-space: pre-wrap; }
          .reply { margin-left: 40px; background: #2f3136; padding: 4px 8px; border-left: 2px solid #5865f2; }
          .embed { background: #2f3136; padding: 8px; margin-top: 4px; border-radius: 4px; }
          .embed-author { display: flex; align-items: center; gap: 6px; font-weight: bold; }
          .embed-author-icon { width: 20px; height: 20px; border-radius: 50%; }
          .embed-title { font-weight: bold; margin-top: 4px; }
          .embed-description { margin-top: 4px; }
          .embed-field { margin-top: 4px; }
          .embed-field-name { font-weight: bold; }
          .embed-image { max-width: 100%; margin-top: 6px; border-radius: 3px; }
          .embed-footer { margin-top: 4px; font-size: 12px; color: #aaa; }
          .emoji { width: 20px; height: 20px; vertical-align: middle; }
          .system-message { color: #faa61a; font-style: italic; margin-top: 4px; }
        `)),
        react_1.default.createElement("body", null,
            react_1.default.createElement(Transcript, { messages: messages, users: users, messageMap: messageMap }))));
    return "<!DOCTYPE html>" + html;
}
//# sourceMappingURL=index.js.map
//# debugId=c4bca06f-deac-5573-833b-637d39026d4b
