export interface Ticket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requesterId: string
  requesterEmail?: string
  assigneeId?: string
  assigneeEmail?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  firstResponseAt?: string
  resolvedAt?: string
  closedAt?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
