const Albums = () => {
  const albums = [
    { id: 1, title: 'Album 1', artist: 'Artist 1', year: '2024', cover: '📀' },
    { id: 2, title: 'Album 2', artist: 'Artist 2', year: '2024', cover: '📀' },
    { id: 3, title: 'Album 3', artist: 'Artist 3', year: '2023', cover: '📀' },
    { id: 4, title: 'Album 4', artist: 'Artist 4', year: '2023', cover: '📀' },
    { id: 5, title: 'Album 5', artist: 'Artist 5', year: '2024', cover: '📀' },
    { id: 6, title: 'Album 6', artist: 'Artist 6', year: '2022', cover: '📀' },
    { id: 7, title: 'Album 7', artist: 'Artist 7', year: '2024', cover: '📀' },
    { id: 8, title: 'Album 8', artist: 'Artist 8', year: '2023', cover: '📀' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📀 Top Albums</h1>
      <div style={styles.albumGrid}>
        {albums.map((album) => (
          <div key={album.id} style={styles.albumCard}>
            <div style={styles.albumCover}>
              <div style={styles.coverPlaceholder}>{album.cover}</div>
            </div>
            <div style={styles.albumTitle}>{album.title}</div>
            <div style={styles.albumArtist}>{album.artist}</div>
            <div style={styles.albumYear}>{album.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    marginLeft: '240px',
    paddingBottom: '90px',
  },
  title: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '32px',
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '32px',
  },
  albumCard: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  albumCardHover: {
    transform: 'translateY(-8px)',
  },
  albumCover: {
    width: '200px',
    height: '200px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
  },
  albumCoverHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
  },
  coverPlaceholder: {
    fontSize: '72px',
  },
  albumTitle: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  albumArtist: {
    color: '#b3b3b3',
    fontSize: '14px',
    marginBottom: '4px',
  },
  albumYear: {
    color: '#666',
    fontSize: '12px',
  },
};

export default Albums;
