import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ReactNode } from 'react';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { token, isAdmin } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
