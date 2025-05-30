import { ButtonHandler } from "../../types/Interactions";

const button: ButtonHandler = {
  customId: "cancelApp",
  async execute(client, data, interaction) {
    interaction.message.edit({ components: [] });
    interaction.deferUpdate();
  },
};

export default button;
