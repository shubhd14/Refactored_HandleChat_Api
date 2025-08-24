
const LogLevel ={
  INFO : "INFO",
  WARN : "WARN",
  ERROR : "ERROR",
  DEBUG : "DEBUG"
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

export class Logger {
  static log(level: LogLevelType, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...args);
  }
  static info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args);
  }
  static warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args);
  }
  static error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args);
  }
  static debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}