"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f4c8dcd9-cc2e-57af-ace4-5987e9513366")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketTriggerCreatorSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true,
    },
    metadata: {
        type: Object,
        default: null,
    },
    existingTrigger: {
        type: Object,
        required: false,
    },
}, {
    timestamps: true,
});
exports.TicketTriggerCreatorSchema = mongoose_1.default.model("Ticket Trigger Creators", schema);
//# sourceMappingURL=/src/database/modals/TicketTriggerCreator.js.map
//# debugId=f4c8dcd9-cc2e-57af-ace4-5987e9513366
