import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import StartScan from './pages/StartScan';
import ScanProgress from './pages/ScanProgress';
import ScanResults from './pages/ScanResults';
import ScanHistory from './pages/ScanHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import AdminScanHistory from './pages/AdminScanHistory';
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan/start"
              element={
                <ProtectedRoute>
                  <StartScan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan/:scanId"
              element={
                <ProtectedRoute>
                  <ScanProgress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan/:scanId/results"
              element={
                <ProtectedRoute>
                  <ScanResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <ScanHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            // Add these routes
            <Route
              path="/admin/history"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminScanHistory />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId/history"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <ScanHistory />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
