"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
class TranscriptService extends _1.default {
    constructor() {
        super("Transcript Server", {
            baseUrl: process.env.TRANSCRIPT_SERVER_URL,
            auth: process.env.TRANSCRIPT_SERVER_PASS,
            ping: {
                path: "ping",
            },
        });
    }
    async create(transcriptId, guildId, raised) {
        super.run({
            method: "POST",
            path: "create",
            body: { transcriptId, guildId, raised },
        });
    }
    async write(transcriptId, messageAuthorId, messageAuthorName, messageId, messageContent, messageCreated, attachments) {
        super.run({
            method: "POST",
            path: `write/${transcriptId}`,
            body: {
                messageAuthorId,
                messageAuthorName,
                messageId,
                messageContent,
                messageCreated,
                attachments,
            },
        });
    }
    async systemMessage(transcriptId, message) {
        super.run({
            method: "POST",
            path: `system/${transcriptId}`,
            body: {
                message,
            },
        });
    }
    async raise(transcriptId, status) {
        super.run({
            method: "POST",
            path: `raise/${transcriptId}/${status}`,
            body: {},
        });
    }
    async event(transcriptId, type, messageId, content, actor) {
        super.run({
            method: "POST",
            path: `event/${transcriptId}`,
            body: {
                type,
                messageId,
                messageContentNew: content,
                actor,
            },
        });
    }
    /**
     * Not really too much point in this cause you wont be able to see your edits if it is delayed
     * @param guildId
     * @param transcriptId
     * @param action
     * @param name
     */
    async tag(guildId, transcriptId, action, name) {
        super.run({
            method: "POST",
            path: `tag/${action}/${guildId}/${transcriptId}/${name}`,
            body: {},
        });
    }
    async complete(transcriptId, metadata) {
        super.run({
            method: "POST",
            path: `complete/${transcriptId}`,
            body: {
                ...metadata,
            },
        });
    }
}
exports.default = TranscriptService;
//# sourceMappingURL=/src/services/transcripts.js.map