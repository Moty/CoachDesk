import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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
import { FirestoreAdapter } from './shared/database/adapters/firestore/FirestoreAdapter.js';
import { SLAMonitoringJob } from './jobs/sla-monitoring.job.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global rate limit: 100 requests per 15 minutes per IP
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply per-user rate limiting to all API routes
app.use('/api', userRateLimiter);

// API routes
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin/sla-rules', slaRuleRoutes);

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
