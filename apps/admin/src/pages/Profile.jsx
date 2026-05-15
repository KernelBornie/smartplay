const Profile = () => {
  return (
    <div style={styles.container}>
      {/* Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerGradient} />
      </div>

      {/* Profile Content */}
      <div style={styles.content}>
        <div style={styles.profileSection}>
          <div style={styles.profileImage}>
            <div style={styles.profilePlaceholder}>👤</div>
          </div>
          <div style={styles.userInfo}>
            <h1 style={styles.userName}>Bornface</h1>
            <div style={styles.levelBadge}>Level 12 Listener</div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>248</div>
            <div style={styles.statLabel}>Hours Played</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>1,234</div>
            <div style={styles.statLabel}>Songs Played</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>56</div>
            <div style={styles.statLabel}>Playlists</div>
          </div>
        </div>

        {/* Top Genres */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Top Genres</h2>
          <div style={styles.genreTags}>
            <div style={styles.genreTag}>Afrobeats</div>
            <div style={styles.genreTag}>Amapiano</div>
            <div style={styles.genreTag}>Gospel</div>
            <div style={styles.genreTag}>R&B</div>
            <div style={styles.genreTag}>Hip Hop</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recently Played</h2>
          <div style={styles.activityList}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={styles.activityItem}>
                <div style={styles.activityCover}>
                  <div style={styles.coverPlaceholder}>🎵</div>
                </div>
                <div style={styles.activityInfo}>
                  <div style={styles.activityTitle}>Song {item}</div>
                  <div style={styles.activityArtist}>Artist {item}</div>
                </div>
                <div style={styles.activityTime}>2 hours ago</div>
              </div>
            ))}
          </div>
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
    height: '300px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '150px',
    background: 'linear-gradient(180deg, transparent 0%, #000 100%)',
  },
  content: {
    padding: '40px',
    marginTop: '-100px',
    position: 'relative',
    zIndex: 1,
  },
  profileSection: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '24px',
    marginBottom: '40px',
  },
  profileImage: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '4px solid #000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholder: {
    fontSize: '72px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  userName: {
    color: '#fff',
    fontSize: '48px',
    fontWeight: 800,
    margin: 0,
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 700,
    width: 'fit-content',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statValue: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  statLabel: {
    color: '#b3b3b3',
    fontSize: '14px',
  },
  section: {
    marginBottom: '48px',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '24px',
  },
  genreTags: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  genreTag: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  activityCover: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholder: {
    fontSize: '24px',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '4px',
  },
  activityArtist: {
    color: '#b3b3b3',
    fontSize: '14px',
  },
  activityTime: {
    color: '#666',
    fontSize: '12px',
  },
};

export default Profile;
