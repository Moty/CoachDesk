import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Ticket } from '../types/ticket'

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { apiClient } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true)
        const data = await apiClient.get<Ticket>(`/api/v1/tickets/${id}`)
        setTicket(data)
      } catch (err) {
        setError('Ticket not found')
      } finally {
        setLoading(false)
      }
    }
    if (id) loadTicket()
  }, [apiClient, id])

  if (loading) return <div>Loading ticket...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!ticket) return <div>Ticket not found</div>

  return (
    <div>
      <h2>{ticket.subject}</h2>
      <div style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '1rem', border: '1px solid #ddd' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
          <strong>Status:</strong>
          <span>{ticket.status}</span>
          <strong>Priority:</strong>
          <span>{ticket.priority}</span>
          <strong>Assignee:</strong>
          <span>{ticket.assigneeEmail || ticket.assigneeId || 'Unassigned'}</span>
          <strong>Requester:</strong>
          <span>{ticket.requesterEmail || ticket.requesterId}</span>
          <strong>Tags:</strong>
          <span>{ticket.tags.length > 0 ? ticket.tags.join(', ') : 'None'}</span>
          <strong>Created:</strong>
          <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          <strong>Updated:</strong>
          <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
          {ticket.firstResponseAt && (
            <>
              <strong>First Response:</strong>
              <span>{new Date(ticket.firstResponseAt).toLocaleString()}</span>
            </>
          )}
          {ticket.resolvedAt && (
            <>
              <strong>Resolved:</strong>
              <span>{new Date(ticket.resolvedAt).toLocaleString()}</span>
            </>
          )}
          {ticket.closedAt && (
            <>
              <strong>Closed:</strong>
              <span>{new Date(ticket.closedAt).toLocaleString()}</span>
            </>
          )}
        </div>
      </div>
      <div>
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
      </div>
    </div>
  )
}

export default TicketDetailPage
