import { APIEmbed } from "discord.js";
import * as fs from "fs";
import * as readline from "readline";

interface SerializedMessage {
  messageId: string;
  userId: string;
  type: number;
  content: string;
  embeds: APIEmbed[];
  replyTo?: string;
  edited: boolean;
  timestamp: string;
}

interface UserMetadata {
  username: string;
  roleColor?: string;
  isBot: boolean;
}

interface TranscriptMetadata {
  name?: string;
  channels?: Record<string, string>;
  users?: Record<string, string>;
  roles?: Record<string, string>;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replaceMentions(
  content: string,
  metadata: TranscriptMetadata,
  fallbackUsers: Record<string, UserMetadata>
): string {
  if (!content) return "";

  // Replace user mentions: <@123456789> or <@!123456789>
  content = content.replace(/&lt;@!?(\d+)&gt;/g, (_, userId) => {
    const username =
      metadata.users?.[userId] ||
      fallbackUsers[userId]?.username ||
      "Unknown User";
    return `<span class="mention user-mention">@${username}</span>`;
  });

  // Replace channel mentions: <#123456789>
  content = content.replace(/&lt;#(\d+)&gt;/g, (_, channelId) => {
    const channelName = metadata.channels?.[channelId] || "unknown-channel";
    return `<span class="mention channel-mention">#${channelName}</span>`;
  });

  // Replace role mentions: <@&123456789>
  content = content.replace(/&lt;@&(\d+)&gt;/g, (_, roleId) => {
    const roleName = metadata.roles?.[roleId] || "unknown-role";
    return `<span class="mention role-mention">@${roleName}</span>`;
  });

  return content;
}

