import { ButtonHandler } from "../../types/Interactions";
import { onError } from "../../utils/onError";

const button: ButtonHandler = {
  customId: "openTicket",
  async execute(client, data, interaction) {
    interaction.reply(
      (
        await onError(
          "Commands",
          "This is an old panel and can no longer be used. If you are a server admin, please run /panel to create a new panel"
        )
      ).discordMsg
    );
  },
};

export default button;
