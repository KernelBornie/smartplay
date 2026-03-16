import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Analytics() {
  const [logs, setLogs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [logsRes, topRes] = await Promise.all([
          api.get('/analytics/streams'),
          api.get('/analytics/top-songs'),
        ]);
        setLogs(logsRes.data.logs);
        setTopSongs(topRes.data.songs);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p style={{ color: '#888' }}>Loading...</p>;
  if (error) return <div style={{ color: '#c53030' }}>{error}</div>;

  return (
    <div>
      <h2 style={styles.heading}>Analytics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h3 style={styles.subheading}>🏆 Top Songs</h3>
          {topSongs.length === 0 ? (
            <p style={{ color: '#888' }}>No data</p>
          ) : (
            <ol style={styles.list}>
              {topSongs.map((song, i) => (
                <li key={song._id} style={styles.listItem}>
                  <span style={styles.rank}>#{i + 1}</span>
                  <div>
                    <p style={styles.songTitle}>{song.title}</p>
                    <p style={styles.songMeta}>{song.artistName} · {song.playCount} plays</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.subheading}>📡 Recent Streams</h3>
          {logs.length === 0 ? (
            <p style={{ color: '#888' }}>No stream data yet</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Song</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Range?</th>
                    <th style={styles.th}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 20).map((log) => (
                    <tr key={log._id}>
                      <td style={styles.td}>{log.song?.title || '-'}</td>
                      <td style={styles.td}>{log.user?.username || 'anonymous'}</td>
                      <td style={styles.td}>{log.rangeRequest ? '✅' : '—'}</td>
                      <td style={styles.td}>{new Date(log.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '24px', fontSize: '1.5rem', color: '#1a1a2e' },
  subheading: { marginBottom: '16px', fontSize: '1rem', color: '#1a1a2e', fontWeight: 600 },
  section: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  list: { paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { display: 'flex', gap: '12px', alignItems: 'center' },
  rank: { fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5', minWidth: '32px' },
  songTitle: { fontSize: '0.9rem', fontWeight: 600 },
  songMeta: { fontSize: '0.8rem', color: '#888' },
  tableWrap: { overflow: 'auto', maxHeight: '320px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px 12px', textAlign: 'left', fontSize: '0.8rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '8px 12px', fontSize: '0.85rem', borderBottom: '1px solid #f3f4f6' },
};
