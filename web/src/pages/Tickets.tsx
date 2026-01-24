import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Ticket, TicketsResponse } from '../types/ticket';

export function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  useEffect(() => {
    loadTickets();
  }, [page]);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<TicketsResponse>('/api/v1/tickets', {
        page,
        limit,
      });
      setTickets(response.tickets);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  const totalPages = Math.ceil(total / limit);

  if (loading && tickets.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Tickets</h1>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tickets</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {tickets.length === 0 && !loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          <p>No tickets found.</p>
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Subject</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Priority</th>
                <th style={{ padding: '0.75rem' }}>Requester</th>
                <th style={{ padding: '0.75rem' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '0.75rem' }}>{ticket.subject}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor:
                          ticket.status === 'new'
                            ? '#e3f2fd'
                            : ticket.status === 'open'
                            ? '#fff3e0'
                            : ticket.status === 'pending'
                            ? '#fce4ec'
                            : ticket.status === 'resolved'
                            ? '#e8f5e9'
                            : '#f5f5f5',
                      }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor:
                          ticket.priority === 'urgent'
                            ? '#ffebee'
                            : ticket.priority === 'high'
                            ? '#fff3e0'
                            : ticket.priority === 'medium'
                            ? '#e3f2fd'
                            : '#f5f5f5',
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{ticket.requesterId}</td>
                  <td style={{ padding: '0.75rem' }}>{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
