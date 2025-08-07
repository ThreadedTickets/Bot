"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="39d2ae54-a451-5c3f-979c-934dce6291dc")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletedApplicationSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const response = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
}, { _id: false });
const schema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    // Im gonna say that knowing the server shouldn't matter in this case, we should be able to get it from the application
    application: {
        type: String,
        ref: "Application Triggers",
        required: true,
    },
    // This will be the owner of the attempt
    owner: {
        type: String,
        required: true,
    },
    messageLink: {
        type: String,
        required: false,
        default: null,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Accepted", "Rejected"],
    },
    // This is when a status other than pending is set, used for cooldowns
    closedAt: {
        type: Date,
        required: false,
        default: null,
    },
    responses: {
        type: [response],
        required: true,
    },
});
exports.CompletedApplicationSchema = mongoose_1.default.model("Completed Applications", schema);
//# sourceMappingURL=CompletedApplications.js.map
//# debugId=39d2ae54-a451-5c3f-979c-934dce6291dc
