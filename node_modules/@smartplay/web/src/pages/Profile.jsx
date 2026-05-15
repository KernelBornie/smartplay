import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    api.get('/auth/profile')
      .then(res => {
        setProfile(res.data.data);
        setForm(res.data.data);
      })
      .catch(() => setProfile(null));
  }, [user]);   // re‑fetch when user changes

  const handleSave = async () => {
    await api.put('/auth/profile', form);
    setProfile(form);
    setEditing(false);
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('picture', file);
    const res = await api.post('/auth/profile/picture', formData);
    setProfile(res.data.data);
    setForm(res.data.data);
  };

  const upgradeToPremium = async () => {
    const plans = await api.get('/auth/plans');
    const premiumPlan = plans.data.data.find(p => p.name === 'premium');
    if (premiumPlan) {
      await api.post('/auth/subscribe', { planId: premiumPlan._id });
      alert('Upgraded to Premium!');
      window.location.reload();
    }
  };

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Please log in.</div>;
  if (!profile) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', color: '#fff' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Profile</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {profile.profilePicture ? (
          <img src={`http://localhost:3000${profile.profilePicture}`} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#333', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
            {profile.username?.[0]?.toUpperCase()}
          </div>
        )}
        <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ marginTop: '10px', color: '#fff' }} />
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input value={form.username || ''} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username" style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          <textarea value={form.bio || ''} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio" rows="3" style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          <input type="date" value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''} onChange={e => setForm({...form, dateOfBirth: e.target.value})} style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          <input value={form.website || ''} onChange={e => setForm({...form, website: e.target.value})} placeholder="Website" style={{ padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          <button onClick={handleSave} style={{ padding: '12px', background: '#1db954', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Plan:</strong> {profile.plan?.name || 'Free'}</p>
          {profile.plan?.name === 'premium' && <p><strong>Expires:</strong> {new Date(profile.planExpiresAt).toLocaleDateString()}</p>}
          <p><strong>DOB:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
          <p><strong>Bio:</strong> {profile.bio || 'No bio'}</p>
          <button onClick={() => setEditing(true)} style={{ padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Edit Profile</button>
        </div>
      )}

      {profile.plan?.name === 'free' && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f39c1222', borderRadius: '8px' }}>
          <h3 style={{ color: '#f39c12' }}>Upgrade to Premium</h3>
          <p>Ad-free streaming, HD quality, offline downloads, and more!</p>
          <button onClick={upgradeToPremium} style={{ padding: '10px 20px', background: '#f39c12', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Upgrade for $9.99/month</button>
        </div>
      )}
    </div>
  );
}