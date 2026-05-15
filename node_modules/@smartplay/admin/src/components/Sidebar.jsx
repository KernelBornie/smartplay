import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '🔍', label: 'Search', path: '/search' },
    { icon: '🎵', label: 'Library', path: '/library' },
    { icon: '❤️', label: 'Liked Songs', path: '/liked' },
    { icon: '📈', label: 'Trending', path: '/trending' },
    { icon: '🎤', label: 'Artists', path: '/artists' },
    { icon: '📀', label: 'Albums', path: '/albums' },
    { icon: '🎧', label: 'Recently Played', path: '/recent' },
  ];

  const playlists = [
    'Coding Mix',
    'Workout Mix',
    'Sunday Gospel',
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoText}>SMARTPLAY</span>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={styles.navLink}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.divider} />

      <div style={styles.section}>
        <div style={styles.sectionHeader}>YOUR PLAYLISTS</div>
        {playlists.map((playlist) => (
          <div key={playlist} style={styles.playlist}>
            {playlist}
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      <nav style={styles.bottomNav}>
        <Link to="/profile" style={styles.navLink}>Profile</Link>
        <Link to="/settings" style={styles.navLink}>Settings</Link>
        <Link to="/logout" style={styles.navLink}>Logout</Link>
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logo: {
    marginBottom: '32px',
    padding: '0 8px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '2px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '24px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: '#b3b3b3',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '20px',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '16px 0',
  },
  section: {
    flex: 1,
    overflowY: 'auto',
  },
  sectionHeader: {
    color: '#666',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: '12px',
    padding: '0 8px',
  },
  playlist: {
    padding: '8px 16px',
    color: '#b3b3b3',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  bottomNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
};

export default Sidebar;
