"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="c12ac08d-ff2a-5eb6-a2ce-64483a2d424a")}catch(e){}}();

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
//# sourceMappingURL=createInDb.js.map
//# debugId=c12ac08d-ff2a-5eb6-a2ce-64483a2d424a
