import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data } = await api.get('/analytics/summary');
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <p style={{ color: '#888' }}>Loading...</p>;
  if (error) return <div style={{ color: '#c53030' }}>{error}</div>;

  const stats = [
    { label: 'Total Streams', value: summary?.totalStreams ?? 0, icon: '▶️' },
    { label: 'Total Songs', value: summary?.totalSongs ?? 0, icon: '🎵' },
    { label: 'Approved Songs', value: summary?.approvedSongs ?? 0, icon: '✅' },
    { label: 'Pending Review', value: summary?.pendingSongs ?? 0, icon: '⏳' },
  ];

  return (
    <div>
      <h2 style={styles.heading}>Dashboard</h2>
      <div style={styles.grid}>
        {stats.map((s) => (
          <div key={s.label} style={styles.card}>
            <span style={styles.icon}>{s.icon}</span>
            <div>
              <p style={styles.value}>{s.value.toLocaleString()}</p>
              <p style={styles.label}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  heading: { marginBottom: '24px', fontSize: '1.5rem', color: '#1a1a2e' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  icon: { fontSize: '2rem' },
  value: { fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e' },
  label: { fontSize: '0.85rem', color: '#888', marginTop: '4px' },
};
