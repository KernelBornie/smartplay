import { useState } from 'react';

const HeroBanner = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.banner,
        ...(isHovered ? styles.bannerHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.background}>
        <div style={styles.gradient} />
      </div>
      <div style={styles.content}>
        <div style={styles.tag}>🔥 TRENDING NOW</div>
        <h1 style={styles.artistName}>Chile One</h1>
        <p style={styles.albumName}>New Album Out</p>
        <div style={styles.buttons}>
          <button style={styles.primaryButton}>▶ Play</button>
          <button style={styles.secondaryButton}>❤️ Save</button>
        </div>
      </div>
      <div style={styles.coverArt}>
        <div style={styles.coverPlaceholder}>🎵</div>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '40px',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    minHeight: '280px',
  },
  bannerHover: {
    transform: 'scale(1.01)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
  },
  tag: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  artistName: {
    color: '#fff',
    fontSize: '48px',
    fontWeight: 800,
    marginBottom: '8px',
    lineHeight: 1.1,
  },
  albumName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '18px',
    marginBottom: '32px',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
  },
  primaryButton: {
    background: '#1db954',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)',
  },
  secondaryButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
  },
  coverArt: {
    position: 'relative',
    zIndex: 1,
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  coverPlaceholder: {
    fontSize: '64px',
  },
};

export default HeroBanner;
