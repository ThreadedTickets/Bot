"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="978864ae-3878-55c6-8d0b-5a711144d16a")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongooseDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectToMongooseDatabase = async () => {
    if (!process.env["MONGOOSE_URI"]) {
        logger_1.default.error("To connect to the database you must provide a connection URI, username and password");
        process.exit(1);
    }
    try {
        const databaseClient = await mongoose_1.default.connect(process.env["MONGOOSE_URI"] ?? "");
        databaseClient.connection.useDb("ThreadedTs");
        logger_1.default.info(`Connected to the database ${databaseClient.connection.db?.namespace} successfully`);
    }
    catch (err) {
        logger_1.default.error("Failed to connect to database:", err);
        process.exit(1);
    }
};
exports.connectToMongooseDatabase = connectToMongooseDatabase;
//# sourceMappingURL=/src/database/connection.js.map
//# debugId=978864ae-3878-55c6-8d0b-5a711144d16a
