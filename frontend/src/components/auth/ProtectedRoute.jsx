import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Duke ngarkuar...</div>;
  }

  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
}
