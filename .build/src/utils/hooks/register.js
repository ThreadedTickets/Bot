"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1f23e92c-a3c9-5716-8d89-815334a7ace7")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
require("./events/testEvent");
require("./events/applications/confirmDM");
require("./events/applications/end/createInDb");
require("./events/applications/end/sendToDiscordLog");
require("./events/applications/end/sendToSubmissionChannel");
require("./events/applications/end/roles");
require("./events/tickets/new/main");
require("./events/tickets/new/roles");
//# sourceMappingURL=/src/utils/hooks/register.js.map
//# debugId=1f23e92c-a3c9-5716-8d89-815334a7ace7
