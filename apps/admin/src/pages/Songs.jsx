import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  async function fetchSongs() {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await api.get('/admin/songs', { params });
      setSongs(data.songs);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSongs(); }, [statusFilter]);

  async function approveSong(songId) {
    try {
      await api.post('/admin/approve-song', { songId });
      setActionMsg('Song approved!');
      fetchSongs();
    } catch (err) {
      setActionMsg(err.response?.data?.error || 'Failed');
    }
  }

  async function rejectSong(songId) {
    try {
      await api.post('/admin/reject-song', { songId });
      setActionMsg('Song rejected.');
      fetchSongs();
    } catch (err) {
      setActionMsg(err.response?.data?.error || 'Failed');
    }
  }

  async function deleteSong(songId) {
    if (!window.confirm('Delete this song?')) return;
    try {
      await api.delete(`/admin/songs/${songId}`);
      setActionMsg('Song deleted.');
      fetchSongs();
    } catch (err) {
      setActionMsg(err.response?.data?.error || 'Failed');
    }
  }

  return (
    <div>
      <h2 style={styles.heading}>Songs</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              ...styles.filterBtn,
              background: statusFilter === s ? '#4f46e5' : '#e5e7eb',
              color: statusFilter === s ? '#fff' : '#333',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

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
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Artist</th>
                <th style={styles.th}>Genre</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song._id} style={styles.tr}>
                  <td style={styles.td}>{song.title}</td>
                  <td style={styles.td}>{song.artistName}</td>
                  <td style={styles.td}>{song.genre || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background:
                          song.approvalStatus === 'approved'
                            ? '#d1fae5'
                            : song.approvalStatus === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          song.approvalStatus === 'approved'
                            ? '#065f46'
                            : song.approvalStatus === 'rejected'
                            ? '#991b1b'
                            : '#92400e',
                      }}
                    >
                      {song.approvalStatus}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {song.approvalStatus !== 'approved' && (
                        <button onClick={() => approveSong(song._id)} style={styles.approveBtn}>
                          Approve
                        </button>
                      )}
                      {song.approvalStatus !== 'rejected' && (
                        <button onClick={() => rejectSong(song._id)} style={styles.rejectBtn}>
                          Reject
                        </button>
                      )}
                      <button onClick={() => deleteSong(song._id)} style={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                    No songs found
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
  filterBtn: { padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 },
  tableWrap: { background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '0.9rem' },
  tr: { transition: 'background 0.1s' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 },
  approveBtn: { padding: '4px 10px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '4px', fontSize: '0.85rem' },
  rejectBtn: { padding: '4px 10px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '4px', fontSize: '0.85rem' },
  deleteBtn: { padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', fontSize: '0.85rem' },
  toast: { background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', cursor: 'pointer' },
  error: { background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
};
