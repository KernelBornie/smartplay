import { useState } from 'react';

const Artist = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const songs = [
    { id: 1, title: 'Song 1', plays: '2.1M', duration: '3:45' },
    { id: 2, title: 'Song 2', plays: '1.8M', duration: '4:12' },
    { id: 3, title: 'Song 3', plays: '1.5M', duration: '3:28' },
    { id: 4, title: 'Song 4', plays: '1.2M', duration: '4:05' },
    { id: 5, title: 'Song 5', plays: '0.9M', duration: '3:55' },
  ];

  return (
    <div style={styles.container}>
      {/* Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerGradient} />
        <div style={styles.bannerContent}>
          <div style={styles.profileSection}>
            <div style={styles.profileImage}>
              <div style={styles.profilePlaceholder}>🎤</div>
            </div>
            <div style={styles.artistInfo}>
              <div style={styles.verifiedBadge}>✓</div>
              <h1 style={styles.artistName}>Yo Maps</h1>
              <p style={styles.stats}>1.2M listeners • 120 songs</p>
              <button
                style={{
                  ...styles.followButton,
                  ...(isFollowing ? styles.followingButton : {}),
                }}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Popular Songs</h2>
        <div style={styles.songList}>
          {songs.map((song, index) => (
            <div key={song.id} style={styles.songRow}>
              <span style={styles.songIndex}>{index + 1}</span>
              <div style={styles.songInfo}>
                <div style={styles.songTitle}>{song.title}</div>
              </div>
              <span style={styles.songPlays}>{song.plays}</span>
              <span style={styles.songDuration}>{song.duration}</span>
              <button style={styles.playButton}>▶</button>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Albums</h2>
        <div style={styles.albumGrid}>
          {[1, 2, 3, 4].map((album) => (
            <div key={album} style={styles.albumCard}>
              <div style={styles.albumCover}>
                <div style={styles.coverPlaceholder}>📀</div>
              </div>
              <div style={styles.albumName}>Album {album}</div>
              <div style={styles.albumYear}>2024</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginLeft: '240px',
    paddingBottom: '90px',
  },
  banner: {
    height: '400px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '200px',
    background: 'linear-gradient(180deg, transparent 0%, #000 100%)',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
    padding: '60px 40px',
    display: 'flex',
    alignItems: 'flex-end',
    height: '100%',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '32px',
  },
  profileImage: {
    width: '232px',
    height: '232px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholder: {
    fontSize: '96px',
  },
  artistInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  verifiedBadge: {
    width: '24px',
    height: '24px',
    background: '#1db954',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    width: 'fit-content',
  },
  artistName: {
    color: '#fff',
    fontSize: '64px',
    fontWeight: 800,
    margin: 0,
    lineHeight: 1,
  },
  stats: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px',
    margin: 0,
  },
  followButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: 'fit-content',
  },
  followingButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
  },
  content: {
    padding: '40px',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '24px',
  },
  songList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '48px',
  },
  songRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  songIndex: {
    color: '#b3b3b3',
    fontSize: '14px',
    width: '24px',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 500,
  },
  songPlays: {
    color: '#b3b3b3',
    fontSize: '14px',
    width: '80px',
  },
  songDuration: {
    color: '#b3b3b3',
    fontSize: '14px',
    width: '60px',
  },
  playButton: {
    background: 'transparent',
    border: 'none',
    color: '#b3b3b3',
    fontSize: '18px',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.2s ease',
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '24px',
  },
  albumCard: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  albumCover: {
    width: '180px',
    height: '180px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    transition: 'all 0.3s ease',
  },
  coverPlaceholder: {
    fontSize: '64px',
  },
  albumName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  albumYear: {
    color: '#b3b3b3',
    fontSize: '14px',
  },
};

export default Artist;
