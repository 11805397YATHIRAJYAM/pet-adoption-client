import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleGuard({ roles }) {
  const { user } = useSelector((s) => s.auth);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
