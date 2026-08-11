import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Loading from '../components/common/Loading.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}
