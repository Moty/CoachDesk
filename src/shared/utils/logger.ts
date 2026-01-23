import winston from 'winston';
import { config } from '../config/env.config.js';

// Development format (human-readable with colors)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, context, stack }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (context) {
      log += ` | Context: ${JSON.stringify(context)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Production format (structured JSON for Cloud Logging)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const isProduction = config.nodeEnv === 'production';

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: {
    service: 'helpdesk-api',
    environment: config.nodeEnv,
  },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? prodFormat
        : winston.format.combine(winston.format.colorize(), devFormat),
    }),
  ],
});
