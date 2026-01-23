export interface SLARule {
  id: string
  name: string
  priority?: string
  responseTimeMinutes?: number
  resolutionTimeMinutes?: number
  createdAt: string
  updatedAt: string
}

export interface CreateSLARuleData {
  name: string
  priority?: string
  responseTimeMinutes?: number
  resolutionTimeMinutes?: number
}
