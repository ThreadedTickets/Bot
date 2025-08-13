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
exports.deployAppCommands = exports.appCommands = void 0;
const path_1 = __importDefault(require("path"));
const load_1 = require("../utils/commands/load");
require("@dotenvx/dotenvx");
const config_1 = __importDefault(require("../config"));
exports.appCommands = new Map();
// Reload the commands and check if the files have changed
const deployAppCommands = async () => {
    const files = (0, load_1.loadFilesRecursively)(path_1.default.join(__dirname, "../commands/interactions"));
    const globalToRegister = [];
    const guildToRegister = [];
    for (const file of files) {
        const command = (await Promise.resolve(`${file}`).then(s => __importStar(require(s)))).default;
        if (config_1.default.isWhiteLabel && command.testGuild)
            continue;
        exports.appCommands.set(command.data.name, command);
    }
};
exports.deployAppCommands = deployAppCommands;
//# sourceMappingURL=/src/handlers/interactionCommandHandler.js.map