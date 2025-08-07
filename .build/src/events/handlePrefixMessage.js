"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cb84a57b-6f96-557a-9ae3-9062426236e4")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
const commandHandler_1 = require("../handlers/commandHandler");
const event = {
    name: "messageCreate",
    once: false,
    async execute(client, data, message) {
        (0, commandHandler_1.handlePrefixMessage)(client, data, message);
    },
};
exports.default = event;
//# sourceMappingURL=handlePrefixMessage.js.map
//# debugId=cb84a57b-6f96-557a-9ae3-9062426236e4
