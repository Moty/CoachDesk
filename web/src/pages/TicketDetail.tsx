import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Ticket, TicketStatus, TicketPriority } from '../types/ticket';
import { Comment, CommentsResponse, Attachment } from '../types/comment';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, User } from '../types/user';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Comment composer state
  const [commentBody, setCommentBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Attachment uploader state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Ticket update state
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<TicketStatus | ''>('');
  const [editPriority, setEditPriority] = useState<TicketPriority | ''>('');
  const [editTags, setEditTags] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Available users for assignee picker
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadTicket();
    loadComments();
    // Load available users if agent/admin
    if (user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) {
      loadAvailableUsers();
    }
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [commentsPage]);

  async function loadTicket() {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const response = await api.get<Ticket>(`/api/v1/tickets/${id}`);
      setTicket(response);
    } catch (err: any) {
      if (err.message.includes('not found') || err.message.includes('404')) {
        setNotFound(true);
      } else {
        setError(err.message || 'Failed to load ticket');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    if (!id) return;

    try {
      setCommentsLoading(true);
      const response = await api.get<CommentsResponse>(`/api/v1/tickets/${id}/comments`, {
        page: commentsPage,
        limit: 10,
      });
      
      // Filter out internal comments for customers
      let filteredComments = response.comments;
      if (user?.role === UserRole.CUSTOMER) {
        filteredComments = response.comments.filter((comment) => comment.isPublic);
      }
      
      setComments(filteredComments);
      setCommentsTotalPages(Math.ceil(response.total / response.limit));
    } catch (err: any) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function loadAvailableUsers() {
    try {
      setUsersLoading(true);
      const response = await api.get<{ users: User[] }>('/api/v1/users', {
        role: 'agent,admin',
      });
      setAvailableUsers(response.users);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      // Not critical, just means assignee picker won't work
    } finally {
      setUsersLoading(false);
    }
  }

  function startEditing() {
    if (!ticket) return;
    setIsEditing(true);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setEditTags(ticket.tags.join(', '));
    setEditAssignee(ticket.assigneeId || '');
    setUpdateError(null);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditStatus('');
    setEditPriority('');
    setEditTags('');
    setEditAssignee('');
    setUpdateError(null);
  }

  async function saveTicketUpdates() {
    if (!id || !ticket) return;

    try {
      setUpdating(true);
      setUpdateError(null);

      const updates: any = {};
      
      // Only include changed fields
      if (editStatus && editStatus !== ticket.status) {
        updates.status = editStatus;
      }
      if (editPriority && editPriority !== ticket.priority) {
        updates.priority = editPriority;
      }
      if (editAssignee !== ticket.assigneeId) {
        updates.assigneeId = editAssignee || undefined;
      }
      
      // Parse tags
      const newTags = editTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      if (JSON.stringify(newTags) !== JSON.stringify(ticket.tags)) {
        updates.tags = newTags;
      }

      // Only make API call if there are changes
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedTicket = await api.patch<Ticket>(`/api/v1/tickets/${id}`, updates);
      setTicket(updatedTicket);
      setIsEditing(false);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  }

  function getValidStatusTransitions(currentStatus: TicketStatus): TicketStatus[] {
    const transitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.NEW]: [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.OPEN]: [TicketStatus.PENDING, TicketStatus.RESOLVED, TicketStatus.CLOSED],
      [TicketStatus.PENDING]: [TicketStatus.OPEN, TicketStatus.RESOLVED, TicketStatus.CLOSED],
      [TicketStatus.RESOLVED]: [TicketStatus.OPEN, TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: [TicketStatus.OPEN],
    };
    return [currentStatus, ...(transitions[currentStatus] || [])];
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 10MB limit
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  }

  async function handleUploadAttachment() {
    if (!id || !selectedFile) return;

    try {
      setSubmitting(true);
      setUploadError(null);

      const attachment = await api.uploadFile<Attachment>(
        `/api/v1/tickets/${id}/attachments`,
        selectedFile
      );

      // Add to attachments list
      setAttachments((prev) => [...prev, attachment]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload ticket to show attachment in timeline
      loadTicket();
      loadComments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload attachment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !commentBody.trim()) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const newComment = await api.post<Comment>(`/api/v1/tickets/${id}/comments`, {
        body: commentBody.trim(),
        isPublic: user?.role === UserRole.CUSTOMER ? true : isPublic,
      });

      // Append new comment to timeline without full page refresh
      setComments((prevComments) => [...prevComments, newComment]);
      setCommentBody('');
      setIsPublic(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  function formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Ticket Not Found</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          The ticket you are looking for does not exist or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate('/tickets')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Error</h1>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={() => navigate('/tickets')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/tickets')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Back to Tickets
        </button>
        <h1 style={{ margin: '0.5rem 0' }}>{ticket.subject}</h1>
        <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
          Ticket #{ticket.id}
        </p>
      </div>

      {/* Metadata Section */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Ticket Information</h2>
          {(user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN) && !isEditing && (
            <button
              onClick={startEditing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Edit Ticket
            </button>
          )}
          {isEditing && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={saveTicketUpdates}
                disabled={updating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: updating ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEditing}
                disabled={updating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {updateError && (
          <p style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {updateError}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Status
            </label>
            {isEditing ? (
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {getValidStatusTransitions(ticket.status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ) : (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  display: 'inline-block',
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
            )}
          </div>

          {/* Priority */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Priority
            </label>
            {isEditing ? (
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TicketPriority)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {Object.values(TicketPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            ) : (
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  display: 'inline-block',
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
            )}
          </div>

          {/* Requester */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Requester
            </label>
            <span style={{ fontSize: '0.875rem' }}>{ticket.requesterId}</span>
          </div>

          {/* Assignee */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Assignee
            </label>
            {isEditing ? (
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                disabled={usersLoading}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Unassigned</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: '0.875rem' }}>
                {ticket.assigneeId || 'Unassigned'}
              </span>
            )}
          </div>

          {/* Created At */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Created
            </label>
            <span style={{ fontSize: '0.875rem' }}>
              {formatDateTime(ticket.createdAt)}
            </span>
          </div>

          {/* Updated At */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#555',
                marginBottom: '0.25rem',
              }}
            >
              Last Updated
            </label>
            <span style={{ fontSize: '0.875rem' }}>
              {formatDateTime(ticket.updatedAt)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#555',
              marginBottom: '0.25rem',
            }}
          >
            Tags
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          ) : ticket.tags && ticket.tags.length > 0 ? (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {ticket.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '0.875rem', color: '#999' }}>No tags</span>
          )}
        </div>
      </div>

      {/* SLA Timers Section */}
      {ticket.slaTimers && (
        <div
          style={{
            backgroundColor: ticket.slaTimers.breached ? '#ffebee' : '#f9f9f9',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            border: `1px solid ${ticket.slaTimers.breached ? '#ef5350' : '#e0e0e0'}`,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>
            SLA Timers
            {ticket.slaTimers.breached && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  color: '#d32f2f',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}
              >
                (BREACHED)
              </span>
            )}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* First Response */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#555',
                  marginBottom: '0.25rem',
                }}
              >
                First Response Due
              </label>
              <span style={{ fontSize: '0.875rem' }}>
                {formatDate(ticket.slaTimers.firstResponseDue)}
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#555',
                  marginBottom: '0.25rem',
                }}
              >
                First Response At
              </label>
              <span style={{ fontSize: '0.875rem' }}>
                {formatDate(ticket.slaTimers.firstResponseAt)}
              </span>
            </div>

            {/* Resolution */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#555',
                  marginBottom: '0.25rem',
                }}
              >
                Resolution Due
              </label>
              <span style={{ fontSize: '0.875rem' }}>
                {formatDate(ticket.slaTimers.resolutionDue)}
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#555',
                  marginBottom: '0.25rem',
                }}
              >
                Resolved At
              </label>
              <span style={{ fontSize: '0.875rem' }}>
                {formatDate(ticket.slaTimers.resolvedAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Description Section */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Description</h2>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {ticket.description}
        </div>
      </div>

      {/* Attachments Section */}
      {attachments.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Attachments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                    📎 {attachment.fileName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                    ({Math.round(attachment.size / 1024)} KB)
                  </span>
                </div>
                <a
                  href={attachment.filePath}
                  download={attachment.fileName}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Uploader */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Upload Attachment</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
                width: '100%',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
              Maximum file size: 10MB
            </p>
          </div>
          <button
            onClick={handleUploadAttachment}
            disabled={!selectedFile || submitting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !selectedFile || submitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !selectedFile || submitting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              minHeight: '38px',
            }}
          >
            {submitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selectedFile && (
          <p style={{ fontSize: '0.875rem', color: '#555', marginTop: '0.75rem' }}>
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
        {uploadError && (
          <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.75rem' }}>
            {uploadError}
          </p>
        )}
      </div>

      {/* Comments Timeline Section */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Comments</h2>

        {/* Comment Composer */}
        <form
          onSubmit={handleSubmitComment}
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          {/* Public/Internal Toggle for Agents/Admins */}
          {user?.role !== UserRole.CUSTOMER && (
            <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={!isPublic}
                  onChange={(e) => setIsPublic(!e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Mark as internal (only visible to agents and admins)
              </label>
            </div>
          )}

          {submitError && (
            <p style={{ color: 'red', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !commentBody.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: submitting || !commentBody.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting || !commentBody.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {commentsLoading && (
          <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
            Loading comments...
          </p>
        )}

        {!commentsLoading && comments.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
            No comments yet.
          </p>
        )}

        {!commentsLoading && comments.length > 0 && (
          <div>
            {/* Comments Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: comment.isPublic ? '#f9f9f9' : '#fff9e6',
                    border: `1px solid ${comment.isPublic ? '#e0e0e0' : '#ffd54f'}`,
                    borderRadius: '8px',
                  }}
                >
                  {/* Comment Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {comment.authorId}
                      </span>
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: comment.isPublic ? '#e3f2fd' : '#ffe0b2',
                          color: comment.isPublic ? '#1976d2' : '#e65100',
                        }}
                      >
                        {comment.isPublic ? 'Public' : 'Internal'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {comment.body}
                  </div>

                  {/* Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#555', marginBottom: '0.5rem' }}>
                        Attachments:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {comment.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.filePath}
                            download={attachment.fileName}
                            style={{
                              fontSize: '0.875rem',
                              color: '#007bff',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            📎 {attachment.fileName} ({Math.round(attachment.size / 1024)} KB)
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {commentsTotalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <button
                  onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}
                  disabled={commentsPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: commentsPage === 1 ? '#e0e0e0' : '#007bff',
                    color: commentsPage === 1 ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: commentsPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                  Page {commentsPage} of {commentsTotalPages}
                </span>
                <button
                  onClick={() => setCommentsPage((p) => Math.min(commentsTotalPages, p + 1))}
                  disabled={commentsPage === commentsTotalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor:
                      commentsPage === commentsTotalPages ? '#e0e0e0' : '#007bff',
                    color: commentsPage === commentsTotalPages ? '#999' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor:
                      commentsPage === commentsTotalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
