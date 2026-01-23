import { Link, Routes, Route } from 'react-router-dom'
import AdminUsersPage from './AdminUsersPage'
import AdminSLARulesPage from './AdminSLARulesPage'
import AdminAuditLogsPage from './AdminAuditLogsPage'

function AdminPage() {
  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/admin/users">Users</Link>
        {' | '}
        <Link to="/admin/sla-rules">SLA Rules</Link>
        {' | '}
        <Link to="/admin/audit-logs">Audit Logs</Link>
      </nav>
      <Routes>
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="sla-rules" element={<AdminSLARulesPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/" element={
          <div>
            <h2>Admin Dashboard</h2>
            <p>Select a section from the navigation.</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default AdminPage
