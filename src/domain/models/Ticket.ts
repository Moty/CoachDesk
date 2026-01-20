export enum TicketStatus {
  NEW = 'new',
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface SLATimer {
  firstResponseAt?: Date;
  firstResponseDue?: Date;
  resolvedAt?: Date;
  resolutionDue?: Date;
  breached: boolean;
}

export interface Ticket {
  id: string;
  organizationId: string;
  requesterId: string;
  assigneeId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  slaTimers?: SLATimer;
}

/**
 * Valid status transitions
 */
const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.CLOSED],
  [TicketStatus.OPEN]: [TicketStatus.PENDING, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.PENDING]: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]: [TicketStatus.OPEN, TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

/**
 * Validate if a status transition is allowed
 */
export function isValidStatusTransition(from: TicketStatus, to: TicketStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validate if a priority value is valid
 */
export function isValidPriority(priority: string): priority is TicketPriority {
  return Object.values(TicketPriority).includes(priority as TicketPriority);
}
