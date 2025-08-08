"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3bbac6bd-3aa9-5b2d-8955-34556c7d848a")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApplicationSubmit = handleApplicationSubmit;
const hooks_1 = require("../hooks");
async function handleApplicationSubmit(application, responses, owner, client) {
    await (0, hooks_1.runHooks)("ApplicationEnd", { application, client, responses, owner });
}
//# sourceMappingURL=/src/utils/applications/handleApplicationSubmit.js.map
//# debugId=3bbac6bd-3aa9-5b2d-8955-34556c7d848a
