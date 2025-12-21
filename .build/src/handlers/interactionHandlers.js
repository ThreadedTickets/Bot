"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadInteractionHandlers = exports.selectMenuHandlers = exports.modalHandlers = exports.buttonHandlers = void 0;
const path_1 = __importDefault(require("path"));
const loadHandlers_1 = require("./loadHandlers");
exports.buttonHandlers = new Map();
exports.modalHandlers = new Map();
exports.selectMenuHandlers = new Map();
const loadInteractionHandlers = async () => {
    const baseDir = path_1.default.join(__dirname, "../interactions");
    const buttonFiles = (0, loadHandlers_1.loadHandlersRecursively)(path_1.default.join(baseDir, "buttons"));
    for (const file of buttonFiles) {
        const handler = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        if (handler?.customId)
            exports.buttonHandlers.set(handler.customId, handler);
    }
    const modalFiles = (0, loadHandlers_1.loadHandlersRecursively)(path_1.default.join(baseDir, "modals"));
    for (const file of modalFiles) {
        const handler = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        if (handler?.customId)
            exports.modalHandlers.set(handler.customId, handler);
    }
    const selectMenuFiles = (0, loadHandlers_1.loadHandlersRecursively)(path_1.default.join(baseDir, "selectMenus"));
    for (const file of selectMenuFiles) {
        const handler = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        if (handler?.customId)
            exports.selectMenuHandlers.set(handler.customId, handler);
    }
};
exports.loadInteractionHandlers = loadInteractionHandlers;
//# sourceMappingURL=/src/handlers/interactionHandlers.js.map