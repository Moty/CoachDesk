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

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<PaginatedResponse<Ticket>>('/api/v1/tickets', {
          page: page.toString(),
          pageSize: '20'
        })
        setTickets(response.data)
        setTotalPages(response.pagination.totalPages)
      } catch (err) {
        setError('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }
    loadTickets()
  }, [apiClient, page])

  if (loading) return <div>Loading tickets...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>Tickets</h2>
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
