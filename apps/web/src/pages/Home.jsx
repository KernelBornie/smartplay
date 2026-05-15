import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MotionBackground from '../components/MotionBackground';
import BASE_URL from '../config';

export default function Home({ onPlay }) {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [topCharts, setTopCharts] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [playingMood, setPlayingMood] = useState(null);

  useEffect(() => {
    api.get('/api/music/songs/trending?limit=6')
      .then(r => setTrending(r.data.data || []))
      .catch(() => setTrending([]));

    api.get('/api/music/songs/charts')
      .then(r => setTopCharts(r.data.data || []))
      .catch(() => setTopCharts([]))
      .finally(() => setLoadingCharts(false));
  }, []);

  const playSong = (song) => {
    if (onPlay && song?._id) {
      onPlay(song);
    }
  };

  const playMood = async (mood) => {
    setPlayingMood(mood);
    try {
      const res = await api.get(`/api/music/songs?genre=${mood}&limit=5`);
      const songs = res.data?.data || [];
      if (songs.length > 0) {
        playSong(songs[0]);
      } else {
        alert(`No "${mood}" songs found. Try uploading or approving some ${mood} music!`);
      }
    } catch (err) {
      alert('Failed to load mood songs.');
    } finally {
      setPlayingMood(null);
    }
  };

  const moodIcons = {
    chill: '😌',
    coding: '💻',
    workout: '🏋️',
    driving: '🚗',
    worship: '🙏',
    party: '🔥',
    heartbreak: '😢',
    sleep: '🌙'
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <MotionBackground />

      <div style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #1db95422, #0a0a0a)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
              👋 Good Evening, {user?.username || 'Guest'}
            </h1>
            <p style={{ color: '#888', fontSize: '16px' }}>
              {user ? 'Continue your musical journey' : 'Discover your sound'}
            </p>
            {user && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '16px', color: '#aaa' }}>
                <span>🎧 4h 32m this week</span>
                <span>❤️ 23 liked songs</span>
              </div>
            )}
          </div>
          {!user && (
            <a href="/register" style={{
              padding: '14px 32px',
              background: '#1db954',
              color: '#000',
              borderRadius: '30px',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              Get Started Free
            </a>
          )}
        </motion.div>

        {/* Trending Section */}
        {trending.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>🔥 Trending in Lusaka</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {trending.map((song) => (
                <motion.div key={song._id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => playSong(song)} style={{
                  background: '#111',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: '100%', height: '120px',
                    background: song.coverImage ? `url(${BASE_URL}${song.coverImage}) center/cover no-repeat` : '#1db95433',
                    borderRadius: '8px', marginBottom: '10px'
                  }} />
                  <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>{song.artistName}</div>
                  <div style={{ color: '#1db954', fontSize: '12px', marginTop: '4px' }}>🔥 {song.plays} plays</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mood Playlists */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>🎭 Mood-Based Music</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
            {Object.keys(moodIcons).map(mood => (
              <motion.div
                key={mood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playMood(mood)}
                style={{
                  background: '#111',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  opacity: playingMood === mood ? 0.6 : 1
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                  {playingMood === mood ? '⏳' : moodIcons[mood]}
                </div>
                <div style={{ textTransform: 'capitalize' }}>{mood}</div>
                {playingMood === mood && <div style={{ fontSize: '12px', marginTop: '4px', color: '#888' }}>Loading...</div>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Zambia Top 50 */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>🇿🇲 Zambia Top 50</h3>
          {loadingCharts ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading charts...</div>
          ) : topCharts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCharts.map((song, i) => (
                <motion.div
                  key={song._id || i}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => playSong(song)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    background: '#111',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: '30px', color: '#888', fontWeight: 'bold' }}>{i+1}</div>
                  {song.coverImage ? (
                    <img src={`${BASE_URL}${song.coverImage}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '4px' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                    <div style={{ color: '#888', fontSize: '13px' }}>{song.artistName}</div>
                  </div>
                  <div style={{ color: '#1db954', fontSize: '13px' }}>🔥 {song.plays}</div>
                  <div style={{ color: '#1db954', fontSize: '18px' }}>▶</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#111',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              color: '#888'
            }}>
              <p style={{ marginBottom: '12px' }}>No songs in the charts yet.</p>
              {user && (
                <Link to="/upload" style={{ color: '#1db954', fontWeight: 'bold' }}>
                  Upload your first song →
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}