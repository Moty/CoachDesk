import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AuditLog, AuditLogsResponse } from '../types/audit';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

export function AdminAuditLogs() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, userFilter, actionFilter, startDate, endDate]);

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };

      if (userFilter.trim()) {
        params.userId = userFilter.trim();
      }
      if (actionFilter.trim()) {
        params.action = actionFilter.trim();
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get<AuditLogsResponse>('/api/v1/admin/audit-logs', params);
      setLogs(response.logs);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setUserFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Audit Logs</h1>

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              User ID
            </label>
            <input
              type="text"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by user ID"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Action
            </label>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by action"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        <button
          onClick={resetFilters}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Audit Logs Table */}
      {loading && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading audit logs...
        </p>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#ffebee',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ef5350',
            marginBottom: '1rem',
          }}
        >
          <p style={{ color: '#d32f2f', margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '3rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
            No audit logs match the selected filters.
          </p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            overflow: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  Timestamp
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  User ID
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  Action
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  Resource Type
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  Resource ID
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    {formatDate(log.timestamp)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {log.userId}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {log.resourceType}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {log.resourceId}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#666' }}>
                    {log.details ? (
                      <pre style={{ margin: 0, fontFamily: 'monospace', maxWidth: '300px', overflow: 'auto' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page === 1 ? '#e0e0e0' : '#007bff',
              color: page === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: page === totalPages ? '#e0e0e0' : '#007bff',
              color: page === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
