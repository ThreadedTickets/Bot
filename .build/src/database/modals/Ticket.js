"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a0d25a82-8cb6-52ad-b86f-f13d5dfb9dbf")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const response = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        default: "None",
    },
});
const schema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    server: {
        type: String,
        required: true,
        ref: "Guilds",
    },
    trigger: {
        type: String,
        required: true,
        ref: "Ticket Triggers",
    },
    status: {
        type: String,
        default: "Open",
        enum: ["Open", "Closed", "Locked"],
    },
    isRaised: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: String,
        required: true,
    },
    groups: {
        type: [String],
        default: [],
    },
    channel: {
        type: String,
        required: true,
    },
    allowAutoResponders: {
        type: Boolean,
        default: true,
    },
    closeChannel: {
        type: String,
        default: null,
    },
    categoriesAvailableToMoveTicketsTo: {
        type: [String],
        default: [],
    },
    takeTranscripts: {
        type: Boolean,
        default: true,
    },
    closeOnLeave: {
        type: Boolean,
        default: true,
    },
    responses: {
        type: [response],
        default: [],
    },
    addRolesOnOpen: { type: [String], default: [] },
    addRolesOnClose: { type: [String], default: [] },
    removeRolesOnOpen: { type: [String], default: [] },
    removeRolesOnClose: { type: [String], default: [] },
    allowRaising: { type: Boolean, default: true },
    allowReopening: { type: Boolean, default: true },
    syncChannelPermissionsWhenMoved: { type: Boolean, default: false },
    dmOnClose: { type: String, default: null },
    createdAt: { type: Date, default: null, required: true },
    deletedAt: { type: Date, default: null },
    closeReason: { type: String, default: null },
}, {
    timestamps: false,
});
exports.TicketSchema = mongoose_1.default.model("Tickets", schema);
//# sourceMappingURL=/src/database/modals/Ticket.js.map
//# debugId=a0d25a82-8cb6-52ad-b86f-f13d5dfb9dbf
