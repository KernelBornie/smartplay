import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import MotionBackground from '../components/MotionBackground';
import BASE_URL from '../config';

const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admintoken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('admintoken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('overview');
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);

  const login = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const t = res.data.data.token;
      sessionStorage.setItem('admintoken', t);
      setToken(t);
    } catch (e) {
      alert('Login failed');
    }
  };

  useEffect(() => {
    if (!token) return;
    api.get('/admin/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, [token]);

  const loadSongs = (status) => {
    api.get(`/admin/songs?status=${status}`)
      .then(r => { setSongs(r.data.data); setTab(status); }).catch(() => {});
  };
  const loadUsers = () => {
    api.get('/admin/users')
      .then(r => { setUsers(r.data.data); setTab('users'); }).catch(() => {});
  };
  const approveSong = async (id) => { await api.post('/admin/approve-song', { songId: id }); loadSongs('pending'); };
  const rejectSong = async (id) => { await api.post('/admin/reject-song', { songId: id }); loadSongs('pending'); };
  const deleteSong = async (id) => { await api.delete(`/admin/songs/${id}`); loadSongs(tab); };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center', fontFamily: 'Segoe UI, sans-serif', color: '#fff' }}>
        <h2>Admin Login</h2>
        <input type="email" placeholder="Admin Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '16px', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <button onClick={login} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>Login as Admin</button>
      </div>
    );
  }

  if (!data) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Loading...</div>;

  const { stats, topArtists, genreStats, recentActivity } = data;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <MotionBackground />
      <div style={{ position: 'relative', zIndex: 1, fontFamily: 'Segoe UI, sans-serif', color: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['overview', 'pending', 'approved', 'rejected', 'users'].map((t) => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => t === 'pending' || t === 'approved' || t === 'rejected' ? loadSongs(t) : t === 'users' ? loadUsers() : setTab('overview')}
                style={tabBtn(tab === t)}>
                {t === 'overview' ? '📊 Overview' : t === 'pending' ? '⏳ Pending' : t === 'approved' ? '✅ Approved' : t === 'rejected' ? '❌ Rejected' : '👥 Users'}
              </motion.button>
            ))}
          </div>

          {tab === 'overview' && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: '#1db954' },
                  { label: 'Approved Songs', value: stats.approvedSongs, color: '#3498db' },
                  { label: 'Pending Songs', value: stats.pendingSongs, color: '#e74c3c' },
                  { label: 'Total Streams', value: stats.totalStreams, color: '#f39c12' },
                  { label: 'Total Downloads', value: stats.totalDownloads, color: '#9b59b6' },
                  { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: '#2ecc71' }
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ background: '#111', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                    <div style={{ color: '#888', marginTop: '8px' }}>{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ background: '#111', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px' }}>🏆 Top Artists</h3>
                  {topArtists && topArtists.length > 0 ? (
                    topArtists.map((a, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' }}>
                        <span>{a.artistName}</span>
                        <span style={{ color: '#1db954' }}>{a.streams} streams</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No artist data yet.</div>
                  )}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ background: '#111', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '16px' }}>🎵 Genre Breakdown</h3>
                  {genreStats.map((g, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' }}>
                      <span>{g._id || 'Unknown'}</span>
                      <span style={{ color: '#888' }}>{g.count} songs · {g.totalPlays} plays</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ background: '#111', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '16px' }}>📡 Live Activity</h3>
                {recentActivity.slice(0, 10).map((event, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: '6px 0', fontSize: '14px', borderBottom: '1px solid #222' }}>
                    <span style={{ color: '#1db954' }}>{event.user?.username || 'Someone'}</span>
                    {' '}
                    {event.type === 'stream' ? 'streamed' : 'downloaded'}
                    {' '}
                    <strong>{event.song?.title || 'a song'}</strong>
                    {event.song?.artistName && ` by ${event.song.artistName}`}
                    <span style={{ color: '#888', marginLeft: '10px', fontSize: '12px' }}>
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {(tab === 'pending' || tab === 'approved' || tab === 'rejected') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 style={{ marginBottom: '16px', textTransform: 'capitalize' }}>{tab} Songs</h3>
              {songs.map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#111', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.coverImage ? (
                      <img src={`${BASE_URL}${s.coverImage}`} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', background: '#333', borderRadius: '4px' }} />
                    )}
                    <div>
                      <strong>{s.title}</strong>
                      <span style={{ color: '#888', marginLeft: '12px' }}>{s.artistName}</span>
                      <span style={{ color: '#f39c12', marginLeft: '12px', fontSize: '13px' }}>${s.revenue?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => approveSong(s._id)} style={greenBtn}>Approve</button>
                        <button onClick={() => rejectSong(s._id)} style={redBtn}>Reject</button>
                      </>
                    )}
                    <button onClick={() => deleteSong(s._id)} style={redBtn}>Delete</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h3 style={{ marginBottom: '16px' }}>All Users</h3>
              {users.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#111', borderRadius: '8px', marginBottom: '8px' }}>
                  <div>
                    <strong>{u.username}</strong>
                    <span style={{ color: '#888', marginLeft: '12px' }}>{u.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                      background: u.role === 'admin' ? '#e74c3c22' : u.role === 'artist' ? '#1db95422' : '#3498db22',
                      color: u.role === 'admin' ? '#e74c3c' : u.role === 'artist' ? '#1db954' : '#3498db'
                    }}>{u.role}</span>
                    <span style={{ color: '#f39c12', fontSize: '13px' }}>${u.totalEarnings?.toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function tabBtn(active) {
  return {
    padding: '10px 20px', background: active ? '#1db954' : '#222', color: active ? '#000' : '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
  };
}

const greenBtn = { padding: '6px 14px', background: '#1db954', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const redBtn = { padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };