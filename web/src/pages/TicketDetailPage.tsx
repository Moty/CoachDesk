import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Ticket } from '../types/ticket'
import { Comment, PaginatedResponse } from '../types/comment'

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { apiClient, user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsTotalPages, setCommentsTotalPages] = useState(1)
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await apiClient.get<PaginatedResponse<Comment>>(
          `/api/v1/tickets/${id}/comments`,
          { page: commentsPage.toString(), pageSize: '10' }
        )
        setComments(response.data)
        setCommentsTotalPages(response.pagination.totalPages)
      } catch (err) {
        console.error('Failed to load comments:', err)
      }
    }
    if (id) loadComments()
  }, [apiClient, id, commentsPage])

  if (loading) return <div>Loading ticket...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!ticket) return <div>Ticket not found</div>

  const isCustomer = user?.role === 'customer'
  const canUseInternal = user?.role === 'agent' || user?.role === 'admin'
  const visibleComments = comments.filter(c => !isCustomer || !c.isInternal)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    try {
      setSubmitting(true)
      const newCommentData = await apiClient.post<Comment>(`/api/v1/tickets/${id}/comments`, {
        content: newComment,
        isInternal: canUseInternal ? isInternal : false
      })
      setComments(prev => [...prev, newCommentData])
      setNewComment('')
      setIsInternal(false)
    } catch (err) {
      console.error('Failed to post comment:', err)
      alert('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

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
      <div style={{ marginTop: '2rem' }}>
        <h3>Comments</h3>
        {visibleComments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <>
            {visibleComments.map(comment => (
              <div
                key={comment.id}
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  background: comment.isInternal ? '#fff3cd' : '#fff'
                }}
              >
                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                  <strong>{comment.authorEmail || comment.authorId}</strong>
                  {' • '}
                  {new Date(comment.createdAt).toLocaleString()}
                  {comment.isInternal && <span style={{ marginLeft: '0.5rem', color: '#856404' }}>(Internal)</span>}
                </div>
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{comment.content}</p>
              </div>
            ))}
            {commentsTotalPages > 1 && (
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => setCommentsPage(p => Math.max(1, p - 1))} disabled={commentsPage === 1}>
                  Previous
                </button>
                <span style={{ margin: '0 1rem' }}>Page {commentsPage} of {commentsTotalPages}</span>
                <button
                  onClick={() => setCommentsPage(p => Math.min(commentsTotalPages, p + 1))}
                  disabled={commentsPage === commentsTotalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', background: '#f9f9f9' }}>
          <h4>Add Comment</h4>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              style={{ width: '100%', minHeight: '100px', padding: '0.5rem', marginBottom: '0.5rem' }}
              disabled={submitting}
            />
            {canUseInternal && (
              <div style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    disabled={submitting}
                  />
                  {' '}Internal comment (not visible to customers)
                </label>
              </div>
            )}
            <button type="submit" disabled={!newComment.trim() || submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
