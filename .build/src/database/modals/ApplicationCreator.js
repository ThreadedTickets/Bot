"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a4f44857-d277-5a96-9682-e1489306f5ff")}catch(e){}}();

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
//# sourceMappingURL=ApplicationCreator.js.map
//# debugId=a4f44857-d277-5a96-9682-e1489306f5ff
