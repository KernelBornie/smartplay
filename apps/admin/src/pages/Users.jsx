import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function banUser(userId) {
    if (!window.confirm('Ban this user?')) return;
    try {
      await api.post('/admin/ban-user', { userId });
      setActionMsg('User banned.');
      fetchUsers();
    } catch (err) {
      setActionMsg(err.response?.data?.error || 'Failed');
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Users</h2>

      {actionMsg && (
        <div style={styles.toast} onClick={() => setActionMsg('')}>{actionMsg} ✕</div>
      )}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={styles.tr}>
                  <td style={styles.td}>{user.username}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: '#e0e7ff', color: '#3730a3' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: user.isBanned ? '#fee2e2' : '#d1fae5',
                        color: user.isBanned ? '#991b1b' : '#065f46',
                      }}
                    >
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {!user.isBanned && user.role !== 'admin' && (
                      <button onClick={() => banUser(user._id)} style={styles.banBtn}>
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { marginBottom: '20px', fontSize: '1.5rem', color: '#1a1a2e' },
  tableWrap: { background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' },
  tr: { transition: 'background 0.1s' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 },
  banBtn: { padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', fontSize: '0.85rem' },
  toast: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', cursor: 'pointer' },
  error: { background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
};
