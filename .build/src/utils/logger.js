"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f533ed27-1e53-51ac-af09-ae6cf3056e38")}catch(e){}}();

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Sentry = __importStar(require("@sentry/node"));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["TRACE"] = "TRACE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(name = "app", options = {}) {
        this.currentFileStream = null;
        this.currentFilePath = "";
        this.currentFileSize = 0;
        this.name = name;
        this.options = {
            level: LogLevel.DEBUG,
            timestamp: true,
            colors: true,
            ...options,
        };
        if (this.options.file) {
            this.ensureLogDirectory();
            this.createNewLogFile();
        }
    }
    ensureLogDirectory() {
        if (!this.options.file)
            return;
        try {
            if (!fs.existsSync(this.options.file.dir)) {
                fs.mkdirSync(this.options.file.dir, { recursive: true });
            }
        }
        catch (err) {
            console.error("Failed to create log directory:", err);
        }
    }
    getCurrentDateString() {
        return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    }
    generateFileName() {
        const dateStr = this.getCurrentDateString();
        return path.join(this.options.file.dir, `${dateStr}_${this.name}.log`);
    }
    createNewLogFile() {
        if (!this.options.file)
            return;
        try {
            // Close previous file if exists
            if (this.currentFileStream) {
                this.currentFileStream.end();
            }
            this.currentFilePath = this.generateFileName();
            this.currentFileSize = 0;
            // Create new file stream
            this.currentFileStream = fs.createWriteStream(this.currentFilePath, {
                flags: "a",
                encoding: "utf8",
            });
            // Write header
            const header = `[${new Date().toISOString()}] [${this.name}] Logging started\n`;
            this.currentFileStream.write(header);
            this.currentFileSize += Buffer.byteLength(header, "utf8");
        }
        catch (err) {
            console.error("Failed to create log file:", err);
            this.currentFileStream = null;
        }
    }
    shouldRotateFile() {
        if (!this.options.file || !this.currentFileStream)
            return false;
        return (this.currentFileSize >=
            (this.options.file.maxFileSize || 10 * 1024 * 1024)); // Default 10MB
    }
    writeToFile(message) {
        if (!this.options.file || !this.currentFileStream)
            return;
        try {
            if (this.shouldRotateFile()) {
                this.createNewLogFile();
            }
            const messageSize = Buffer.byteLength(message, "utf8");
            this.currentFileStream.write(message + "\n");
            this.currentFileSize += messageSize + 1; // +1 for newline
        }
        catch (err) {
            console.error("Failed to write to log file:", err);
        }
    }
    shouldLog(level) {
        const levels = Object.values(LogLevel);
        const currentLevelIdx = levels.indexOf(this.options.level);
        const messageLevelIdx = levels.indexOf(level);
        return messageLevelIdx <= currentLevelIdx;
    }
    getColor(level) {
        if (!this.options.colors)
            return "";
        const colors = {
            [LogLevel.ERROR]: "\x1b[31m", // red
            [LogLevel.WARN]: "\x1b[33m", // yellow
            [LogLevel.INFO]: "\x1b[36m", // cyan
            [LogLevel.DEBUG]: "\x1b[35m", // magenta
            [LogLevel.TRACE]: "\x1b[32m", // green
        };
        return colors[level] || "";
    }
    resetColor() {
        return this.options.colors ? "\x1b[0m" : "";
    }
    formatMessage(level, message, ...args) {
        const timestamp = this.options.timestamp
            ? `[${new Date().toISOString()}] `
            : "";
        const levelStr = `[${level}]`;
        const nameStr = `[${this.name}]`;
        // Special handling for Error objects to include stack trace
        const processedArgs = args.map((arg) => {
            if (arg instanceof Error) {
                return `${arg.message}\n${arg.stack}`;
            }
            else if (typeof arg === "object") {
                return JSON.stringify(arg, null, 2);
            }
            return arg;
        });
        const baseMessage = `${timestamp}${levelStr}${nameStr}: ${message} ${processedArgs.join(" ")}`;
        return {
            consoleMessage: `${this.getColor(level)}${baseMessage}${this.resetColor()}`,
            fileMessage: baseMessage, // No colors in file
        };
    }
    log(level, message, ...args) {
        if (!this.shouldLog(level))
            return;
        const { consoleMessage, fileMessage } = this.formatMessage(level, message, ...args);
        if (level === LogLevel.ERROR) {
            console.error(consoleMessage);
            this.captureSentryError(message, args);
        }
        else if (level === LogLevel.WARN) {
            console.warn(consoleMessage);
            this.captureSentryWarning(message, args);
        }
        else {
            console.log(consoleMessage);
        }
        this.writeToFile(fileMessage);
    }
    captureSentryError(message, args) {
        const error = args.find((arg) => arg instanceof Error);
        if (error) {
            Sentry.captureException(error);
        }
        else {
            Sentry.captureMessage(message, {
                level: "error",
                extra: { args },
            });
        }
    }
    captureSentryWarning(message, args) {
        Sentry.captureMessage(message, {
            level: "warning",
            extra: { args },
        });
    }
    error(message, ...args) {
        this.log(LogLevel.ERROR, message, ...args);
    }
    warn(message, ...args) {
        this.log(LogLevel.WARN, message, ...args);
    }
    info(message, ...args) {
        this.log(LogLevel.INFO, message, ...args);
    }
    debug(message, ...args) {
        this.log(LogLevel.DEBUG, message, ...args);
    }
    trace(message, ...args) {
        this.log(LogLevel.TRACE, message, ...args);
    }
    setLevel(level) {
        this.options.level = level;
    }
    captureException(error, context) {
        if (context) {
            Sentry.withScope((scope) => {
                Object.entries(context).forEach(([key, value]) => {
                    scope.setExtra(key, value);
                });
                Sentry.captureException(error);
            });
        }
        else {
            Sentry.captureException(error);
        }
        // Also log locally
        this.error("Captured exception:", error);
    }
    close() {
        if (this.currentFileStream) {
            this.currentFileStream.end();
            this.currentFileStream = null;
        }
    }
}
exports.Logger = Logger;
const logger = new Logger("threaded", {
    colors: true,
    file: {
        dir: "./logs",
    },
    timestamp: true,
});
exports.default = logger;
//# sourceMappingURL=/src/utils/logger.js.map
//# debugId=f533ed27-1e53-51ac-af09-ae6cf3056e38
