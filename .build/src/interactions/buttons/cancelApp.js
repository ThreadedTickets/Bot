"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const button = {
    customId: "cancelApp",
    async execute(client, data, interaction) {
        interaction.message.edit({ components: [] });
        interaction.deferUpdate();
    },
};
exports.default = button;
//# sourceMappingURL=/src/interactions/buttons/cancelApp.js.map