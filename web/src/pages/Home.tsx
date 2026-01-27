import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types/user';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to HelpDesk</h1>
        {user && (
          <div style={styles.userInfo}>
            <p>Logged in as: <strong>{user.email}</strong></p>
            <p>Display Name: <strong>{user.displayName}</strong></p>
            <p>Role: <strong>{user.role}</strong></p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/tickets')} style={styles.primaryButton}>
                View Tickets
              </button>
              <button onClick={() => navigate('/tickets/new')} style={styles.successButton}>
                Create Ticket
              </button>
              {user.role === UserRole.ADMIN && (
                <>
                  <button onClick={() => navigate('/admin/users')} style={styles.adminButton}>
                    Manage Users
                  </button>
                  <button onClick={() => navigate('/admin/sla-rules')} style={styles.adminButton}>
                    SLA Rules
                  </button>
                  <button onClick={() => navigate('/admin/audit-logs')} style={styles.adminButton}>
                    Audit Logs
                  </button>
                </>
              )}
              <button onClick={handleSignOut} style={styles.button}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'rgb(var(--bg-glass) / 0.5)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid rgb(var(--border-glass) / 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    color: 'rgb(var(--text-primary))',
  },
  primaryButton: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
    transition: 'transform 0.2s',
  },
  successButton: {
    padding: '0.75rem',
    backgroundColor: 'rgb(var(--accent-secondary))',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
    transition: 'transform 0.2s',
  },
  adminButton: {
    padding: '0.75rem',
    backgroundColor: 'rgb(var(--accent-primary))',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
    transition: 'transform 0.2s',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: 'rgb(var(--bg-glass))',
    color: 'rgb(var(--text-primary))',
    border: '1px solid rgb(var(--border-glass) / 0.2)',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
    transition: 'transform 0.2s',
  },
};
