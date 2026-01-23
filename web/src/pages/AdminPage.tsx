import { Link, Routes, Route } from 'react-router-dom'
import AdminUsersPage from './AdminUsersPage'
import AdminSLARulesPage from './AdminSLARulesPage'

function AdminPage() {
  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <Link to="/admin/users">Users</Link>
        {' | '}
        <Link to="/admin/sla-rules">SLA Rules</Link>
      </nav>
      <Routes>
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="sla-rules" element={<AdminSLARulesPage />} />
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
