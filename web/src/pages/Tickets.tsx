import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Ticket, TicketsResponse, TicketStatus, TicketPriority } from '../types/ticket';

export function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [tagsFilter, setTagsFilter] = useState<string>('');

  // Sort states
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<string>('desc');

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter, priorityFilter, assigneeFilter, tagsFilter, sortBy, order]);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assigneeId = assigneeFilter;
      if (tagsFilter) params.tags = tagsFilter;
      if (sortBy) params.sortBy = sortBy;
      if (order) params.order = order;

      const response = await api.get<TicketsResponse>('/api/v1/tickets', params);
      setTickets(response.tickets);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  function handleResetFilters() {
    setStatusFilter('');
    setPriorityFilter('');
    setAssigneeFilter('');
    setTagsFilter('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
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

      {/* Filters Section */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Filters & Sorting</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Status
            </label>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All</option>
              <option value={TicketStatus.NEW}>New</option>
              <option value={TicketStatus.OPEN}>Open</option>
              <option value={TicketStatus.PENDING}>Pending</option>
              <option value={TicketStatus.RESOLVED}>Resolved</option>
              <option value={TicketStatus.CLOSED}>Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Priority
            </label>
            <select 
              value={priorityFilter} 
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All</option>
              <option value={TicketPriority.LOW}>Low</option>
              <option value={TicketPriority.MEDIUM}>Medium</option>
              <option value={TicketPriority.HIGH}>High</option>
              <option value={TicketPriority.URGENT}>Urgent</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Assignee ID
            </label>
            <input 
              type="text"
              value={assigneeFilter} 
              onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }}
              placeholder="Enter assignee ID"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          {/* Tags Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Tags (comma-separated)
            </label>
            <input 
              type="text"
              value={tagsFilter} 
              onChange={(e) => { setTagsFilter(e.target.value); setPage(1); }}
              placeholder="e.g., bug, urgent"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Sort By
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="createdAt">Created At</option>
              <option value="updatedAt">Updated At</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Order
            </label>
            <select 
              value={order} 
              onChange={(e) => { setOrder(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleResetFilters}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Reset Filters
        </button>
      </div>

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
