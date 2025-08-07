"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="0d05a94f-db81-5308-90e4-9e4cd0a909ca")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const button = {
    customId: "cancelApp",
    async execute(client, data, interaction) {
        interaction.message.edit({ components: [] });
        interaction.deferUpdate();
    },
};
exports.default = button;
//# sourceMappingURL=cancelApp.js.map
//# debugId=0d05a94f-db81-5308-90e4-9e4cd0a909ca