function renderEmbed(embed: APIEmbed): string {
  const escape = escapeHtml;

  const colorBar = embed.color
    ? `#${embed.color.toString(16).padStart(6, "0")}`
    : "#4f545c";

  const author = embed.author
    ? `<div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 14px;">
        ${
          embed.author.icon_url
            ? `<img src="${escape(
                embed.author.icon_url
              )}" alt="Author icon" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px;">`
            : ""
        }
        ${
          embed.author.url
            ? `<a href="${escape(
                embed.author.url
              )}" target="_blank" style="font-weight: 500; color: #00a8ff; text-decoration: none;">${escape(
                embed.author.name
              )}</a>`
            : `<span style="font-weight: 500;">${escape(
                embed.author.name
              )}</span>`
        }
      </div>`
    : "";

  const title = embed.title
    ? `<div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">
        ${
          embed.url
            ? `<a href="${escape(
                embed.url
              )}" target="_blank" style="color: #00a8ff; text-decoration: none;">${escape(
                embed.title
              )}</a>`
            : escape(embed.title)
        }
      </div>`
    : "";

  const description = embed.description
    ? `<div style="margin-bottom: 8px; font-size: 14px; line-height: 1.4; white-space: pre-wrap;">${escape(
        embed.description
      )}</div>`
    : "";

  const fields =
    Array.isArray(embed.fields) && embed.fields.length > 0
      ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">${embed.fields
          .map((f: any) => {
            const isInline = f.inline ?? false;
            return `<div style="flex: ${
              isInline ? "1 1 45%" : "1 1 100%"
            }; min-width: 200px;">
              <div style="font-weight: 500; font-size: 13px;">${escape(
                f.name
              )}</div>
              <div style="font-size: 14px; white-space: pre-wrap;">${escape(
                f.value
              )}</div>
            </div>`;
          })
          .join("")}</div>`
      : "";

  const image = embed.image?.url
    ? `<div style="margin-top: 10px;"><img src="${escape(
        embed.image.url
      )}" alt="Embed image" style="max-width: 100%; border-radius: 4px;"></div>`
    : "";

  const thumbnail = embed.thumbnail?.url
    ? `<div style="margin-left: 16px;">
        <img src="${escape(
          embed.thumbnail.url
        )}" alt="Thumbnail" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
      </div>`
    : "";

  const footerText = embed.footer?.text || "";
  const footerIcon = embed.footer?.icon_url
    ? `<img src="${escape(
        embed.footer.icon_url
      )}" alt="Footer icon" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 6px;">`
    : "";

  const timestamp = embed.timestamp
    ? new Date(embed.timestamp).toLocaleString()
    : "";

  const footer =
    footerText || timestamp
      ? `<div style="display: flex; align-items: center; font-size: 12px; color: #b9bbbe; margin-top: 12px;">
          ${footerIcon}
          <span>${escape(footerText)}${
          footerText && timestamp ? " • " : ""
        }${timestamp}</span>
        </div>`
      : "";

  return `<div class="embed-wrapper" style="max-width: 520px; margin: 8px 0;">
    <div class="embed" style="display: flex; border-left: 4px solid ${colorBar}; background: #2f3136; color: #dcddde; padding: 12px; border-radius: 4px; font-family: sans-serif; font-size: 14px;">
      <div style="flex: 1;">
        ${author}
        ${title}
        ${description}
        ${fields}
        ${image}
        ${footer}
      </div>
      ${thumbnail}
    </div>
  </div>`;
}

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

  // Read JSONL file line-by-line
  const fileStream = fs.createReadStream(jsonlFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim() === "") continue;
    try {
      const msg: SerializedMessage = JSON.parse(line);
      messages.push(msg);
    } catch (e) {
      console.error("Invalid JSON line:", line);
    }
  }

  // Build a map for quick reply lookup
  const messageMap = new Map<string, SerializedMessage>();
  for (const msg of messages) {
    messageMap.set(msg.messageId, msg);
  }

  // Render HTML header & styles
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ticket Transcript</title>
<style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: Arial, sans-serif;
        background: #08040c;
        color: #ddd;
      }

      body {
        display: flex;
        flex-direction: row;
        height: 100vh;
        overflow: hidden;
      }

      .user-list {
        width: 300px;
        border-right: 2px solid #444;
        padding: 10px;
        box-sizing: border-box;
        overflow-y: auto;
      }

      .user-list h2 {
        font-size: 18px;
        margin-top: 0;
      }

      .user-list div {
        margin-bottom: 6px;
      }

      .transcript {
        flex-grow: 1;
        padding: 10px;
        box-sizing: border-box;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .user-list {
          display: none;
        }
        
        .transcript {
          margin-left: 0;
        }
      }


      .message {
        padding: 6px 0;
      }

      .author {
        font-weight: bold;
      }

      .timestamp {
        color: #888;
        font-size: 0.8em;
      }

      .reply-snippet {
        font-style: italic;
        color: #aaa;
        font-size: 0.9em;
        margin-top: 4px;
        padding-left: 12px;
        border-left: 2px solid #555;
      }

      .embed img {
        display: block;
        margin-top: 6px;
        max-width: 100%;
        border-radius: 6px;
      }

      .system-message {
        background: #1f1a28;
        border-left: 4px solid #a95df0;
        padding: 8px 12px;
        margin: 10px 0;
        font-style: italic;
        color: #c7bdfc;
        border-radius: 4px
      }

      .message.highlight {
        animation: pulse-bg 1.2s ease;
      }
      .mention {
        display: inline-block;
        padding: 2px 6px;
        margin: 0 1px;
        border-radius: 4px; /* Fully rounded pill shape */
        font-weight: 500;
        font-size: 0.95em;
        cursor: pointer;
        text-decoration: none;
      }
      .user-mention {
        background-color: #5865f2;
        color: #fff;
      }

      .channel-mention {
        background-color: #4f545c;
        color: #ddd;
      }

      .role-mention {
        background-color: #3ba55d;
        color: #fff;
      }

      .mention:hover {
        opacity: 0.85;
      }

      @keyframes pulse-bg {
        0% {
          background-color: #ffffff22;
        }
        50% {
          background-color: #ffffff44;
        }
        100% {
          background-color: transparent;
        }
      }
    </style>
</head>
<body>
`;

  // User summary: count messages per user
  const userMessageCount: Record<string, number> = {};
  for (const msg of messages) {
    userMessageCount[msg.userId] = (userMessageCount[msg.userId] || 0) + 1;
  }

  // User list panel
  html += `<div class="user-list">
  <div>
  <p>${escapeHtml(
    metadata.name ?? "Unknown"
  )}</p><p>Messages: ${messages.length.toLocaleString()}</p></div>
  <div style="margin-top: 6px"><h2>Users</h2>
  ${Object.entries(users)
    .map(([userId, meta]) => {
      const count = userMessageCount[userId] ?? 0;
      const colorStyle = meta.roleColor ? `color: ${meta.roleColor}` : "";
      const botLabel = meta.isBot ? " 🤖" : "";
      return `<div style="${colorStyle}">${escapeHtml(
        meta.username
      )}${botLabel} — ${count} message${count !== 1 ? "s" : ""}</div>`;
    })
    .join("\n")}</div>
