import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, token } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : null;
}
