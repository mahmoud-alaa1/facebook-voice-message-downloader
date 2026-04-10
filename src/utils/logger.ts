/**
 * Logging utilities with prefixes for different modules
 */

export type LogLevel = "log" | "warn" | "error" | "info";

interface LoggerOptions {
  prefix: string;
}

export class Logger {
  private prefix: string;

  constructor(options: LoggerOptions) {
    this.prefix = `[${options.prefix}]`;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    console[level](`${this.prefix} ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log("log", message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log("error", message, ...args);
  }
}

export const logger = new Logger({ prefix: "fbvd" });

// Pre-configured loggers for different modules
export const loggers = {
  content: new Logger({ prefix: "fbvd-content" }),
  scanner: new Logger({ prefix: "fbvd-scanner" }),
  injector: new Logger({ prefix: "fbvd-injector" }),
  analyzer: new Logger({ prefix: "fbvd-analyzer" }),
  interceptor: new Logger({ prefix: "fbvd-interceptor" }),
  background: new Logger({ prefix: "fbvd-bg" }),
  sniffer: new Logger({ prefix: "fbvd-sniffer" }),
  store: new Logger({ prefix: "fbvd-store" }),
};
