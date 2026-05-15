import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config';

export default function Library({ onPlay }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/music/songs')
      .then(res => setSongs(res.data.data || []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const playStream = (song) => {
    setCurrentTrack(song);
    if (onPlay) onPlay(song);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = `${BASE_URL}/api/music/songs/stream/${song._id}`;
        audioRef.current.load();
        audioRef.current.play().catch(err => console.log('Play error:', err));
      }
    }, 50);
  };

  const downloadSong = (song) => {
    window.open(`${BASE_URL}/api/music/songs/download/${song._id}`, '_blank');
  };

  return (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Library</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        {user?.role === 'artist' ? 'Your music catalog' : 'Stream and download music'}
      </p>

      {currentTrack && (
        <div style={{
          background: '#111', padding: '20px', borderRadius: '12px',
          marginBottom: '24px', textAlign: 'center'
        }}>
          {currentTrack.coverImage && (
            <img src={`${BASE_URL}${currentTrack.coverImage}`} alt="" style={{ width: '200px', height: '200px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }} />
          )}
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Now Playing: {currentTrack.title}
          </div>
          <div style={{ color: '#1db954', marginBottom: '12px' }}>
            {currentTrack.artistName || 'Unknown Artist'}
          </div>
          <audio
            ref={audioRef}
            controls
            preload="auto"
            style={{ width: '100%', maxWidth: '500px' }}
            key={currentTrack._id}
          >
            <source src={`${BASE_URL}/api/music/songs/stream/${currentTrack._id}`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <span style={{ background: '#1db95422', color: '#1db954', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
              ▶ {currentTrack.plays} plays
            </span>
            <span style={{ background: '#3498db22', color: '#3498db', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
              ⬇ {currentTrack.downloads} downloads
            </span>
            <span style={{ background: '#f39c1222', color: '#f39c12', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
              ${currentTrack.revenue?.toFixed(2)} earned
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#888', fontSize: '18px', marginBottom: '16px' }}>No songs yet</p>
          <a href="/upload" style={{
            padding: '12px 24px', background: '#1db954', color: '#000',
            borderRadius: '20px', fontWeight: 'bold', textDecoration: 'none'
          }}>Upload Your First Song</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {songs.map((song, i) => (
            <div key={song._id || i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', background: currentTrack?._id === song._id ? '#1db95422' : '#111',
              borderRadius: '10px', border: currentTrack?._id === song._id ? '1px solid #1db954' : '1px solid transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {song.coverImage ? (
                  <img src={`${BASE_URL}${song.coverImage}`} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', background: '#333', borderRadius: '6px' }} />
                )}
                <button onClick={() => playStream(song)} style={{
                  width: '44px', height: '44px', background: '#1db954', border: 'none',
                  borderRadius: '50%', color: '#000', fontSize: '18px', cursor: 'pointer'
                }}>
                  {currentTrack?._id === song._id ? '⏸' : '▶'}
                </button>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                  <div style={{ color: '#888', fontSize: '13px' }}>
                    {song.artistName || 'Unknown'} · {song.genre} · {song.plays} plays
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#f39c12', fontSize: '13px', fontWeight: 'bold' }}>
                  ${song.revenue?.toFixed(2)}
                </span>
                <button onClick={() => downloadSong(song)} style={{
                  padding: '8px 16px', background: '#3498db', color: '#fff',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>
                  ⬇ ${song.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}