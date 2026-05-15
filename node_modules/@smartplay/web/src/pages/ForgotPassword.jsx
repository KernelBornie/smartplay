import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setMessage(err.response?.data?.error?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h2>
      {!message ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
          />
          <button type="submit" disabled={loading}
            style={{
              padding: '14px', background: loading ? '#555' : '#1db954', color: '#000',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div>
          <p style={{ color: '#1db954', marginBottom: '12px' }}>{message}</p>
          {resetToken && (
            <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ color: '#888', marginBottom: '8px' }}>Your reset token (for development):</p>
              <input
                type="text"
                readOnly
                value={resetToken}
                style={{ width: '100%', padding: '10px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '13px' }}
              />
              <p style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
                Copy this token and go to <Link to="/reset-password" style={{ color: '#1db954' }}>Reset Password</Link>
              </p>
            </div>
          )}
          <Link to="/login" style={{ color: '#1db954', display: 'block', textAlign: 'center' }}>
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}