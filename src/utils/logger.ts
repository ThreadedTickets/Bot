import * as fs from "fs";
import * as path from "path";
import * as Sentry from "@sentry/node";

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
  TRACE = "TRACE",
}

export interface FileLoggerOptions {
  dir: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

export interface LoggerOptions {
  level?: LogLevel;
  timestamp?: boolean;
  colors?: boolean;
  file?: FileLoggerOptions;
}

export class Logger {
  private name: string;
  private options: LoggerOptions;
  private currentFileStream: fs.WriteStream | null = null;
  private currentFilePath: string = "";
  private currentFileSize: number = 0;

  constructor(name: string = "app", options: LoggerOptions = {}) {
    this.name = name;
    this.options = {
      level: LogLevel.INFO,
      timestamp: true,
      colors: true,
      ...options,
    };

    if (this.options.file) {
      this.ensureLogDirectory();
      this.createNewLogFile();
    }
  }

  private ensureLogDirectory(): void {
    if (!this.options.file) return;

    try {
      if (!fs.existsSync(this.options.file.dir)) {
        fs.mkdirSync(this.options.file.dir, { recursive: true });
      }
    } catch (err) {
      console.error("Failed to create log directory:", err);
    }
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  private generateFileName(): string {
    const dateStr = this.getCurrentDateString();
    return path.join(this.options.file!.dir, `${dateStr}_${this.name}.log`);
  }

  private createNewLogFile(): void {
    if (!this.options.file) return;

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
      const header = `[${new Date().toISOString()}] [${
        this.name
      }] Logging started\n`;
      this.currentFileStream.write(header);
      this.currentFileSize += Buffer.byteLength(header, "utf8");
    } catch (err) {
      console.error("Failed to create log file:", err);
      this.currentFileStream = null;
    }
  }

  private shouldRotateFile(): boolean {
    if (!this.options.file || !this.currentFileStream) return false;
    return (
      this.currentFileSize >=
      (this.options.file.maxFileSize || 10 * 1024 * 1024)
    ); // Default 10MB
  }

  private writeToFile(message: string): void {
    if (!this.options.file || !this.currentFileStream) return;

    try {
      if (this.shouldRotateFile()) {
        this.createNewLogFile();
      }

      const messageSize = Buffer.byteLength(message, "utf8");
      this.currentFileStream.write(message + "\n");
      this.currentFileSize += messageSize + 1; // +1 for newline
    } catch (err) {
      console.error("Failed to write to log file:", err);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIdx = levels.indexOf(this.options.level!);
    const messageLevelIdx = levels.indexOf(level);
    return messageLevelIdx <= currentLevelIdx;
  }

  private getColor(level: LogLevel): string {
    if (!this.options.colors) return "";

    const colors: Record<LogLevel, string> = {
      [LogLevel.ERROR]: "\x1b[31m", // red
      [LogLevel.WARN]: "\x1b[33m", // yellow
      [LogLevel.INFO]: "\x1b[36m", // cyan
      [LogLevel.DEBUG]: "\x1b[35m", // magenta
      [LogLevel.TRACE]: "\x1b[32m", // green
    };

    return colors[level] || "";
  }

  private resetColor(): string {
    return this.options.colors ? "\x1b[0m" : "";
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: any[]
  ): { consoleMessage: string; fileMessage: string } {
    const timestamp = this.options.timestamp
      ? `[${new Date().toISOString()}] `
      : "";
    const levelStr = `[${level}]`;
    const nameStr = `[${this.name}]`;

    // Special handling for Error objects to include stack trace
    const processedArgs = args.map((arg) => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack}`;
      } else if (typeof arg === "object") {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    });

    const baseMessage = `${timestamp}${levelStr}${nameStr}: ${message} ${processedArgs.join(
      " "
    )}`;

    return {
      consoleMessage: `${this.getColor(
        level
      )}${baseMessage}${this.resetColor()}`,
      fileMessage: baseMessage, // No colors in file
    };
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const { consoleMessage, fileMessage } = this.formatMessage(
      level,
      message,
      ...args
    );

    if (level === LogLevel.ERROR) {
      console.error(consoleMessage);
      this.captureSentryError(message, args);
    } else if (level === LogLevel.WARN) {
      console.warn(consoleMessage);
      this.captureSentryWarning(message, args);
    } else {
      console.log(consoleMessage);
    }

    this.writeToFile(fileMessage);
  }

  private captureSentryError(message: string, args: any[]): void {
    const error = args.find((arg) => arg instanceof Error);
    if (error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { args },
      });
    }
  }

  private captureSentryWarning(message: string, args: any[]): void {
    Sentry.captureMessage(message, {
      level: "warning",
      extra: { args },
    });
  }

  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  public trace(message: string, ...args: any[]): void {
    this.log(LogLevel.TRACE, message, ...args);
  }

  public setLevel(level: LogLevel): void {
    this.options.level = level;
  }

  public captureException(error: Error, context?: Record<string, any>): void {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }

    // Also log locally
    this.error("Captured exception:", error);
  }

  public close(): void {
    if (this.currentFileStream) {
      this.currentFileStream.end();
      this.currentFileStream = null;
    }
  }
}

const logger = new Logger("threaded", {
  colors: true,
  file: {
    dir: "./logs",
  },
  timestamp: true,
});

export default logger;
