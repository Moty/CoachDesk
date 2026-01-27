import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!email || !displayName || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        const errorMessage = data.message || 'Registration failed';
        setError(errorMessage);
        return;
      }

      // Sign in user after successful registration
      // We need to create a custom token or sign in with email/password
      // For now, let's sign in with the same credentials
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to home
      navigate('/');
    } catch (err: any) {
      if (err.message && err.message.includes('rate limit')) {
        setError('Too many requests. Please try again later.');
      } else if (err.message && err.message.includes('email')) {
        setError('Email already exists');
      } else {
        setError(err.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>HelpDesk Registration</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={styles.input}
            />
            <span style={styles.hint}>Minimum 8 characters</span>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div style={styles.footer}>
          Already have an account?{' '}
          <a href="/login" style={styles.link}>
            Sign in here
          </a>
        </div>
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
    maxWidth: '400px',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgb(var(--text-primary))',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid rgb(var(--border-glass) / 0.2)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'rgb(var(--bg-primary))',
    color: 'rgb(var(--text-primary))',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  hint: {
    fontSize: '12px',
    color: 'rgb(var(--text-secondary))',
  },
  button: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgb(var(--accent-primary)), rgb(var(--accent-secondary)))',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: 'rgb(var(--text-secondary))',
  },
  link: {
    color: 'rgb(var(--accent-primary))',
    textDecoration: 'none',
  },
};
