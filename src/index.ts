import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config, logConfig } from './shared/config/env.config.js';
import { logger, logApplicationStart, logApplicationShutdown } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { requestLogger } from './shared/middleware/requestLogger.middleware.js';
import {
  globalRateLimiter,
  userRateLimiter,
} from './shared/middleware/rateLimiter.middleware.js';
import ticketRoutes from './api/routes/ticket.routes.js';
import userRoutes from './api/routes/user.routes.js';
import authRoutes from './api/routes/auth.routes.js';
import slaRuleRoutes from './api/routes/admin/sla-rule.routes.js';
import auditLogRoutes from './api/routes/admin/audit-log.routes.js';
import { firestoreAdapter } from './shared/database/firestore.js';
import { SLAMonitoringJob } from './jobs/sla-monitoring.job.js';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load OpenAPI specification
const openapiDocument = YAML.load(path.join(__dirname, '../docs/api/openapi.yaml'));

// Security headers with helmet
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  noSniff: true,
  frameguard: { action: 'deny' }
}));

// CORS configuration with allowed origins
const allowedOrigins = config.corsOrigin.split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use(requestLogger);

// Global rate limit: 100 requests per 15 minutes per IP
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Apply per-user rate limiting to all API routes
app.use('/api', userRateLimiter);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/sla-rules', slaRuleRoutes);
app.use('/api/v1/admin/audit-logs', auditLogRoutes);

// Error handler must be last
app.use(errorHandler);

// Start server with lifecycle logging
logApplicationStart();

async function startServer(): Promise<void> {
  // Initialize database adapter before background jobs
  await firestoreAdapter.connect();

  // Start background jobs after database connection
  const slaMonitoringJob = new SLAMonitoringJob(firestoreAdapter);
  slaMonitoringJob.start();

  app.listen(config.port, () => {
    logger.info(`Server ready on port ${config.port}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is required');
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIRESTORE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logApplicationShutdown('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  logApplicationShutdown('SIGINT');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  logApplicationShutdown('Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: String(promise),
  });
  logApplicationShutdown('Unhandled rejection');
  process.exit(1);
});
