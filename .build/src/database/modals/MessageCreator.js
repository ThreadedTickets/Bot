"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageCreatorSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    metadata: {
        type: Object,
        default: null,
    },
    existingMessage: {
        type: {
            _id: {
                type: String,
                default: null,
            },
            content: {
                type: String,
                default: null,
            },
            embeds: {
                type: Array,
                default: [],
            },
            components: {
                type: Array,
                default: [],
            },
            attachments: {
                type: Array,
                default: [],
            },
        },
        required: false,
    },
}, {
    timestamps: true,
});
exports.MessageCreatorSchema = mongoose_1.default.model("Message Creators", schema);
//# sourceMappingURL=/src/database/modals/MessageCreator.js.map