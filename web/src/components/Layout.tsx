import { Link } from 'react-router-dom'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{ background: '#333', color: '#fff', padding: '1rem' }}>
        <h1>HelpDesk</h1>
      </header>
      <nav style={{ background: '#eee', padding: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Tickets</Link>
        <Link to="/ticket/new" style={{ marginRight: '1rem' }}>Create Ticket</Link>
        <Link to="/admin" style={{ marginRight: '1rem' }}>Admin</Link>
      </nav>
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  )
}

export default Layout
