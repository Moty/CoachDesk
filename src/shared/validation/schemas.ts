import { z } from 'zod';

// Sanitize string by trimming and escaping HTML
function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Custom string schema that sanitizes input
export const sanitizedString = (min?: number, max?: number) => {
  let schema = z.string();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  return schema.transform((val) => sanitizeString(val));
};

// Email validation
export const emailSchema = z.string().email().toLowerCase();

// URL validation
export const urlSchema = z.string().url();

// Ticket creation schema
export const createTicketSchema = z.object({
  subject: sanitizedString(1, 200),
  description: sanitizedString(1, 5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(sanitizedString(undefined, 50)).max(10).optional(),
});

// Ticket update schema
export const updateTicketSchema = z.object({
  subject: sanitizedString(1, 200).optional(),
  description: sanitizedString(1, 5000).optional(),
  status: z.enum(['new', 'open', 'pending', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(sanitizedString(undefined, 50)).max(10).optional(),
});

// Ticket assign schema
export const assignTicketSchema = z.object({
  assigneeId: z.string().uuid(),
});

// Comment creation schema
export const createCommentSchema = z.object({
  body: sanitizedString(1, 5000),
  isPublic: z.boolean().optional().default(true),
});

// User creation schema
export const createUserSchema = z.object({
  email: emailSchema,
  displayName: sanitizedString(1, 100),
  role: z.enum(['customer', 'agent', 'admin']),
});

// SLA rule creation schema
export const createSLARuleSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  firstResponseMinutes: z.number().int().positive(),
  resolutionMinutes: z.number().int().positive(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(30),
});

export const ticketFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().uuid().optional(),
  requesterId: z.string().uuid().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
