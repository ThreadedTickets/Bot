"use strict";
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