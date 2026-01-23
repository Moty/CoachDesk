export interface User {
  id: string
  email: string
  displayName: string
  role: 'customer' | 'agent' | 'admin'
  createdAt: string
  updatedAt: string
}
