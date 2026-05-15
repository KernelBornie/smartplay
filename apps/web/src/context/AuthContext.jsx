import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage (tab‑specific)
  useEffect(() => {
    if (token) {
      try {
        const saved = sessionStorage.getItem('user');
        if (saved) setUser(JSON.parse(saved));
      } catch (e) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const t = res?.data?.data?.token;
    const u = res?.data?.data?.user;
    if (!t || !u) throw new Error('Invalid login response');
    sessionStorage.setItem('token', t);
    sessionStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, email, password, role = 'listener') => {
    const res = await api.post('/auth/register', { username, email, password, role });
    const t = res?.data?.data?.token;
    const u = res?.data?.data?.user;
    if (!t || !u) throw new Error('Registration failed');
    sessionStorage.setItem('token', t);
    sessionStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);