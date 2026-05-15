import HeroBanner from '../components/HeroBanner';
import HorizontalSection from '../components/HorizontalSection';

const Home = () => {
  const trendingSongs = [
    { id: 1, title: 'Song 1', artist: 'Artist 1', likes: '2.1K' },
    { id: 2, title: 'Song 2', artist: 'Artist 2', likes: '1.8K' },
    { id: 3, title: 'Song 3', artist: 'Artist 3', likes: '1.5K' },
    { id: 4, title: 'Song 4', artist: 'Artist 4', likes: '1.2K' },
    { id: 5, title: 'Song 5', artist: 'Artist 5', likes: '0.9K' },
  ];

  const continueListening = [
    { id: 6, title: 'Song 6', artist: 'Artist 6', likes: '3.2K' },
    { id: 7, title: 'Song 7', artist: 'Artist 7', likes: '2.8K' },
    { id: 8, title: 'Song 8', artist: 'Artist 8', likes: '2.4K' },
  ];

  const recommended = [
    { id: 9, title: 'Song 9', artist: 'Artist 9', likes: '1.9K' },
    { id: 10, title: 'Song 10', artist: 'Artist 10', likes: '1.7K' },
    { id: 11, title: 'Song 11', artist: 'Artist 11', likes: '1.4K' },
    { id: 12, title: 'Song 12', artist: 'Artist 12', likes: '1.1K' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.greeting}>
        Good Evening, Bornface 👋
      </div>

      <HeroBanner />

      <HorizontalSection title="🔥 Trending Now" songs={trendingSongs} />
      <HorizontalSection title="🎵 Continue Listening" songs={continueListening} />
      <HorizontalSection title="❤️ Recommended For You" songs={recommended} />
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    marginLeft: '240px',
    marginBottom: '90px',
    minHeight: 'calc(100vh - 90px)',
  },
  greeting: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '32px',
  },
};

export default Home;
