import { useState } from 'react';

const SongCard = ({ song }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.coverContainer}>
        <div style={{
          ...styles.coverArt,
          ...(isHovered ? styles.coverArtHover : {}),
        }}>
          <div style={styles.coverPlaceholder}>🎵</div>
          {isHovered && (
            <button style={styles.playButton}>
              ▶
            </button>
          )}
        </div>
      </div>
      <div style={styles.songInfo}>
        <div style={{
          ...styles.songTitle,
          ...(isHovered ? styles.songTitleHover : {}),
        }}>{song.title}</div>
        <div style={styles.artistName}>{song.artist}</div>
      </div>
      <div style={styles.stats}>
        <span style={styles.likes}>❤️ {song.likes || '0'}</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    minWidth: '180px',
    maxWidth: '180px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  coverContainer: {
    marginBottom: '12px',
  },
  coverArt: {
    width: '148px',
    height: '148px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  coverArtHover: {
    transform: 'scale(1.05)',
  },
  coverPlaceholder: {
    fontSize: '48px',
  },
  playButton: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    background: '#1db954',
    border: 'none',
    color: '#fff',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    animation: 'fadeIn 0.2s ease',
  },
  songInfo: {
    marginBottom: '8px',
  },
  songTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  },
  songTitleHover: {
    color: '#1db954',
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  likes: {
    color: '#b3b3b3',
    fontSize: '12px',
  },
};

export default SongCard;
