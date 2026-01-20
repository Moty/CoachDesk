import winston from 'winston';
import { config } from '../config/env.config.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, stack }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`;
    }
    if (stack && config.nodeEnv === 'development') {
      log += `\n${stack}`;
    }
    return log;
  })
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
  ],
});
