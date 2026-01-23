export interface Attachment {
  id: string
  ticketId: string
  filename: string
  contentType: string
  size: number
  url: string
  uploadedBy: string
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
