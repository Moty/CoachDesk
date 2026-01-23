import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Ticket, PaginatedResponse } from '../types/ticket'

function TicketsPage() {
  const { apiClient } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignee: '',
    tags: ''
  })
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'priority'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true)
        const params: Record<string, string> = {
          page: page.toString(),
          pageSize: '20',
          sortBy,
          sortOrder
        }
        if (filters.status) params.status = filters.status
        if (filters.priority) params.priority = filters.priority
        if (filters.assignee) params.assignee = filters.assignee
        if (filters.tags) params.tags = filters.tags

        const response = await apiClient.get<PaginatedResponse<Ticket>>('/api/v1/tickets', params)
        setTickets(response.data)
        setTotalPages(response.pagination.totalPages)
      } catch (err) {
        setError('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }
    loadTickets()
  }, [apiClient, page, filters, sortBy, sortOrder])

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1)
  }

  if (loading) return <div>Loading tickets...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>Tickets</h2>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', border: '1px solid #ddd' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label>Status: </label>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label>Priority: </label>
            <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label>Assignee: </label>
            <input
              type="text"
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              placeholder="User ID"
            />
          </div>
          <div>
            <label>Tags: </label>
            <input
              type="text"
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
              placeholder="Comma-separated"
            />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
          <div>
            <label>Sort by: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="createdAt">Created At</option>
              <option value="updatedAt">Updated At</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div>
            <label>Order: </label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ccc' }}>Subject</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ccc' }}>Status</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ccc' }}>Priority</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ccc' }}>Requester</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #ccc' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    <Link to={`/ticket/${ticket.id}`}>{ticket.subject}</Link>
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>{ticket.status}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>{ticket.priority}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>{ticket.requesterEmail || ticket.requesterId}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ccc' }}>
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <span style={{ margin: '0 1rem' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default TicketsPage