</div>`;

  // Messages panel
  html += `<div class="transcript">`;

  for (const msg of messages) {
    const user = users[msg.userId];
    const authorName = user ? escapeHtml(user.username) : "Unknown User";
    const authorColor = user?.roleColor || "#ddd";
    const timestamp = new Date(msg.timestamp).toLocaleString();

    html += `<div class="message" id="msg-${msg.messageId}">
    <div><span class="author" style="color: ${authorColor}">${authorName}</span> <span class="timestamp">${timestamp}</span><span class="timestamp">${
      msg.edited ? " (Edited)" : ""
    }</span></div>`;

    // Message Types
    if (msg.type === 4) {
      html += `<div class="system-message"><em>Thread renamed to “${escapeHtml(
        msg.content
      )}”</em></div>`;
    } else if (msg.type === -1) {
      html += `<div class="system-message">${msg.content}</div>`;
    } else if (msg.type === 6 && msg.replyTo && messageMap.has(msg.replyTo)) {
      const pinned = messageMap.get(msg.replyTo)!;
      const snippet = pinned.content
        ? escapeHtml(
            pinned.content.length > 50
              ? pinned.content.slice(0, 47) + "..."
              : pinned.content
          )
        : "[embed/message]";
      html += `<div class="system-message"><em>Pinned a message: <a style="text-decoration: none; color:#aaa;" href="#msg-${pinned.messageId}">${snippet}</a></em></div>`;
    } else if ((msg.type === 1 || msg.type === 2) && msg.replyTo) {
      const targetUser = users[msg.replyTo];
      const action = msg.type === 1 ? "Added" : "Removed";
      html += `<div class="system-message"><em>${action} <span style="color: ${
        targetUser?.roleColor ?? "#ddd"
      }">@${escapeHtml(
        metadata.users?.[msg.replyTo] || targetUser?.username || "Unknown User"
      )}</span></em></div>`;
    } else {
      // Normal message
      if (msg.replyTo && messageMap.has(msg.replyTo)) {
        const repliedMsg = messageMap.get(msg.replyTo)!;
        const snippet = repliedMsg.content
          ? escapeHtml(
              repliedMsg.content.length > 50
                ? repliedMsg.content.slice(0, 47) + "..."
                : repliedMsg.content
            )
          : "[embed/message]";
        html += `<div class="reply-snippet">Replying to <a style="text-decoration: none; color:#aaa;" href="#msg-${msg.replyTo}">${snippet}</a></div>`;
      }

      html += `<div class="content">${escapeHtml(msg.content)}</div>`;

      // Render embeds
      for (const embed of msg.embeds) {
        html += renderEmbed(embed);
      }
    }

    html += `</div>`;
  }

  html += `</div>`;

  html += `<script>
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href^="#msg-"]').forEach(link => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });

          target.classList.remove("highlight");
          void target.offsetWidth;
          target.classList.add("highlight");
        }
      });
    });
  });
</script></body></html>`;

  return minifyHtml(replaceMentions(html, metadata, users));
}

function minifyHtml(html: string): string {
  // Remove newlines and tabs
  let minified = html.replace(/[\n\r\t]+/g, "") ?? "";

  // Collapse multiple spaces into one, except inside tags (attribute values, text nodes)
  // We do this by splitting text inside and outside tags and minifying only outside tags

  // Regex to split by tags: matches tags or text
  const parts = minified.match(/<[^>]+>|[^<]+/g);
  if (!parts) return html;

  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("<")) {
      // Outside tag — collapse whitespace
      parts[i] = parts[i].replace(/\s{2,}/g, " ");
    } else {
      // Inside tag — keep as is
    }
  }

  // Join all parts without newlines or extra spaces between tags
  return parts.join("").trim();
}
