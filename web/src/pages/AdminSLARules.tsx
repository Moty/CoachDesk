import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { SLARule, SLARulesResponse } from '../types/sla';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import { TicketPriority } from '../types/ticket';

export function AdminSLARules() {
  const { user: currentUser } = useAuth();
  const [rules, setRules] = useState<SLARule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create rule form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPriority, setCreatePriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [createFirstResponse, setCreateFirstResponse] = useState('');
  const [createResolution, setCreateResolution] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Edit rule state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPriority, setEditPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [editFirstResponse, setEditFirstResponse] = useState('');
  const [editResolution, setEditResolution] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, [page]);

  async function loadRules() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<SLARulesResponse>('/api/v1/admin/sla-rules', {
        page,
        limit: 20,
      });
      
      setRules(response.rules);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load SLA rules');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setCreating(true);
      setCreateError(null);
      setCreateSuccess(null);

      await api.post('/api/v1/admin/sla-rules', {
        name: createName.trim(),
        priority: createPriority,
        firstResponseMinutes: parseInt(createFirstResponse, 10),
        resolutionMinutes: parseInt(createResolution, 10),
      });

      // Reset form
      setCreateName('');
      setCreatePriority(TicketPriority.MEDIUM);
      setCreateFirstResponse('');
      setCreateResolution('');
      setShowCreateForm(false);
      setCreateSuccess('SLA rule created successfully');

      // Reload rules list
      loadRules();
      
      // Clear success message after 3 seconds
      setTimeout(() => setCreateSuccess(null), 3000);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create SLA rule');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(rule: SLARule) {
    setEditingRuleId(rule.id);
    setEditName(rule.name);
    setEditPriority(rule.priority as TicketPriority);
    setEditFirstResponse(rule.firstResponseMinutes.toString());
    setEditResolution(rule.resolutionMinutes.toString());
    setUpdateError(null);
  }

  function cancelEdit() {
    setEditingRuleId(null);
    setEditName('');
    setEditPriority(TicketPriority.MEDIUM);
    setEditFirstResponse('');
    setEditResolution('');
    setUpdateError(null);
  }

  async function handleUpdateRule(ruleId: string) {
    try {
      setUpdating(true);
      setUpdateError(null);

      const updatedRule = await api.patch<SLARule>(`/api/v1/admin/sla-rules/${ruleId}`, {
        name: editName.trim(),
        priority: editPriority,
        firstResponseMinutes: parseInt(editFirstResponse, 10),
        resolutionMinutes: parseInt(editResolution, 10),
      });

      // Update rule in list without full page refresh
      setRules((prevRules) =>
        prevRules.map((r) => (r.id === ruleId ? updatedRule : r))
      );
      
      setEditingRuleId(null);
      setCreateSuccess('SLA rule updated successfully');
      setTimeout(() => setCreateSuccess(null), 3000);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update SLA rule');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm('Are you sure you want to delete this SLA rule?')) {
      return;
    }

    try {
      setDeleting(ruleId);

      await api.delete(`/api/v1/admin/sla-rules/${ruleId}`);

      // Remove rule from list without full page refresh
      setRules((prevRules) => prevRules.filter((r) => r.id !== ruleId));
      
      setCreateSuccess('SLA rule deleted successfully');
      setTimeout(() => setCreateSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete SLA rule');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeleting(null);
    }
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>SLA Rules Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: showCreateForm ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Create SLA Rule'}
        </button>
      </div>

      {/* Success Message */}
      {createSuccess && (
        <div
          style={{
            backgroundColor: '#d4edda',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            marginBottom: '1rem',
          }}
        >
          <p style={{ color: '#155724', margin: 0 }}>{createSuccess}</p>
        </div>
      )}

      {/* Create SLA Rule Form */}
      {showCreateForm && (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New SLA Rule</h2>
          <form onSubmit={handleCreateRule}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  placeholder="e.g., High Priority SLA"
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
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  Priority *
                </label>
                <select
                  value={createPriority}
                  onChange={(e) => setCreatePriority(e.target.value as TicketPriority)}
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
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  First Response (minutes) *
                </label>
                <input
                  type="number"
                  value={createFirstResponse}
                  onChange={(e) => setCreateFirstResponse(e.target.value)}
                  required
                  min="1"
                  placeholder="e.g., 60"
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
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  Resolution (minutes) *
                </label>
                <input
                  type="number"
                  value={createResolution}
                  onChange={(e) => setCreateResolution(e.target.value)}
                  required
                  min="1"
                  placeholder="e.g., 480"
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

            {createError && (
              <p style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {createError}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: creating ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: creating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              {creating ? 'Creating...' : 'Create Rule'}
            </button>
          </form>
        </div>
      )}

      {/* SLA Rules Table */}
      {loading && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading SLA rules...
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

      {!loading && !error && rules.length === 0 && (
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
            No SLA rules found. Create one to get started.
          </p>
        </div>
      )}

      {!loading && !error && rules.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
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
                  Name
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
                  Priority
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
                  First Response
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
                  Resolution
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
                  Status
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const isEditing = editingRuleId === rule.id;
                
                return (
                  <tr key={rule.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    {/* Name */}
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                            }}
                          />
                          {updateError && (
                            <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              {updateError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontWeight: '600' }}>{rule.name}</span>
                      )}
                    </td>
                    
                    {/* Priority */}
                    <td style={{ padding: '1rem' }}>
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
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor:
                              rule.priority === 'urgent'
                                ? '#ffebee'
                                : rule.priority === 'high'
                                ? '#fff3e0'
                                : rule.priority === 'medium'
                                ? '#e3f2fd'
                                : '#f5f5f5',
                            color:
                              rule.priority === 'urgent'
                                ? '#d32f2f'
                                : rule.priority === 'high'
                                ? '#e65100'
                                : rule.priority === 'medium'
                                ? '#1976d2'
                                : '#666',
                          }}
                        >
                          {rule.priority}
                        </span>
                      )}
                    </td>
                    
                    {/* First Response */}
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editFirstResponse}
                          onChange={(e) => setEditFirstResponse(e.target.value)}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                          }}
                        />
                      ) : (
                        `${rule.firstResponseMinutes} min`
                      )}
                    </td>
                    
                    {/* Resolution */}
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editResolution}
                          onChange={(e) => setEditResolution(e.target.value)}
                          min="1"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                          }}
                        />
                      ) : (
                        `${rule.resolutionMinutes} min`
                      )}
                    </td>
                    
                    {/* Status */}
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: rule.enabled ? '#e8f5e9' : '#f5f5f5',
                          color: rule.enabled ? '#2e7d32' : '#666',
                        }}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td style={{ padding: '1rem' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateRule(rule.id)}
                            disabled={updating}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: updating ? '#ccc' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: updating ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            {updating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={updating}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: updating ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => startEdit(rule)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={deleting === rule.id}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: deleting === rule.id ? '#ccc' : '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: deleting === rule.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            {deleting === rule.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
