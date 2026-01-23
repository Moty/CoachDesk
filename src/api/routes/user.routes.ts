import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/rbac.middleware.js';
import { UserRole } from '../../domain/models/User.js';
import { createUser, listUsers, getCurrentUser } from '../controllers/user.controller.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  createUser
);

router.get(
  '/',
  authMiddleware,
  requireRole(UserRole.ADMIN),
  listUsers
);

router.get(
  '/me',
  authMiddleware,
  getCurrentUser
);

export default router;
