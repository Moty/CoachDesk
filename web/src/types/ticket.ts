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
  firstResponseAt?: string;
  firstResponseDue?: string;
  resolvedAt?: string;
  resolutionDue?: string;
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
  createdAt: string;
  updatedAt: string;
  slaTimers?: SLATimer;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}
