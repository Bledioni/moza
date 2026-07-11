import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('staff_token');
    if (token) {
      api
        .get('/staff/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('staff_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/staff/login', { email, password });
    localStorage.setItem('staff_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/staff/logout');
    } finally {
      localStorage.removeItem('staff_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
