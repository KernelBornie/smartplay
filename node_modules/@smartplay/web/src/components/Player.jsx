import { useRef, useState, useEffect } from 'react';

export default function Player({ currentTrack, onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!currentTrack) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#181818',
      borderTop: '1px solid #333',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', background: '#1db954', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🎵
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{currentTrack.title}</div>
          <div style={{ color: '#888', fontSize: '12px' }}>{currentTrack.artistName || 'Unknown'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>
          {playing ? '⏸' : '▶️'}
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>
          ✕
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={`/api/music/songs/stream/${currentTrack._id}`} type="audio/mpeg" />
      </audio>
    </div>
  );
}