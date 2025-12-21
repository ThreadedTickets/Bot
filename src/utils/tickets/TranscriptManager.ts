// Refactored TranscriptWriter
import fs from "fs";
import path from "path";
import { Message, User, GuildMember, APIEmbed, MessageType } from "discord.js";
import axios from "axios";
import { transcriptService } from "../..";

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
  private writers = new Map<string, { writer: TranscriptWriter; timeout: NodeJS.Timeout }>();
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
      const meta: MetaFile = JSON.parse(fs.readFileSync(this.metaPath, "utf-8"));
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

  public async startTranscript(guildId: string, isRaised: boolean) {
    transcriptService.create(this.ticketId, guildId, isRaised);
  }

  public async addMessage(msg: Message): Promise<void> {
    const user = msg.author;
    const userId = this.assignUserId(user);
    if (!this.users[userId]) {
      this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
      this.saveMeta();
    }

    let content = msg.content;
    if (msg.mentions.channels) {
      for (const channel of msg.mentions.channels.values()) {
        content = content.replaceAll(
          `<#${channel.id}>`,
          `#${"name" in channel ? channel.name : "Unknown Channel"} (${channel.id})`
        );
      }
    }
    if (msg.mentions.users) {
      for (const user of msg.mentions.users.values()) {
        content = content.replaceAll(
          `<@${user.id}>`,
          `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`
        );
      }
    }
    if (msg.mentions.roles) {
      for (const role of msg.mentions.roles.values()) {
        content = content.replaceAll(`<@&${role.id}>`, `@${role.name} (${role.id})`);
      }
    }

    transcriptService.write(
      this.ticketId,
      this.allowAnonymity ? this.users[userId].username : user.id,
      this.users[userId]?.username ?? user.username,
      msg.id,
      content,
      msg.createdAt,
      msg.attachments.map((a) => {
        return {
          filename: a.name,
          size: `${Math.round((a.size / 1024) * 100) / 100}kb`,
          url: a.url,
        };
      })
    );

    if (msg.reference?.messageId && msg.type === MessageType.Reply) {
      const referencedMessage = await msg.channel.messages.fetch(msg.reference.messageId);
      if (referencedMessage)
        transcriptService.event(
          this.ticketId,
          "reply",
          msg.id,
          `${referencedMessage.content}${
            referencedMessage.attachments.size > 0 ? ` (+${referencedMessage.attachments.size} files)` : ""
          }`,
          `${referencedMessage.author.username} (${referencedMessage.author.id})`
        );
    }
  }

  public async editMessage(msg: Message) {
    const user = msg.author;
    const userId = this.assignUserId(user);
    if (!this.users[userId]) {
      this.users[userId] = this.captureUserMeta(user, msg.member ?? undefined);
      this.saveMeta();
    }

    let content = msg.content;
    if (msg.mentions.channels) {
      for (const channel of msg.mentions.channels.values()) {
        content = content.replaceAll(
          `<#${channel.id}>`,
          `#${"name" in channel ? channel.name : "Unknown Channel"} (${channel.id})`
        );
      }
    }
    if (msg.mentions.users) {
      for (const user of msg.mentions.users.values()) {
        console.log(
          user,
          `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`,
          content
        );
        content = content.replaceAll(
          `<@${user.id}>`,
          `@${this.users[userId]?.username ?? user.username}${this.allowAnonymity ? "" : ` (${user.id})`}`
        );
      }
    }
    if (msg.mentions.roles) {
      for (const role of msg.mentions.roles.values()) {
        content = content.replaceAll(`<@&${role.id}>`, `@${role.name} (${role.id})`);
      }
    }

    transcriptService.event(this.ticketId, "edit", msg.id, content);
  }

  public async deleteMessage(msgId: string) {
    transcriptService.event(this.ticketId, "delete", msgId);
  }

  public getFilePath(): string {
    return this.filePath;
  }
}
class TranscriptWriterManager {
  private writers = new Map<string, { writer: TranscriptWriter; timeout: NodeJS.Timeout }>();
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
