import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/rbac.middleware.js';
import { UserRole } from '../../domain/models/User.js';
import { createTicket, listTickets, getTicketById, updateTicket, assignTicket } from '../controllers/ticket.controller.js';
import { addComment } from '../controllers/comment.controller.js';

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

router.patch(
  '/:id/assign',
  authMiddleware,
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  assignTicket
);

router.post(
  '/:id/comments',
  authMiddleware,
  requireRole(UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN),
  addComment
);

export default router;
