import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ('customer' | 'agent' | 'admin')[]
}

function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

export default RoleGuard
