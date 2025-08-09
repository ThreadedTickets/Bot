"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f6d149a8-714f-5597-9aaf-812ecb6a6ac7")}catch(e){}}();

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
//# debugId=f6d149a8-714f-5597-9aaf-812ecb6a6ac7
