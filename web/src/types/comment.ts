export interface Comment {
  id: string
  ticketId: string
  authorId: string
  authorEmail?: string
  content: string
  isInternal: boolean
  createdAt: string
  updatedAt: string
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
