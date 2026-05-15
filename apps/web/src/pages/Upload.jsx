import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [album, setAlbum] = useState('');
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select an audio file'); return; }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (coverFile) formData.append('cover', coverFile);
      formData.append('title', title);
      formData.append('genre', genre || 'other');
      formData.append('album', album || '');
      await api.post('/api/music/songs/upload', formData);
      setSuccess('Song uploaded! Pending admin approval.');
      setTimeout(() => navigate('/library'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', color: '#fff' }}>
      <h2>Upload Your Music</h2>
      <p style={{ color: '#888' }}>Upload songs and earn $0.004 per stream and $0.50 per download.</p>
      {error && <div style={{ background: '#e74c3c22', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      {success && <div style={{ background: '#1db95422', color: '#1db954', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="text" placeholder="Song Title *" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <select value={genre} onChange={e => setGenre(e.target.value)} style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}>
          <option value="">Select Genre</option>
          <option value="rock">Rock</option>
          <option value="pop">Pop</option>
          <option value="hip-hop">Hip Hop</option>
          <option value="jazz">Jazz</option>
          <option value="electronic">Electronic</option>
          <option value="r&b">R&B</option>
          <option value="country">Country</option>
          <option value="other">Other</option>
        </select>
        <input type="text" placeholder="Album (optional)" value={album} onChange={e => setAlbum(e.target.value)} style={{ padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
        <label style={{ color: '#888' }}>Audio File *</label>
        <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} style={{ padding: '10px', color: '#fff' }} />
        <label style={{ color: '#888' }}>Cover Image (optional)</label>
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} style={{ padding: '10px', color: '#fff' }} />
        <button type="submit" disabled={uploading} style={{ padding: '14px', background: uploading ? '#555' : '#1db954', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
      <div style={{ marginTop: '24px', padding: '16px', background: '#111', borderRadius: '8px' }}>
        <h4 style={{ color: '#f39c12', marginBottom: '8px' }}>💰 Monetization</h4>
        <p style={{ color: '#888', fontSize: '13px' }}>• $0.004 per stream</p>
        <p style={{ color: '#888', fontSize: '13px' }}>• $0.50 per download</p>
        <p style={{ color: '#888', fontSize: '13px' }}>• Songs require admin approval</p>
      </div>
    </div>
  );
}