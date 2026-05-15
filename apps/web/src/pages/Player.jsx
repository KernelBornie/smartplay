import { useParams, Link } from 'react-router-dom';

export default function Player() {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      <div style={{
        width: '200px', height: '200px', background: '#1db954',
        borderRadius: '12px', margin: '0 auto 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '48px'
      }}>▶</div>
      <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Now Playing</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>Track ID: {id}</p>
      <audio controls style={{ width: '100%', marginBottom: '24px' }}>
        <source src={`/stream/${id}`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <Link to="/library" style={{ color: '#1db954' }}>← Back to Library</Link>
    </div>
  );
}