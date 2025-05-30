import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import colours from "../../constants/colours";
import { t } from "../../lang";
import { PrefixCommand } from "../../types/Command";

const cmd: PrefixCommand<{
  error_code: string;
}> = {
  name: "errorcode",
  usage: "<error_code>",
  aliases: ["ec", "errc"],

  async execute(client, data, message, args) {
    if (!message.guildId) return;
    const lang = data.lang!;

    message.reply({
      embeds: [
        {
          color: parseInt(colours.info, 16),
          title: t(lang, `ERROR_CODE_HELP_TITLE`, {
            error_code: args.error_code,
          }),
          description: t(lang, `ERROR_CODE_${args.error_code}`),
        },
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(t(lang, "SUPPORT_SERVER"))
            .setURL(process.env["DISCORD_SUPPORT_INVITE"]!)
            .setStyle(ButtonStyle.Link)
        ),
      ],
    });
  },
};

export default cmd;
