import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config, logConfig } from './shared/config/env.config.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import ticketRoutes from './api/routes/ticket.routes.js';
import userRoutes from './api/routes/user.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/users', userRoutes);

// Error handler must be last
app.use(errorHandler);

// Start server
logger.info('Starting HelpDesk application...');
logConfig();

app.listen(config.port, () => {
  logger.info(`Server ready on port ${config.port}`);
});
