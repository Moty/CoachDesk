export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  details?: Record<string, any>
  createdAt: string
}
