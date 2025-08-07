import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import {
  getCompletedApplication,
  getServerApplication,
  getServerGroupsByIds,
} from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import { generateReasonModal } from "../../utils/bot/generateReasonModal";

const button: ButtonHandler = {
  customId: "accApp",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, applicationId, owner] = interaction.customId.split(":");

    const application = await getCompletedApplication(applicationId, owner);
    if (!application)
      return interaction.reply(
        (await onError(new Error("Application attempt not found"))).discordMsg
      );

    if (application.status !== "Pending")
      return interaction.reply(
        (await onError(new Error("Application already responded"))).discordMsg
      );
    const applicationTrigger = await getServerApplication(
      application.application,
      interaction.guildId
    );
    if (!applicationTrigger)
      return interaction.reply(
        (await onError(new Error("Application not found"))).discordMsg
      );
    const userPermissions = getUserPermissions(
      interaction.member as GuildMember,
      await getServerGroupsByIds(applicationTrigger.groups, interaction.guildId)
    );
    if (
      !userPermissions.applications.respond &&
      !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
    )
      return interaction.reply(
        (await onError(new Error("Missing respond permission"))).discordMsg
      );

    return interaction.showModal(
      generateReasonModal(interaction.customId, false)
    );
  },
};

export default button;
