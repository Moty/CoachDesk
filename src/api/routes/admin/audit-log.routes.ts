import { Router } from 'express';
import { authMiddleware } from '../../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../../shared/middleware/rbac.middleware.js';
import { organizationIsolation } from '../../../shared/middleware/organizationIsolation.middleware.js';
import { UserRole } from '../../../domain/models/User.js';
import { listAuditLogs } from '../../controllers/admin/audit-log.controller.js';

const router = Router();

// Apply auth and org isolation to all routes
router.use(authMiddleware);
router.use(organizationIsolation());

// GET /api/v1/admin/audit-logs - List audit logs (admin only)
router.get('/', requireRole(UserRole.ADMIN), listAuditLogs);

export default router;
