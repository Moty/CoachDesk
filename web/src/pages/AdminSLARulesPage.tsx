import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SLARule, CreateSLARuleData } from '../types/slaRule'

function AdminSLARulesPage() {
  const { apiClient } = useAuth()
  const [rules, setRules] = useState<SLARule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<CreateSLARuleData>({
    name: '',
    priority: '',
    responseTimeMinutes: undefined,
    resolutionTimeMinutes: undefined
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    setLoading(true)
    setError('')
    try {
      const data = await apiClient.get<SLARule[]>('/api/v1/admin/sla-rules')
      setRules(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load SLA rules')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      const payload: CreateSLARuleData = {
        name: formData.name,
        priority: formData.priority || undefined,
        responseTimeMinutes: formData.responseTimeMinutes || undefined,
        resolutionTimeMinutes: formData.resolutionTimeMinutes || undefined
      }
      
      const newRule = await apiClient.post<SLARule>('/api/v1/admin/sla-rules', payload)
      setRules([...rules, newRule])
      setSuccessMessage('SLA rule created successfully')
      setFormData({
        name: '',
        priority: '',
        responseTimeMinutes: undefined,
        resolutionTimeMinutes: undefined
      })
      setShowCreateForm(false)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create SLA rule')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading SLA rules...</div>
  }

  return (
    <div className="admin-sla-rules-page">
      <h2>SLA Rules</h2>

      {successMessage && (
        <div className="success-message" style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginBottom: '20px' }}>
        {showCreateForm ? 'Cancel' : 'Create New SLA Rule'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
          <h3>Create SLA Rule</h3>

          {submitError && (
            <div className="error-message" style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '10px' }}>
              {submitError}
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <label>
              Name: <span style={{ color: 'red' }}>*</span>
              <br />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Priority:
              <br />
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="">-- Select Priority --</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Response Time (minutes):
              <br />
              <input
                type="number"
                min="1"
                value={formData.responseTimeMinutes || ''}
                onChange={(e) => setFormData({ ...formData, responseTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Resolution Time (minutes):
              <br />
              <input
                type="number"
                min="1"
                value={formData.resolutionTimeMinutes || ''}
                onChange={(e) => setFormData({ ...formData, resolutionTimeMinutes: e.target.value ? parseInt(e.target.value) : undefined })}
                style={{ width: '100%', padding: '5px' }}
              />
            </label>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create SLA Rule'}
          </button>
        </form>
      )}

      {rules.length === 0 ? (
        <p>No SLA rules found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Priority</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Response Time</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Resolution Time</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{rule.name}</td>
                <td style={{ padding: '10px' }}>{rule.priority || '-'}</td>
                <td style={{ padding: '10px' }}>{rule.responseTimeMinutes ? `${rule.responseTimeMinutes} min` : '-'}</td>
                <td style={{ padding: '10px' }}>{rule.resolutionTimeMinutes ? `${rule.resolutionTimeMinutes} min` : '-'}</td>
                <td style={{ padding: '10px' }}>{new Date(rule.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminSLARulesPage
