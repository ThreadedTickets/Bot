"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = require("../../../constants/permissions");
const transcript_1 = require("../../../transcript");
const TranscriptManager_1 = require("../../../utils/tickets/TranscriptManager");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cmd = {
    name: "transcript",
    usage: "<id>",
    permissionLevel: permissions_1.CommandPermission.Owner,
    async execute(client, data, message, args) {
        if (!message.guildId)
            return;
        const manager = new TranscriptManager_1.TranscriptWriter(args.id);
        const transcriptPath = path_1.default.join(process.cwd(), "transcripts", "out.html");
        fs_1.default.writeFileSync(transcriptPath, await (0, transcript_1.renderTranscriptFromJsonl)(manager.getFilePath(), manager.getMeta().users, manager.getMeta().metadata));
    },
};
exports.default = cmd;
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5638ddf0-cbdd-538e-9a20-5eb46120596c")}catch(e){}}();
//# sourceMappingURL=errorCode%20copy.js.map
//# debugId=5638ddf0-cbdd-538e-9a20-5eb46120596c
