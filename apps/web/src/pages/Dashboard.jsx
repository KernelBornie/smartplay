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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    api.get('/admin/dashboard')
      .then(res => {
        setData(res.data.data);
        setError(false);
      })
      .catch(() => setError(true));
  }, [user]);

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Please log in.</div>;
  if (error) return (
    <div style={{ color: '#e74c3c', textAlign: 'center', marginTop: '40px' }}>
      <p>Failed to load dashboard.</p>
      <button onClick={() => { setError(false); setData(null); api.get('/admin/dashboard').then(res => setData(res.data.data)).catch(() => setError(true)); }} style={{ padding: '8px 16px', background: '#1db954', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
      <p style={{ marginTop: '10px' }}><Link to="/login" style={{ color: '#1db954' }}>Log out and log in again</Link></p>
    </div>
  );
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

          {/* role‑specific content unchanged from previous version – just copy the listener/artist/admin blocks from the earlier Dashboard.jsx */}
          {/* ... */}
        </motion.div>
      </div>
    </div>
  );
}