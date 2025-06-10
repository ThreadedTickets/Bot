// transcriptRenderer.tsx
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import fs from "fs/promises";
import readline from "readline";

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

export interface APIEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; icon_url?: string; url?: string };
}

export interface UserMetadata {
  username: string;
  avatarUrl?: string;
  isBot?: boolean;
  color?: string;
}

interface TranscriptProps {
  messages: SerializedMessage[];
  users: Record<string, UserMetadata>;
  messageMap: Map<string, SerializedMessage>;
}

const Transcript: React.FC<TranscriptProps> = ({
  messages,
  users,
  messageMap,
}) => (
  <div className="transcript">
    {messages.map((msg) => (
      <Message
        key={msg.messageId}
        msg={msg}
        users={users}
        messageMap={messageMap}
      />
    ))}
  </div>
);

const Message: React.FC<{
  msg: SerializedMessage;
  users: Record<string, UserMetadata>;
  messageMap: Map<string, SerializedMessage>;
}> = ({ msg, users, messageMap }) => {
  const user = users[msg.userId];
  const isSystem = msg.type !== 0 && msg.type !== 19;

  return (
    <div className={`message ${isSystem ? "system" : "user"}`}>
      {!isSystem && (
        <div className="author">
          {user.avatarUrl && (
            <img className="avatar" src={user.avatarUrl} alt="avatar" />
          )}
          <span className="username" style={{ color: user.color || "#fff" }}>
            {user.username}
          </span>
          {user.isBot && <span className="badge">BOT</span>}
          <span className="timestamp">
            {new Date(msg.timestamp).toLocaleString()}
          </span>
        </div>
      )}
      {msg.replyTo && messageMap.has(msg.replyTo) && (
        <Reply replyTo={messageMap.get(msg.replyTo)!} users={users} />
      )}
      <div className="content">{renderContent(msg.content)}</div>
      {msg.embeds.map((embed, idx) => (
        <Embed key={idx} embed={embed} />
      ))}
      {isSystem && <div className="system-message">{msg.content}</div>}
    </div>
  );
};

const Reply: React.FC<{
  replyTo: SerializedMessage;
  users: Record<string, UserMetadata>;
}> = ({ replyTo, users }) => {
  const user = users[replyTo.userId];
  return (
    <div className="reply">
      <span className="reply-user">Replying to {user.username}</span>
      <div className="reply-content">{replyTo.content}</div>
    </div>
  );
};

const Embed: React.FC<{ embed: APIEmbed }> = ({ embed }) => (
  <div
    className="embed"
    style={{
      borderLeft: `4px solid #${embed.color?.toString(16) || "7289da"}`,
    }}
  >
    {embed.author && (
      <div className="embed-author">
        {embed.author.icon_url && (
          <img
            src={embed.author.icon_url}
            alt="author icon"
            className="embed-author-icon"
          />
        )}
        <span className="embed-author-name">{embed.author.name}</span>
      </div>
    )}
    {embed.title && <div className="embed-title">{embed.title}</div>}
    {embed.description && (
      <div className="embed-description">{embed.description}</div>
    )}
    {embed.fields &&
      embed.fields.map((f, i) => (
        <div className="embed-field" key={i}>
          <div className="embed-field-name">{f.name}</div>
          <div className="embed-field-value">{f.value}</div>
        </div>
      ))}
    {embed.image && (
      <img className="embed-image" src={embed.image.url} alt="embed" />
    )}
    {embed.footer && <div className="embed-footer">{embed.footer.text}</div>}
  </div>
);

const renderContent = (content: string): React.ReactNode => {
  // Handle custom emojis like <:name:id> or <a:name:id>
  const emojiRegex = /<(a?):(\w+):(\d+)>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(emojiRegex)) {
    const [full, animated, name, id] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(content.slice(lastIndex, index));
    const ext = animated ? "gif" : "png";
    parts.push(
      <img
        className="emoji"
        src={`https://cdn.discordapp.com/emojis/${id}.${ext}`}
        alt={name}
      />
    );
    lastIndex = index + full.length;
  }

  if (lastIndex < content.length) parts.push(content.slice(lastIndex));
  return parts;
};

export async function renderTranscriptFromJsonl(
  jsonlFilePath: string,
  users: Record<string, UserMetadata>,
  metadata: {
    name?: string;
    users?: Record<string, string>;
    channels?: Record<string, string>;
    roles?: Record<string, string>;
  }
): Promise<string> {
  const messages: SerializedMessage[] = [];
  const fileStream = await fs.open(jsonlFilePath);
  const rl = readline.createInterface({
    input: fileStream.createReadStream(),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        messages.push(JSON.parse(line));
      } catch (e) {
        console.error("Invalid JSON line:", line);
      }
    }
  }

  const messageMap = new Map(messages.map((m) => [m.messageId, m]));
  const html = renderToStaticMarkup(
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.name || "Discord Transcript"}</title>
        <style>{`
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
        `}</style>
      </head>
      <body>
        <Transcript messages={messages} users={users} messageMap={messageMap} />
      </body>
    </html>
  );

  return "<!DOCTYPE html>" + html;
}
