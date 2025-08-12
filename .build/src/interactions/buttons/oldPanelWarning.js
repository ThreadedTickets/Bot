"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onError_1 = require("../../utils/onError");
const button = {
    customId: "openTicket",
    async execute(client, data, interaction) {
        interaction.reply((await (0, onError_1.onError)(new Error("This is an old panel and can no longer be used. If you are a server admin, please run /panel to create a new panel"))).discordMsg);
    },
};
exports.default = button;
//# sourceMappingURL=/src/interactions/buttons/oldPanelWarning.js.map