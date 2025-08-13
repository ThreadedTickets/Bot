"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleApplicationSubmit = handleApplicationSubmit;
const hooks_1 = require("../hooks");
async function handleApplicationSubmit(application, responses, owner, client) {
    await (0, hooks_1.runHooks)("ApplicationEnd", { application, client, responses, owner });
}
//# sourceMappingURL=/src/utils/applications/handleApplicationSubmit.js.map