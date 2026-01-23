export interface SLARule {
  id: string;
  organizationId: string;
  priority: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: Date;
}
