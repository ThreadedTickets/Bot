"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationCreatorSchema = void 0;
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
    existingApplication: {
        type: Object,
        required: false,
    },
}, {
    timestamps: true,
});
exports.ApplicationCreatorSchema = mongoose_1.default.model("Application Creators", schema);
//# sourceMappingURL=/src/database/modals/ApplicationCreator.js.map