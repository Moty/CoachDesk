import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuditLog } from '../types/auditLog'

function AdminAuditLogsPage() {
  const { apiClient } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  // Filters
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  useEffect(() => {
    loadLogs()
  }, [page, userFilter, actionFilter, startDateFilter, endDateFilter])

  async function loadLogs() {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = {
        page,
        pageSize
      }

      if (userFilter) params.userId = userFilter
      if (actionFilter) params.action = actionFilter
      if (startDateFilter) params.startDate = startDateFilter
      if (endDateFilter) params.endDate = endDateFilter

      const response = await apiClient.get<any>('/api/v1/admin/audit-logs', params)
      
      if (Array.isArray(response)) {
        setLogs(response)
        setTotalPages(1)
      } else {
        setLogs(response.data || [])
        setTotalPages(response.totalPages || 1)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange() {
    setPage(1)
    loadLogs()
  }

  if (loading && page === 1) {
    return <div>Loading audit logs...</div>
  }

  return (
    <div className="admin-audit-logs-page">
      <h2>Audit Logs</h2>

      {error && (
        <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Filters</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label>
              User ID:
              <br />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Filter by user ID"
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              Action:
              <br />
              <input
                type="text"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="Filter by action"
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              Start Date:
              <br />
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <div>
            <label>
              End Date:
              <br />
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>
        </div>

        <button onClick={handleFilterChange} style={{ marginTop: '10px' }}>
          Apply Filters
        </button>
        <button 
          onClick={() => {
            setUserFilter('')
            setActionFilter('')
            setStartDateFilter('')
            setEndDateFilter('')
            setPage(1)
          }} 
          style={{ marginLeft: '10px', marginTop: '10px' }}
        >
          Clear Filters
        </button>
      </div>

      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Resource</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>{log.userEmail || log.userId}</td>
                  <td style={{ padding: '10px' }}>{log.action}</td>
                  <td style={{ padding: '10px' }}>
                    {log.resourceType}
                    {log.resourceId && ` (${log.resourceId})`}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {log.details && (
                      <details>
                        <summary style={{ cursor: 'pointer' }}>View</summary>
                        <pre style={{ fontSize: '12px', marginTop: '5px' }}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminAuditLogsPage
