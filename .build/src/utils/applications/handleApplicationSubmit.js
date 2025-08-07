"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a14299d0-6e77-5525-8d8e-f75258d172e1")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApplicationSubmit = handleApplicationSubmit;
const hooks_1 = require("../hooks");
async function handleApplicationSubmit(application, responses, owner, client) {
    await (0, hooks_1.runHooks)("ApplicationEnd", { application, client, responses, owner });
}
//# sourceMappingURL=handleApplicationSubmit.js.map
//# debugId=a14299d0-6e77-5525-8d8e-f75258d172e1
