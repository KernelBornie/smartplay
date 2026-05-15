import SongCard from './SongCard';

const HorizontalSection = ({ title, songs }) => {
  return (
    <div style={styles.section}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.scrollContainer}>
        {songs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '20px',
  },
  scrollContainer: {
    display: 'flex',
    gap: '24px',
    overflowX: 'auto',
    paddingBottom: '16px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
};

export default HorizontalSection;
