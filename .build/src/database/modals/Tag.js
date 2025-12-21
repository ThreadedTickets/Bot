"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagSchema = void 0;
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
}, {
    timestamps: false,
});
exports.TagSchema = mongoose_1.default.model("Tags", schema);
//# sourceMappingURL=/src/database/modals/Tag.js.map