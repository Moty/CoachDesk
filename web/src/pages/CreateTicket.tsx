import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { TicketPriority } from '../types/ticket';

export function CreateTicket() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate subject
    if (subject.trim().length === 0) {
      setError('Subject is required');
      return;
    }
    if (subject.length > 255) {
      setError('Subject must be 255 characters or less');
      return;
    }

    // Validate description
    if (description.trim().length === 0) {
      setError('Description is required');
      return;
    }

    setLoading(true);

    try {
      // Parse tags from comma-separated string
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await api.post<{ id: string }>('/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        priority,
        tags: tagArray,
      });

      // Navigate to the new ticket detail page
      navigate(`/tickets/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Ticket</h1>
          <button onClick={() => navigate('/tickets')} style={styles.backButton}>
            Back to Tickets
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Subject <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              maxLength={255}
              style={styles.input}
            />
            <div style={styles.hint}>
              {subject.length}/255 characters
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description <span style={styles.required}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of your issue"
              rows={6}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              style={styles.select}
            >
              <option value={TicketPriority.LOW}>Low</option>
              <option value={TicketPriority.MEDIUM}>Medium</option>
              <option value={TicketPriority.HIGH}>High</option>
              <option value={TicketPriority.URGENT}>Urgent</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="billing, login, feature-request (comma-separated)"
              style={styles.input}
            />
            <div style={styles.hint}>
              Separate multiple tags with commas
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  hint: {
    fontSize: '12px',
    color: '#6c757d',
  },
  submitButton: {
    padding: '0.75rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    fontSize: '14px',
  },
};
