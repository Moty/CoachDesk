import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, logConfig } from './shared/config/env.config.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import {
  globalRateLimiter,
  userRateLimiter,
} from './shared/middleware/rateLimiter.middleware.js';
import ticketRoutes from './api/routes/ticket.routes.js';
import userRoutes from './api/routes/user.routes.js';
import slaRuleRoutes from './api/routes/admin/sla-rule.routes.js';
import auditLogRoutes from './api/routes/admin/audit-log.routes.js';
import { FirestoreAdapter } from './shared/database/adapters/firestore/FirestoreAdapter.js';
import { SLAMonitoringJob } from './jobs/sla-monitoring.job.js';

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
      scriptSrc: ["'self'"],
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
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/sla-rules', slaRuleRoutes);
app.use('/api/v1/admin/audit-logs', auditLogRoutes);

// Error handler must be last
app.use(errorHandler);

// Start server
logger.info('Starting HelpDesk application...');
logConfig();

// Initialize database adapter and start background jobs
const firestoreAdapter = new FirestoreAdapter();
const slaMonitoringJob = new SLAMonitoringJob(firestoreAdapter);
slaMonitoringJob.start();

app.listen(config.port, () => {
  logger.info(`Server ready on port ${config.port}`);
});
