import { useState } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(70);

  return (
    <div style={styles.player}>
      {/* Song Info */}
      <div style={styles.songInfo}>
        <div style={styles.coverArt}>
          <div style={styles.coverPlaceholder}>🎵</div>
        </div>
        <div style={styles.songDetails}>
          <div style={styles.songTitle}>Song Title</div>
          <div style={styles.artistName}>Artist Name</div>
        </div>
        <button style={styles.likeButton}>❤️</button>
      </div>

      {/* Player Controls */}
      <div style={styles.controls}>
        <div style={styles.controlButtons}>
          <button style={styles.controlButton}>⏮</button>
          <button
            style={styles.playButton}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button style={styles.controlButton}>⏭</button>
        </div>
        <div style={styles.progressContainer}>
          <span style={styles.time}>1:23</span>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.time}>3:45</span>
        </div>
      </div>

      {/* Volume & Extra Controls */}
      <div style={styles.extraControls}>
        <button style={styles.extraButton}>🔀</button>
        <button style={styles.extraButton}>🔁</button>
        <div style={styles.volumeControl}>
          <span style={styles.volumeIcon}>🔊</span>
          <div style={styles.volumeBar}>
            <div style={{ ...styles.volumeFill, width: `${volume}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  player: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90px',
    background: 'linear-gradient(180deg, #181818 0%, #121212 100%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 1000,
    backdropFilter: 'blur(20px)',
  },
  songInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '30%',
  },
  coverArt: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  coverPlaceholder: {
    fontSize: '24px',
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: '12px',
  },
  likeButton: {
    background: 'transparent',
    border: 'none',
    color: '#b3b3b3',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    width: '40%',
  },
  controlButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  controlButton: {
    background: 'transparent',
    border: 'none',
    color: '#b3b3b3',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  playButton: {
    background: '#fff',
    border: 'none',
    color: '#000',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  time: {
    color: '#b3b3b3',
    fontSize: '11px',
    minWidth: '40px',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    cursor: 'pointer',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    background: '#fff',
    borderRadius: '2px',
    transition: 'all 0.1s ease',
  },
  extraControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '30%',
    justifyContent: 'flex-end',
  },
  extraButton: {
    background: 'transparent',
    border: 'none',
    color: '#b3b3b3',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  volumeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  volumeIcon: {
    color: '#b3b3b3',
    fontSize: '16px',
  },
  volumeBar: {
    width: '100px',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    cursor: 'pointer',
  },
  volumeFill: {
    height: '100%',
    background: '#b3b3b3',
    borderRadius: '2px',
  },
};

export default MusicPlayer;
