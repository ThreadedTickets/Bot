"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoResponderSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    server: {
        type: String,
        required: true,
        ref: "Guilds",
    },
    name: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    matcherType: {
        type: String,
        required: true,
        enum: ["exact", "includes", "starts", "ends", "regex"],
    },
    matcherScope: {
        type: Object,
        required: true,
        default: {
            clean: Boolean,
            normalized: Boolean,
        },
    },
    matcher: {
        type: String,
        required: true,
    },
}, {
    timestamps: false,
});
exports.AutoResponderSchema = mongoose_1.default.model("AutoResponders", schema);
//# sourceMappingURL=/src/database/modals/AutoResponder.js.map