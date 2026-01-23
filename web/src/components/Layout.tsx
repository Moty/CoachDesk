import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Layout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div>
      <header style={{ background: '#333', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>HelpDesk</h1>
        {firebaseUser && (
          <div>
            <span style={{ marginRight: '1rem' }}>{firebaseUser.email}</span>
            <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
          </div>
        )}
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
