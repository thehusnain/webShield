import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AdminRoute
 * - Wrap admin routes with <AdminRoute /> in App.tsx
 * - If user is not logged-in or not an admin, redirect to /login or /dashboard
 *
 * Usage in App.tsx:
 * <Route path="/admin" element={<AdminRoute />}>
 *   <Route index element={<AdminDashboard />} />
 *   <Route path="users" element={<UsersList />} />
 *   ...
 * </Route>
 */
const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // While auth is loading, render nothing (or a spinner)
  if (loading) return null;

  // If no user, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged-in but not admin, redirect to main dashboard
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // User is admin — render nested admin routes
  return <Outlet />;
};

export default AdminRoute;