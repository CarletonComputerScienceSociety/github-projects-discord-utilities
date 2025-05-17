import winston from "winston";
import { sendDiscordAlertMessage } from "@infrastructure/discord";

const base = winston.createLogger({
  level: "info",
  format: winston.format.printf(({ level, message, label, timestamp }) => {
    return `[LOGGER] ${level}: ${message}`;
  }),
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  base.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { level, message, label, timestamp } = info;
          const colorizer = winston.format.colorize().colorize;
          return `${colorizer("info", `[LOGGER]`)} ${level}: ${message}`;
        }),
      ),
    }),
  );
}

interface log {
  event: string;
  body?: string;
}

class Logger {
  private format = (log: log): string => {
    return log.body
      ? `{event: "${log.event}", body: ${log.body}}`
      : `{event: "${log.event}"}`;
  };

  public info(log: log): void {
    if (process.env.NODE_ENV === "test") return;
    base.info(this.format(log));
  }

  public error(log: log): void {
    if (process.env.NODE_ENV === "test") return;

    const formattedLog = this.format(log);
    sendDiscordAlertMessage(`Error: ${formattedLog}`).catch((err) => {
      sendDiscordAlertMessage(`Failed to send Discord alert message: ${err}`);
    });

    base.error(formattedLog);
  }

  public warn(log: log): void {
    if (process.env.NODE_ENV === "test") return;
    base.warn(this.format(log));
  }
}

const logger = new Logger();

export default logger;
