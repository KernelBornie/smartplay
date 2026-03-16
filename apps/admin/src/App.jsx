import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Songs from './pages/Songs';
import Users from './pages/Users';
import Analytics from './pages/Analytics';

function Sidebar() {
  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  }

  const user = JSON.parse(localStorage.getItem('admin_user') || 'null');

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>⚙️ Admin</div>
      <nav style={styles.nav}>
        <Link to="/admin/dashboard" style={styles.navLink}>📊 Dashboard</Link>
        <Link to="/admin/songs" style={styles.navLink}>🎵 Songs</Link>
        <Link to="/admin/users" style={styles.navLink}>👥 Users</Link>
        <Link to="/admin/analytics" style={styles.navLink}>📈 Analytics</Link>
      </nav>
      {user && (
        <div style={{ marginTop: 'auto', padding: '12px 0' }}>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>{user.email}</p>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </aside>
  );
}

function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem('admin_user') || 'null');
  const token = localStorage.getItem('admin_token');
  if (!token || !user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
}

function AdminLayout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="songs" element={<Songs />} />
                  <Route path="users" element={<Users />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayout>
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '220px',
    background: '#1a1a2e',
    color: '#fff',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  brand: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#fff' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navLink: {
    display: 'block',
    padding: '10px 12px',
    borderRadius: '6px',
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  main: { marginLeft: '220px', padding: '28px', flex: 1 },
  logoutBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #444',
    color: '#ccc',
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
};
