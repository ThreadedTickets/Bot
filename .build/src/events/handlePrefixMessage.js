"use strict";
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