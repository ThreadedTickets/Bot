"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ce5150fe-8602-5a34-baff-aa268626a789")}catch(e){}}();

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
//# sourceMappingURL=Error.js.map
//# debugId=ce5150fe-8602-5a34-baff-aa268626a789
