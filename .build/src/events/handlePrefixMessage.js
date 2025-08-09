"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f216b88b-324b-5db6-a0e4-7250be94a0a9")}catch(e){}}();

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
//# sourceMappingURL=/src/events/handlePrefixMessage.js.map
//# debugId=f216b88b-324b-5db6-a0e4-7250be94a0a9
