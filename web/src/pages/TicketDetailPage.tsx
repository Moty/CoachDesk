import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Ticket } from '../types/ticket'
import { Comment, PaginatedResponse } from '../types/comment'
import { Attachment, PaginatedResponse as AttachmentPaginatedResponse } from '../types/attachment'

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
  const [editing, setEditing] = useState(false)
  const [editStatus, setEditStatus] = useState<Ticket['status']>('open')
  const [editPriority, setEditPriority] = useState<Ticket['priority']>('low')
  const [editTags, setEditTags] = useState('')
  const [editAssignee, setEditAssignee] = useState('')
  const [updating, setUpdating] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true)
        const data = await apiClient.get<Ticket>(`/api/v1/tickets/${id}`)
        setTicket(data)
        setEditStatus(data.status)
        setEditPriority(data.priority)
        setEditTags(data.tags.join(', '))
        setEditAssignee(data.assigneeId || '')
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

  useEffect(() => {
    const loadAttachments = async () => {
      try {
        const response = await apiClient.get<AttachmentPaginatedResponse<Attachment>>(
          `/api/v1/tickets/${id}/attachments`
        )
        setAttachments(response.data)
      } catch (err) {
        console.error('Failed to load attachments:', err)
      }
    }
    if (id) loadAttachments()
  }, [apiClient, id])

  if (loading) return <div>Loading ticket...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!ticket) return <div>Ticket not found</div>

  const isCustomer = user?.role === 'customer'
  const canUseInternal = user?.role === 'agent' || user?.role === 'admin'
  const canEditTicket = user?.role === 'agent' || user?.role === 'admin'
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

  const handleUpdateTicket = async () => {
    if (!id || !ticket) return
    
    try {
      setUpdating(true)
      const updates: Partial<Ticket> = {}
      
      if (editStatus !== ticket.status) {
        // Check for invalid status transitions
        const validTransitions: Record<string, string[]> = {
          open: ['in_progress', 'resolved', 'closed'],
          in_progress: ['open', 'resolved', 'closed'],
          resolved: ['closed', 'open'],
          closed: ['open']
        }
        
        if (!validTransitions[ticket.status]?.includes(editStatus)) {
          alert(`Invalid status transition from ${ticket.status} to ${editStatus}`)
          return
        }
        updates.status = editStatus
      }
      
      if (editPriority !== ticket.priority) {
        updates.priority = editPriority
      }
      
      const newTags = editTags.split(',').map(t => t.trim()).filter(Boolean)
      if (JSON.stringify(newTags) !== JSON.stringify(ticket.tags)) {
        updates.tags = newTags
      }
      
      if (Object.keys(updates).length > 0) {
        const updatedTicket = await apiClient.patch<Ticket>(`/api/v1/tickets/${id}`, updates)
        setTicket(updatedTicket)
        setEditStatus(updatedTicket.status)
        setEditPriority(updatedTicket.priority)
        setEditTags(updatedTicket.tags.join(', '))
      }
      
      // Handle assignee separately
      if (editAssignee !== (ticket.assigneeId || '')) {
        const updatedTicket = await apiClient.patch<Ticket>(`/api/v1/tickets/${id}/assign`, {
          assigneeId: editAssignee || null
        })
        setTicket(updatedTicket)
        setEditAssignee(updatedTicket.assigneeId || '')
      }
      
      setEditing(false)
    } catch (err: any) {
      console.error('Failed to update ticket:', err)
      alert(err.message || 'Failed to update ticket')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    if (ticket) {
      setEditStatus(ticket.status)
      setEditPriority(ticket.priority)
      setEditTags(ticket.tags.join(', '))
      setEditAssignee(ticket.assigneeId || '')
    }
    setEditing(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError('')
    
    if (!file) {
      setSelectedFile(null)
      return
    }

    // Enforce 10MB file size limit
    const maxSizeBytes = 10 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setUploadError('File size must be 10MB or less')
      setSelectedFile(null)
      e.target.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !id) return

    try {
      setUploading(true)
      setUploadError('')
      
      const newAttachment = await apiClient.uploadFile<Attachment>(
        `/api/v1/tickets/${id}/attachments`,
        selectedFile
      )
      
      setAttachments(prev => [...prev, newAttachment])
      setSelectedFile(null)
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      console.error('Failed to upload attachment:', err)
      setUploadError(err.message || 'Failed to upload attachment')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{ticket.subject}</h2>
        {canEditTicket && !editing && (
          <button onClick={() => setEditing(true)}>Edit Ticket</button>
        )}
      </div>
      <div style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '1rem', border: '1px solid #ddd' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
          <strong>Status:</strong>
          {editing ? (
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Ticket['status'])} disabled={updating}>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <span>{ticket.status}</span>
          )}
          <strong>Priority:</strong>
          {editing ? (
            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Ticket['priority'])} disabled={updating}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          ) : (
            <span>{ticket.priority}</span>
          )}
          <strong>Assignee:</strong>
          {editing ? (
            <input
              type="text"
              value={editAssignee}
              onChange={(e) => setEditAssignee(e.target.value)}
              placeholder="Enter assignee ID"
              disabled={updating}
            />
          ) : (
            <span>{ticket.assigneeEmail || ticket.assigneeId || 'Unassigned'}</span>
          )}
          <strong>Requester:</strong>
          <span>{ticket.requesterEmail || ticket.requesterId}</span>
          <strong>Tags:</strong>
          {editing ? (
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Comma-separated tags"
              disabled={updating}
            />
          ) : (
            <span>{ticket.tags.length > 0 ? ticket.tags.join(', ') : 'None'}</span>
          )}
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
        {editing && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleUpdateTicket} disabled={updating} style={{ marginRight: '0.5rem' }}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancelEdit} disabled={updating}>Cancel</button>
          </div>
        )}
      </div>
      <div>
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Attachments</h3>
        {attachments.length === 0 ? (
          <p>No attachments yet.</p>
        ) : (
          <div style={{ marginBottom: '1rem' }}>
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                style={{
                  padding: '0.5rem 1rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #ddd',
                  background: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{attachment.filename}</strong>
                  <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    ({(attachment.size / 1024).toFixed(2)} KB)
                  </span>
                  <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    {new Date(attachment.createdAt).toLocaleString()}
                  </span>
                </div>
                <a href={attachment.url} download style={{ textDecoration: 'none', color: '#0066cc' }}>
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', background: '#f9f9f9' }}>
          <h4>Upload Attachment</h4>
          <form onSubmit={handleUploadAttachment}>
            <input
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ marginBottom: '0.5rem' }}
            />
            {uploadError && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {uploadError}
              </div>
            )}
            {selectedFile && (
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            <button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </form>
        </div>
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
