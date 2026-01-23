import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/rbac.middleware.js';
import { UserRole } from '../../domain/models/User.js';
import { createTicket, listTickets, getTicketById, updateTicket } from '../controllers/ticket.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  createTicket
);

router.get(
  '/',
  authMiddleware,
  requireRole(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  listTickets
);

router.get(
  '/:id',
  authMiddleware,
  requireRole(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  getTicketById
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  updateTicket
);

export default router;
