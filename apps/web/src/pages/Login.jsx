import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (mounted.current && result) {
        navigate('/library');
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.error?.message || err.message || 'Login failed');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', color: '#fff' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '24px', textAlign: 'center' }}>Login</h2>
      {error && <div style={{ background: '#e74c3c22', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
          style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
          style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <button type="submit" disabled={loading} style={{
          padding: '14px', background: loading ? '#555' : '#1db954', color: '#000', border: 'none',
          borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '16px', color: '#888' }}>
        Don't have an account? <Link to="/register" style={{ color: '#1db954' }}>Sign up</Link>
        <br />
        <Link to="/forgot-password" style={{ color: '#888', fontSize: '14px' }}>Forgot Password?</Link>
      </p>
    </div>
  );
}