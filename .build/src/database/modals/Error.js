"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="44ed1326-8211-58f0-bee3-15f4f1a54810")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    context: {
        type: Object,
        required: false,
        default: null,
    },
}, {
    timestamps: true,
});
exports.ErrorSchema = mongoose_1.default.model("Errors", schema);
//# sourceMappingURL=/src/database/modals/Error.js.map
//# debugId=44ed1326-8211-58f0-bee3-15f4f1a54810
