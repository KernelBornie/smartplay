import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Albums from './pages/Albums';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artists" element={<Artist />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      <MusicPlayer />
    </div>
  );
}

const styles = {
  container: {
    background: '#000',
    color: '#fff',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  main: {
    marginLeft: '240px',
    paddingBottom: '90px',
  },
};