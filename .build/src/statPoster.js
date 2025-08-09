"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d356a672-638a-5a68-841d-f0df3269125c")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = statPoster;
const topgg_autoposter_1 = __importDefault(require("topgg-autoposter"));
const logger_1 = __importDefault(require("./utils/logger"));
function statPoster(client) {
    const topGgPost = (0, topgg_autoposter_1.default)(process.env["TOP_GG_TOKEN"], client);
    topGgPost.on("posted", () => logger_1.default.debug("Posted top.gg stats"));
    topGgPost.on("error", (error) => logger_1.default.debug("Failed to post top.gg stats", error));
}
//# sourceMappingURL=/src/statPoster.js.map
//# debugId=d356a672-638a-5a68-841d-f0df3269125c
