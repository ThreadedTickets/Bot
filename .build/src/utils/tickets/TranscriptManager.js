"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcriptWriterManager = exports.TranscriptWriter = void 0;
// Refactored TranscriptWriter
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const __1 = require("../..");
function numberToWords(n) {
    const words = [
        "Zero",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
        "Twenty",
    ];
    return n <= 20 ? words[n] : `User ${n}`;
}
class TranscriptWriter {
    get(ticketId, anonymise) {
        const existing = this.writers.get(ticketId);
        if (existing) {
            clearTimeout(existing.timeout); // Reset cleanup timer
            existing.timeout = this.scheduleCleanup(ticketId);
            return existing.writer;
        }
        const writer = new TranscriptWriter(ticketId, anonymise);
        const timeout = this.scheduleCleanup(ticketId);
        this.writers.set(ticketId, { writer, timeout });
        return writer;
    }
    scheduleCleanup(ticketId) {
        return setTimeout(() => {
            const item = this.writers.get(ticketId);
            if (!item)
                return;
            try {
                item.writer["closed"] = true; // Soft close (no handles to close)
            }
            catch (err) {
                console.error(`Failed to close TranscriptWriter for ${ticketId}:`, err);
            }
            this.writers.delete(ticketId);
        }, this.CLEANUP_DELAY);
    }
    delete(ticketId) {
        const entry = this.writers.get(ticketId);
        if (entry) {
            clearTimeout(entry.timeout);
            this.writers.delete(ticketId);
        }
    }
    clearAll() {
        for (const [ticketId, { timeout }] of this.writers.entries()) {
            clearTimeout(timeout);
            this.writers.delete(ticketId);
        }
    }
    constructor(ticketId, allowAnonymity = false) {
        this.anonMap = new Map();
        this.users = {};
        this.anonCounter = 1;
        this.initialized = false;
        this.metadata = {};
        this.closed = false;
        this.writers = new Map();
        this.CLEANUP_DELAY = 2 * 60 * 1000; // 2 minutes
        this.ticketId = ticketId;
        this.allowAnonymity = allowAnonymity;
        this.dir = path_1.default.resolve("./transcripts");
        this.filePath = path_1.default.join(this.dir, `${ticketId}.jsonl`);
        this.metaPath = path_1.default.join(this.dir, `${ticketId}.meta.json`);
        this.ticketId = ticketId;
        if (!fs_1.default.existsSync(this.dir)) {
            fs_1.default.mkdirSync(this.dir, { recursive: true });
        }
        this.loadMeta();
    }
    loadMeta() {
        if (fs_1.default.existsSync(this.metaPath)) {
            const meta = JSON.parse(fs_1.default.readFileSync(this.metaPath, "utf-8"));
            this.users = meta.users || {};
            this.anonCounter = meta.anonCounter || 1;
            this.metadata = meta.metadata || {};
            for (const [realId, anonId] of Object.entries(meta.anonMap || {})) {
                this.anonMap.set(realId, anonId);
            }
        }
    }
    saveMeta() {
        const meta = {
            users: this.users,
            anonCounter: this.anonCounter,
            anonMap: Object.fromEntries(this.anonMap.entries()),
            metadata: this.metadata,
        };
        fs_1.default.writeFileSync(this.metaPath, JSON.stringify(meta, null, 2));
    }
    assignUserId(user) {
        if (!this.allowAnonymity)
            return user.id;
        if (!this.anonMap.has(user.id)) {
            const anonId = `anon-${this.anonCounter++}`;
            this.anonMap.set(user.id, anonId);
        }
        return this.anonMap.get(user.id);
    }
    captureUserMeta(user, member) {
        const anonId = this.assignUserId(user);
        if (this.allowAnonymity) {
            const anonIndex = parseInt(anonId.split("-")[1], 10);
            return {
                username: `Anonymous ${numberToWords(anonIndex)}`,
                isBot: user.bot,
            };
        }
        return {
            username: user.tag,
            roleColor: member?.displayHexColor ?? undefined,
            isBot: user.bot,
        };
    }
    async startTranscript(guildId, isRaised) {
        __1.transcriptService.create(this.ticketId, guildId, isRaised);
    }
    async addMessage(msg) {
        const user = msg.author;
        const userId = this.assignUserId(user);
        if (!this.users[userId]) {
            this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
            this.saveMeta();
        }
        let content = msg.content;
        if (msg.mentions.channels) {
            for (const channel of msg.mentions.channels.values()) {
                content = content.replaceAll(`<#${channel.id}>`, `#${"name" in channel ? channel.name : "Unknown Channel"} (${channel.id})`);
            }
        }
        if (msg.mentions.users) {
            for (const user of msg.mentions.users.values()) {
                content = content.replaceAll(`<@${user.id}>`, `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`);
            }
        }
        if (msg.mentions.roles) {
            for (const role of msg.mentions.roles.values()) {
                content = content.replaceAll(`<@&${role.id}>`, `@${role.name} (${role.id})`);
            }
        }
        __1.transcriptService.write(this.ticketId, this.allowAnonymity ? this.users[userId].username : user.id, this.users[userId]?.username ?? user.username, msg.id, content, msg.createdAt, msg.attachments.map((a) => {
            return {
                filename: a.name,
                size: `${Math.round((a.size / 1024) * 100) / 100}kb`,
                url: a.url,
            };
        }));
        if (msg.reference?.messageId && msg.type === discord_js_1.MessageType.Reply) {
            const referencedMessage = await msg.channel.messages.fetch(msg.reference.messageId);
            if (referencedMessage)
                __1.transcriptService.event(this.ticketId, "reply", msg.id, `${referencedMessage.content}${referencedMessage.attachments.size > 0 ? ` (+${referencedMessage.attachments.size} files)` : ""}`, `${referencedMessage.author.username} (${referencedMessage.author.id})`);
        }
    }
    async editMessage(msg) {
        const user = msg.author;
        const userId = this.assignUserId(user);
        if (!this.users[userId]) {
            this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
            this.saveMeta();
        }
        let content = msg.content;
        if (msg.mentions.channels) {
            for (const channel of msg.mentions.channels.values()) {
                content = content.replaceAll(`<#${channel.id}>`, `#${"name" in channel ? channel.name : "Unknown Channel"} (${channel.id})`);
            }
        }
        if (msg.mentions.users) {
            for (const user of msg.mentions.users.values()) {
                console.log(user, `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`, content);
                content = content.replaceAll(`<@${user.id}>`, `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`);
            }
        }
        if (msg.mentions.roles) {
            for (const role of msg.mentions.roles.values()) {
                content = content.replaceAll(`<@&${role.id}>`, `@${role.name} (${role.id})`);
            }
        }
        __1.transcriptService.event(this.ticketId, "edit", msg.id, content);
    }
    async deleteMessage(msgId) {
        __1.transcriptService.event(this.ticketId, "delete", msgId);
    }
    getFilePath() {
        return this.filePath;
    }
}
exports.TranscriptWriter = TranscriptWriter;
class TranscriptWriterManager {
    constructor() {
        this.writers = new Map();
        this.CLEANUP_DELAY = 2 * 60 * 1000; // 2 minutes
    }
    get(ticketId, anonymise) {
        const existing = this.writers.get(ticketId);
        if (existing) {
            clearTimeout(existing.timeout); // Reset cleanup timer
            existing.timeout = this.scheduleCleanup(ticketId);
            return existing.writer;
        }
        const writer = new TranscriptWriter(ticketId, anonymise);
        const timeout = this.scheduleCleanup(ticketId);
        this.writers.set(ticketId, { writer, timeout });
        return writer;
    }
    scheduleCleanup(ticketId) {
        return setTimeout(() => {
            const item = this.writers.get(ticketId);
            if (!item)
                return;
            try {
                item.writer["closed"] = true; // Soft close (no handles to close)
            }
            catch (err) {
                console.error(`Failed to close TranscriptWriter for ${ticketId}:`, err);
            }
            this.writers.delete(ticketId);
        }, this.CLEANUP_DELAY);
    }
    delete(ticketId) {
        const entry = this.writers.get(ticketId);
        if (entry) {
            clearTimeout(entry.timeout);
            this.writers.delete(ticketId);
        }
    }
    clearAll() {
        for (const [ticketId, { timeout }] of this.writers.entries()) {
            clearTimeout(timeout);
            this.writers.delete(ticketId);
        }
    }
}
exports.transcriptWriterManager = new TranscriptWriterManager();
//# sourceMappingURL=/src/utils/tickets/TranscriptManager.js.map