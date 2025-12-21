"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../..");
const CompletedApplications_1 = require("../../../../../database/modals/CompletedApplications");
const generateId_1 = require("../../../../database/generateId");
const invalidateCache_1 = require("../../../../database/invalidateCache");
(0, __1.registerHook)("ApplicationEnd", async ({ application, responses, owner, client, }) => {
    const id = (0, generateId_1.generateId)("CA");
    await CompletedApplications_1.CompletedApplicationSchema.create({
        _id: id,
        application: application._id,
        createdAt: new Date(),
        owner: owner,
        responses: responses.responses,
    });
    (0, invalidateCache_1.invalidateCache)(`runningApplications:${owner}`);
    (0, invalidateCache_1.invalidateCache)(`completedApps:${application._id}:${owner}:all`);
    (0, invalidateCache_1.invalidateCache)(`completedApps:${application._id}:Pending`);
    (0, __1.runHooks)("ApplicationFinal", { application, responses, owner, client, id });
}, 10);
//# sourceMappingURL=/src/utils/hooks/events/applications/end/createInDb.js.map