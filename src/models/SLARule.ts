export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface SLARule {
  id: string;
  organizationId: string;
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: Date;
}

export interface SLATimer {
  firstResponseAt?: Date;
  firstResponseDue: Date;
  resolvedAt?: Date;
  resolutionDue: Date;
  breached: boolean;
}
