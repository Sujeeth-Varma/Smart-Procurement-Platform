import { Routes, Route, Navigate } from 'react-router';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { UserDashboard } from '@/pages/dashboards/UserDashboard';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { SupplierDashboard } from '@/pages/dashboards/SupplierDashboard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Role Protected Dashboards */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supplier/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <SupplierDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
