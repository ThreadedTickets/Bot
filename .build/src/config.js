"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9067eb67-afdd-5c3b-b0c2-ed369a4fc881")}catch(e){}}();

Object.defineProperty(exports, "__esModule", { value: true });
require("@dotenvx/dotenvx");
exports.default = {
    client: {
        token: process.env["DISCORD_TOKEN"] ?? null,
        cache: {},
    },
    prefix: ">",
    mongoose: {
        uri: process.env["MONGOOSE_URI"] ?? null,
        username: process.env["MONGOOSE_USERNAME"] ?? null,
        password: process.env["MONGOOSE_PASSWORD"] ?? null,
    },
    api: {
        token: process.env["API_TOKEN"] ?? "",
        port: parseInt(process.env["API_PORT"] ?? "", 10),
    },
    redis: {
        host: process.env["REDIS_HOST"] ?? null,
        port: parseInt(process.env["REDIS_PORT"] ?? "", 10),
        password: process.env["REDIS_PASSWORD"] ?? "",
    },
    owner: process.env["DISCORD_OWNER"] ?? "",
    admins: (process.env["DISCORD_ADMINS"] ?? "").split(", "),
};
//# sourceMappingURL=config.js.map
//# debugId=9067eb67-afdd-5c3b-b0c2-ed369a4fc881
