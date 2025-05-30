import { PermissionFlagsBits } from "discord.js";

export default {
  allow: [
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.ManageThreads,
    PermissionFlagsBits.CreatePrivateThreads,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.MentionEveryone,
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
  ],
  deny: [],
};
