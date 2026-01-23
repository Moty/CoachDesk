import { Router } from 'express';
import { authMiddleware } from '../../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../../shared/middleware/rbac.middleware.js';
import { organizationIsolation } from '../../../shared/middleware/organizationIsolation.middleware.js';
import { UserRole } from '../../../domain/models/User.js';
import { createSLARule, listSLARules } from '../../controllers/admin/sla-rule.controller.js';

const router = Router();

// Apply auth and org isolation to all routes
router.use(authMiddleware);
router.use(organizationIsolation());

// GET /api/v1/admin/sla-rules - List SLA rules (admin only)
router.get('/', requireRole(UserRole.ADMIN), listSLARules);

// POST /api/v1/admin/sla-rules - Create or update SLA rule (admin only)
router.post('/', requireRole(UserRole.ADMIN), createSLARule);

export default router;
