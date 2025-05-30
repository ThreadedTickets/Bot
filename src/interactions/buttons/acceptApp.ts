import { t } from "../../lang";
import { ButtonHandler } from "../../types/Interactions";
import {
  getCompletedApplication,
  getServerApplication,
  getServerGroupsByIds,
} from "../../utils/bot/getServer";
import { onError } from "../../utils/onError";
import { getUserPermissions } from "../../utils/calculateUserPermissions";
import { GuildMember, MessageFlags, PermissionFlagsBits } from "discord.js";
import { generateReasonModal } from "../../utils/bot/generateReasonModal";

const button: ButtonHandler = {
  customId: "accApp",
  async execute(client, data, interaction) {
    if (!interaction.guildId) return;
    const [, applicationId, owner] = interaction.customId.split(":");

    const application = await getCompletedApplication(applicationId, owner);
    if (!application)
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND")
          )
        ).discordMsg
      );

    if (application.status !== "Pending")
      return interaction.reply(
        (await onError("Commands", t(data.lang!, "APPLICATION_NOT_PENDING")))
          .discordMsg
      );
    const applicationTrigger = await getServerApplication(
      application.application,
      interaction.guildId
    );
    if (!applicationTrigger)
      return interaction.reply(
        (
          await onError(
            "Commands",
            t(data.lang!, "CONFIG_CREATE_APPLICATION_NOT_FOUND")
          )
        ).discordMsg
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
        (await onError("Commands", t(data.lang!, "MISSING_PERMISSIONS")))
          .discordMsg
      );

    return interaction.showModal(
      generateReasonModal(interaction.customId, false)
    );
  },
};

export default button;
