"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcriptWriterManager = exports.TranscriptWriter = void 0;
// Refactored TranscriptWriter
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const readline = __importStar(require("readline"));
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
    deleteTranscript() {
        if (this.closed)
            throw new Error("Transcript already closed or deleted.");
        if (fs_1.default.existsSync(this.filePath)) {
            fs_1.default.unlinkSync(this.filePath);
        }
        if (fs_1.default.existsSync(this.metaPath)) {
            fs_1.default.unlinkSync(this.metaPath);
        }
        this.closed = true;
    }
    appendMessage(msg) {
        const user = msg.author;
        const userId = this.assignUserId(user);
        if (!this.users[userId]) {
            this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
            this.saveMeta();
        }
        const serialized = {
            messageId: msg.id,
            userId,
            type: msg.type,
            content: msg.content,
            embeds: msg.embeds.map((e) => discord_js_1.EmbedBuilder.from(e).toJSON()),
            replyTo: msg.reference?.messageId ?? [1, 2].includes(msg.type)
                ? msg.mentions.users.first()?.id
                : undefined,
            edited: !!msg.editedTimestamp,
            timestamp: msg.createdAt.toISOString(),
        };
        fs_1.default.appendFileSync(this.filePath, JSON.stringify(serialized) + "\n");
    }
    setMeta(path, value) {
        const parts = path.split(".");
        let current = this.metadata;
        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i] === "__proto__" || parts[i] === "constructor") {
                throw new Error("Invalid property name detected.");
            }
            if (!current[parts[i]])
                current[parts[i]] = {};
            current = current[parts[i]];
        }
        const lastPart = parts[parts.length - 1];
        if (lastPart === "__proto__" || lastPart === "constructor") {
            throw new Error("Invalid property name detected.");
        }
        current[lastPart] = value;
        this.saveMeta();
    }
    getFilePath() {
        return this.filePath;
    }
    getMeta() {
        return {
            users: this.users,
            anonCounter: this.anonCounter,
            anonMap: Object.fromEntries(this.anonMap.entries()),
            metadata: this.metadata,
        };
    }
    async editMessage(messageId, newMessage) {
        if (this.closed)
            throw new Error("Cannot edit a closed transcript.");
        const serialized = {
            messageId: newMessage.id,
            userId: newMessage.author.id,
            type: newMessage.type ?? -1,
            content: newMessage.content,
            embeds: newMessage.embeds.map((e) => discord_js_1.EmbedBuilder.from(e).toJSON()),
            replyTo: newMessage.reference?.messageId ?? undefined,
            edited: !!newMessage.editedTimestamp,
            timestamp: newMessage.createdAt.toISOString(),
        };
        const tempPath = this.filePath + ".tmp";
        const rl = readline.createInterface({
            input: fs_1.default.createReadStream(this.filePath),
            crlfDelay: Infinity,
        });
        const tempStream = fs_1.default.createWriteStream(tempPath);
        let found = false;
        for await (const line of rl) {
            try {
                const msg = JSON.parse(line);
                if (msg.messageId === newMessage.id) {
                    // Write the updated serialized message instead of the old one
                    tempStream.write(JSON.stringify(serialized) + "\n");
                    found = true;
                }
                else {
                    // Write the original line unchanged
                    tempStream.write(line + "\n");
                }
            }
            catch {
                // If a line is malformed, write it back as-is to keep file intact
                tempStream.write(line + "\n");
            }
        }
        await new Promise((res) => tempStream.end(res));
        if (!found)
            throw new Error(`Message ID ${newMessage.id} not found.`);
        fs_1.default.renameSync(tempPath, this.filePath);
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