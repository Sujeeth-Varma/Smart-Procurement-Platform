import { Routes, Route, Navigate } from 'react-router';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Dashboards
import { UserDashboard } from '@/pages/dashboards/UserDashboard';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { SupplierDashboard } from '@/pages/dashboards/SupplierDashboard';

// Subpages
import { UserRequestsPage } from '@/pages/user/UserRequestsPage';
import { UserCatalogPage } from '@/pages/user/UserCatalogPage';
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { SupplierOrdersPage } from '@/pages/supplier/SupplierOrdersPage';
import { SupplierInventoryPage } from '@/pages/supplier/SupplierInventoryPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* User (Employee) Protected Routes */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/requests"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/catalog"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserCatalogPage />
          </ProtectedRoute>
        }
      />

      {/* Single Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />

      {/* Supplier Protected Routes */}
      <Route
        path="/supplier/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <SupplierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/orders"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <SupplierOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/inventory"
        element={
          <ProtectedRoute allowedRoles={['SUPPLIER']}>
            <SupplierInventoryPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
