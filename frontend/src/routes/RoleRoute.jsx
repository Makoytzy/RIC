import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function RoleRoute({ allowed }) {
  const { hasRole } = useAuth();

  if (!hasRole(...allowed)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
