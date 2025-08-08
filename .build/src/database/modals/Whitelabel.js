"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b2b9d273-0ffd-5fd5-8624-9e55b6d976c3")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhitelabelSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    owner: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        required: true,
    },
    _id: {
        type: Number,
        required: true,
    },
    fullId: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    validUntil: {
        type: Date,
        required: false,
        default: null,
    },
}, {
    timestamps: true,
});
exports.WhitelabelSchema = mongoose_1.default.model("Whitelabels", schema);
//# sourceMappingURL=/src/database/modals/Whitelabel.js.map
//# debugId=b2b9d273-0ffd-5fd5-8624-9e55b6d976c3
