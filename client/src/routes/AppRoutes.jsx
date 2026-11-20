import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts & Guards
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminStoreList from '../pages/admin/AdminStoreList';
import AdminAddStore from '../pages/admin/AdminAddStore';
import AdminUserList from '../pages/admin/AdminUserList';
import AdminAddUser from '../pages/admin/AdminAddUser';

// Normal User Pages
import UserDashboard from '../pages/user/UserDashboard';
import BrowseStores from '../pages/user/BrowseStores';
import MyRatings from '../pages/user/MyRatings';

// Store Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import OwnerRatings from '../pages/owner/OwnerRatings';

// Common Pages
import ChangePasswordPage from '../pages/common/ChangePasswordPage';
import NotFoundPage from '../pages/common/NotFoundPage';

export const AppRoutes = () => {
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  return (
    <Routes>
      {/* Root redirection */}
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Pages */}
      <Route
        path="/login"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated && user ? (
            <Navigate to={getDashboardPath(user.role)} replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Protected Routes for All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>

      {/* System Administrator Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/stores" element={<AdminStoreList />} />
          <Route path="/admin/stores/add" element={<AdminAddStore />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/admin/users/add" element={<AdminAddUser />} />
        </Route>
      </Route>

      {/* Normal User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/stores" element={<BrowseStores />} />
          <Route path="/user/my-ratings" element={<MyRatings />} />
        </Route>
      </Route>

      {/* Store Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/ratings" element={<OwnerRatings />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
