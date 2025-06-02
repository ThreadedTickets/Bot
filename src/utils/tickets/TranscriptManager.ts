// Refactored TranscriptWriter
import fs from "fs";
import path from "path";
import {
  Message,
  EmbedBuilder,
  User,
  GuildMember,
  APIEmbed,
  PartialMessage,
} from "discord.js";
import * as readline from "readline";

function numberToWords(n: number): string {
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

export interface UserMetadata {
  username: string;
  roleColor?: string;
  isBot: boolean;
}

export interface SerializedMessage {
  messageId: string;
  userId: string;
  type: number;
  content: string;
  embeds: APIEmbed[];
  replyTo?: string;
  edited: boolean;
  timestamp: string;
}

export interface MetaFile {
  users: Record<string, UserMetadata>;
  anonMap: Record<string, string>;
  anonCounter: number;
  metadata: Record<string, any>;
}

export class TranscriptWriter {
  private dir: string;
  private filePath: string;
  private metaPath: string;
  private anonMap = new Map<string, string>();
  private users: Record<string, UserMetadata> = {};
  private anonCounter = 1;
  private initialized = false;
  private allowAnonymity: boolean;
  private ticketId: string;
  private metadata: Record<string, any> = {};
  private closed = false;
  private writers = new Map<
    string,
    { writer: TranscriptWriter; timeout: NodeJS.Timeout }
  >();
  private readonly CLEANUP_DELAY = 2 * 60 * 1000; // 2 minutes

  get(ticketId: string, anonymise: boolean): TranscriptWriter {
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

  private scheduleCleanup(ticketId: string): NodeJS.Timeout {
    return setTimeout(() => {
      const item = this.writers.get(ticketId);
      if (!item) return;
      try {
        item.writer["closed"] = true; // Soft close (no handles to close)
      } catch (err) {
        console.error(`Failed to close TranscriptWriter for ${ticketId}:`, err);
      }
      this.writers.delete(ticketId);
    }, this.CLEANUP_DELAY);
  }

  delete(ticketId: string): void {
    const entry = this.writers.get(ticketId);
    if (entry) {
      clearTimeout(entry.timeout);
      this.writers.delete(ticketId);
    }
  }

  clearAll(): void {
    for (const [ticketId, { timeout }] of this.writers.entries()) {
      clearTimeout(timeout);
      this.writers.delete(ticketId);
    }
  }

  constructor(ticketId: string, allowAnonymity = false) {
    this.ticketId = ticketId;
    this.allowAnonymity = allowAnonymity;
    this.dir = path.resolve("./transcripts");
    this.filePath = path.join(this.dir, `${ticketId}.jsonl`);
    this.metaPath = path.join(this.dir, `${ticketId}.meta.json`);
    this.ticketId = ticketId;

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }

    this.loadMeta();
  }

  private loadMeta() {
    if (fs.existsSync(this.metaPath)) {
      const meta: MetaFile = JSON.parse(
        fs.readFileSync(this.metaPath, "utf-8")
      );
      this.users = meta.users || {};
      this.anonCounter = meta.anonCounter || 1;
      this.metadata = meta.metadata || {};
      for (const [realId, anonId] of Object.entries(meta.anonMap || {})) {
        this.anonMap.set(realId, anonId);
      }
    }
  }

  private saveMeta() {
    const meta: MetaFile = {
      users: this.users,
      anonCounter: this.anonCounter,
      anonMap: Object.fromEntries(this.anonMap.entries()),
      metadata: this.metadata,
    };
    fs.writeFileSync(this.metaPath, JSON.stringify(meta, null, 2));
  }

  private assignUserId(user: User): string {
    if (!this.allowAnonymity) return user.id;
    if (!this.anonMap.has(user.id)) {
      const anonId = `anon-${this.anonCounter++}`;
      this.anonMap.set(user.id, anonId);
    }
    return this.anonMap.get(user.id)!;
  }

  private captureUserMeta(user: User, member?: GuildMember): UserMetadata {
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

  public deleteTranscript(): void {
    if (this.closed) throw new Error("Transcript already closed or deleted.");

    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }

    if (fs.existsSync(this.metaPath)) {
      fs.unlinkSync(this.metaPath);
    }

    this.closed = true;
  }

  public appendMessage(msg: Message): void {
    const user = msg.author;
    const userId = this.assignUserId(user);
    if (!this.users[userId]) {
      this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
      this.saveMeta();
    }

    const serialized: SerializedMessage = {
      messageId: msg.id,
      userId,
      type: msg.type,
      content: msg.content,
      embeds: msg.embeds.map((e) => EmbedBuilder.from(e).toJSON()),
      replyTo:
        msg.reference?.messageId ?? [1, 2].includes(msg.type)
          ? msg.mentions.users.first()?.id
          : undefined,
      edited: !!msg.editedTimestamp,
      timestamp: msg.createdAt.toISOString(),
    };

    fs.appendFileSync(this.filePath, JSON.stringify(serialized) + "\n");
  }

  public setMeta(path: string, value: any): void {
    const parts = path.split(".");
    let current = this.metadata;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    this.saveMeta();
  }

  public getFilePath(): string {
    return this.filePath;
  }

  public getMeta(): MetaFile {
    return {
      users: this.users,
      anonCounter: this.anonCounter,
      anonMap: Object.fromEntries(this.anonMap.entries()),
      metadata: this.metadata,
    };
  }

  public async editMessage(
    messageId: string,
    newMessage: Message | PartialMessage
  ): Promise<void> {
    if (this.closed) throw new Error("Cannot edit a closed transcript.");

    const serialized: SerializedMessage = {
      messageId: newMessage.id,
      userId: newMessage.author!.id,
      type: newMessage.type ?? -1,
      content: newMessage.content!,
      embeds: newMessage.embeds.map((e) => EmbedBuilder.from(e).toJSON()),
      replyTo: newMessage.reference?.messageId ?? undefined,
      edited: !!newMessage.editedTimestamp,
      timestamp: newMessage.createdAt.toISOString(),
    };

    const tempPath = this.filePath + ".tmp";
    const rl = readline.createInterface({
      input: fs.createReadStream(this.filePath),
      crlfDelay: Infinity,
    });

    const tempStream = fs.createWriteStream(tempPath);
    let found = false;

    for await (const line of rl) {
      try {
        const msg = JSON.parse(line) as SerializedMessage;

        if (msg.messageId === newMessage.id) {
          // Write the updated serialized message instead of the old one
          tempStream.write(JSON.stringify(serialized) + "\n");
          found = true;
        } else {
          // Write the original line unchanged
          tempStream.write(line + "\n");
        }
      } catch {
        // If a line is malformed, write it back as-is to keep file intact
        tempStream.write(line + "\n");
      }
    }

    await new Promise((res) => tempStream.end(res));

    if (!found) throw new Error(`Message ID ${newMessage.id} not found.`);

    fs.renameSync(tempPath, this.filePath);
  }
}
class TranscriptWriterManager {
  private writers = new Map<
    string,
    { writer: TranscriptWriter; timeout: NodeJS.Timeout }
  >();
  private readonly CLEANUP_DELAY = 2 * 60 * 1000; // 2 minutes

  get(ticketId: string, anonymise: boolean): TranscriptWriter {
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

  private scheduleCleanup(ticketId: string): NodeJS.Timeout {
    return setTimeout(() => {
      const item = this.writers.get(ticketId);
      if (!item) return;
      try {
        item.writer["closed"] = true; // Soft close (no handles to close)
      } catch (err) {
        console.error(`Failed to close TranscriptWriter for ${ticketId}:`, err);
      }
      this.writers.delete(ticketId);
    }, this.CLEANUP_DELAY);
  }

  delete(ticketId: string): void {
    const entry = this.writers.get(ticketId);
    if (entry) {
      clearTimeout(entry.timeout);
      this.writers.delete(ticketId);
    }
  }

  clearAll(): void {
    for (const [ticketId, { timeout }] of this.writers.entries()) {
      clearTimeout(timeout);
      this.writers.delete(ticketId);
    }
  }
}
export const transcriptWriterManager = new TranscriptWriterManager();
