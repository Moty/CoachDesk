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
                <button onClick={() => navigate('/admin/users')} style={styles.adminButton}>
                  Manage Users
                </button>
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  primaryButton: {
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
  },
  successButton: {
    padding: '0.75rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
  },
  adminButton: {
    padding: '0.75rem',
    backgroundColor: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
  },
};
