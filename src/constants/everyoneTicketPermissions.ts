import { PermissionFlagsBits } from "discord.js";

export default {
  allow: [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
  ],
  deny: [PermissionFlagsBits.ViewChannel],
};
