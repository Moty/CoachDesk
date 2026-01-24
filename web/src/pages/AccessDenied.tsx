import { Link } from 'react-router-dom';

export function AccessDenied() {
  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '4rem auto', 
      padding: '2rem', 
      textAlign: 'center',
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <h1 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Access Denied</h1>
      <p style={{ marginBottom: '1.5rem', color: '#666' }}>
        You do not have permission to access this page.
      </p>
      <Link 
        to="/" 
        style={{ 
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#3182ce',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Go to Home
      </Link>
    </div>
  );
}
