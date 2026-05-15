import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('listener');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password, role);
      navigate('/library');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>Sign Up</h2>
      {error && <div style={{ background: '#e74c3c22', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => setRole('listener')} style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: role === 'listener' ? '2px solid #1db954' : '2px solid #333',
            background: role === 'listener' ? '#1db95422' : '#111', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
          }}>
            🎧 Listener
          </button>
          <button type="button" onClick={() => setRole('artist')} style={{
            flex: 1, padding: '12px', borderRadius: '8px', border: role === 'artist' ? '2px solid #f39c12' : '2px solid #333',
            background: role === 'artist' ? '#f39c1222' : '#111', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
          }}>
            🎤 Artist
          </button>
        </div>

        <button type="submit" style={{
          padding: '14px', background: '#1db954', color: '#000', border: 'none',
          borderRadius: '8px', fontSize: '16px', fontWeight: 'bold'
        }}>Sign Up</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#888' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}