import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Ticket } from '../types/ticket';
import { Comment, CommentsResponse } from '../types/comment';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

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

  useEffect(() => {
    loadTicket();
    loadComments();
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
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Ticket Information</h2>
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
            <span style={{ fontSize: '0.875rem' }}>
              {ticket.assigneeId || 'Unassigned'}
            </span>
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
        {ticket.tags && ticket.tags.length > 0 && (
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
          </div>
        )}
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
                          <div key={attachment.id} style={{ fontSize: '0.875rem' }}>
                            📎 {attachment.fileName} ({Math.round(attachment.size / 1024)} KB)
                          </div>
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
