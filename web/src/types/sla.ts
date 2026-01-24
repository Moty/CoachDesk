export interface SLARule {
  id: string;
  name: string;
  priority: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SLARulesResponse {
  rules: SLARule[];
  total: number;
  page: number;
  limit: number;
}
