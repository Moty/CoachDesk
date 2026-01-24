import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, UserRole } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await api.get<UsersResponse>('/api/v1/users', params);
      setUsers(response.users);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setCreating(true);
      setCreateError(null);

      await api.post('/api/v1/users', {
        email: createEmail.trim(),
        password: createPassword,
        displayName: createDisplayName.trim(),
        role: createRole,
      });

      // Reset form
      setCreateEmail('');
      setCreatePassword('');
      setCreateDisplayName('');
      setCreateRole(UserRole.CUSTOMER);
      setShowCreateForm(false);

      // Reload users list
      loadUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
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
        <h1 style={{ margin: 0 }}>User Management</h1>
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
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {/* Create User Form */}
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
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New User</h2>
          <form onSubmit={handleCreateUser}>
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
                  Email *
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
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
                  Display Name *
                </label>
                <input
                  type="text"
                  value={createDisplayName}
                  onChange={(e) => setCreateDisplayName(e.target.value)}
                  required
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
                  Password *
                </label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
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
                  Role *
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
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
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Roles</option>
            {Object.values(UserRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Loading users...
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

      {!loading && !error && users.length === 0 && (
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
            No users found matching the selected filters.
          </p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
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
                  Email
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
                  Display Name
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
                  Role
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
                  Organization ID
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{user.displayName}</td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor:
                          user.role === UserRole.ADMIN
                            ? '#ffebee'
                            : user.role === UserRole.AGENT
                            ? '#e3f2fd'
                            : '#f5f5f5',
                        color:
                          user.role === UserRole.ADMIN
                            ? '#d32f2f'
                            : user.role === UserRole.AGENT
                            ? '#1976d2'
                            : '#666',
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#666' }}>
                    {user.organizationId}
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
