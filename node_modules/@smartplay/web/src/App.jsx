import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import Upload from './pages/Upload';
import PlayerPage from './pages/Player';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Player from './components/Player';

export default function App() {
  const { user, logout } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: currentTrack ? '80px' : 0 }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px', background: '#111', borderBottom: '1px solid #222'
      }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1db954' }}>SmartPlay</Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/library">Library</Link>
          {user && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/upload">Upload</Link>
              <span style={{ color: '#888' }}>{user.email}</span>
              <button onClick={logout} style={{
                padding: '8px 16px', background: '#e74c3c', color: '#fff',
                border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}>Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" style={{
                padding: '8px 16px', background: '#1db954', color: '#000',
                borderRadius: '20px', fontWeight: 'bold'
              }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '32px' }}>
        <Routes>
          <Route path="/" element={<Home onPlay={setCurrentTrack} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/library" element={user ? <Library onPlay={setCurrentTrack} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? <Upload /> : <Navigate to="/login" />} />
          <Route path="/player/:id" element={<PlayerPage />} />
        </Routes>
      </main>

      {currentTrack && (
        <Player currentTrack={currentTrack} onClose={() => setCurrentTrack(null)} />
      )}
    </div>
  );
}