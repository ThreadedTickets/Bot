"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupCreatorSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Guild_1 = require("./Guild");
const schema = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true,
    },
    metadata: {
        type: Object,
        default: null,
    },
    existingGroup: {
        type: Guild_1.groupSchema,
        required: false,
    },
}, {
    timestamps: true,
});
exports.GroupCreatorSchema = mongoose_1.default.model("Group Creators", schema);
//# sourceMappingURL=/src/database/modals/GroupCreator.js.map