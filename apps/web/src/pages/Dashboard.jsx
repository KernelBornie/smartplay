import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MotionBackground from '../components/MotionBackground';
import BASE_URL from '../config';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    api.get('/admin/dashboard')
      .then(res => setData(res.data.data))
      .catch(() => setData(null));
  }, [user]);

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Please log in.</div>;
  if (!data) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Loading...</div>;

  const role = user?.role;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <MotionBackground />
      <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
            {role?.charAt(0).toUpperCase() + role?.slice(1)} Dashboard
          </h2>

          {role === 'listener' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <motion.div whileHover={{ scale: 1.02 }} style={{ background: '#111', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#1db954' }}>{data.plan?.name || 'Free'}</div>
                  <div style={{ color: '#888' }}>Current Plan</div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} style={{ background: '#111', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#3498db' }}>{data.recentStreams?.length || 0}</div>
                  <div style={{ color: '#888' }}>Recent Plays</div>
                </motion.div>
              </div>
              <h4>Recent Activity</h4>
              {data.recentStreams?.map((stream, i) => (
                <motion.div key={stream._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '10px', background: '#111', borderRadius: '6px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {stream.song?.coverImage && (
                    <img src={`${BASE_URL}${stream.song.coverImage}`} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                  )}
                  <div>
                    {stream.song?.title} - {new Date(stream.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
              <Link to="/profile" style={{ color: '#1db954', display: 'block', marginTop: '15px' }}>Manage Profile</Link>
            </motion.div>
          )}

          {role === 'artist' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Plays', value: data.totalPlays, color: '#1db954' },
                  { label: 'Earnings', value: `$${data.totalEarnings?.toFixed(2)}`, color: '#f39c12' },
                  { label: 'Pending', value: data.pendingSongs, color: '#e74c3c' }
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ background: '#111', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: item.color }}>{item.value}</div>
                    <div style={{ color: '#888' }}>{item.label}</div>
                  </motion.div>
                ))}
              </div>
              <h4>My Songs</h4>
              {data.mySongs?.map((song, i) => (
                <motion.div key={song._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ padding: '12px', background: '#111', borderRadius: '6px', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {song.coverImage ? (
                      <img src={`${BASE_URL}${song.coverImage}`} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', background: '#333', borderRadius: '4px' }} />
                    )}
                    <span>{song.title} <span style={{ color: '#888' }}>({song.status})</span></span>
                  </div>
                  <span style={{ color: '#1db954' }}>${song.revenue?.toFixed(2)}</span>
                </motion.div>
              ))}
              <div style={{ display: 'flex', gap: '16px', marginTop: '15px' }}>
                <Link to="/upload" style={{ color: '#1db954' }}>Upload New Song</Link>
                <Link to="/profile" style={{ color: '#1db954' }}>Edit Profile</Link>
              </div>
            </motion.div>
          )}

          {role === 'admin' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                {[
                  { label: 'Users', value: data.stats?.totalUsers, color: '#1db954' },
                  { label: 'Approved', value: data.stats?.approvedSongs, color: '#3498db' },
                  { label: 'Pending', value: data.stats?.pendingSongs, color: '#e74c3c' },
                  { label: 'Plays', value: data.stats?.totalStreams, color: '#f39c12' }
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ background: '#111', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: item.color }}>{item.value}</div>
                    <div style={{ color: '#888' }}>{item.label}</div>
                  </motion.div>
                ))}
              </div>
              <Link to="/admin" style={{ color: '#1db954', display: 'block' }}>Full Admin Panel</Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}