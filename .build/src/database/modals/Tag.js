"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="30f1f9a0-43ee-5137-92dc-d540b89e4bc5")}catch(e){}}();

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
//# debugId=30f1f9a0-43ee-5137-92dc-d540b89e4bc5
