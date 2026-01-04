// components/common/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();

  // DEBUG: Log current state to understand what's happening
  console.log("🔐 ProtectedRoute Check:");
  console.log("- Current path:", window.location.pathname);
  console.log("- User exists:", !!user);
  console.log("- User role:", user?.role);
  console.log("- agreedToTerms:", user?.agreedToTerms);
  console.log("- Loading state:", loading);
  console.log("- Require auth:", requireAuth);
  console.log("- Admin only:", adminOnly);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("⏳ Showing loading spinner...");
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Rule 1: If page requires auth but user is not logged in → redirect to login
  if (requireAuth && !user) {
    console.log("🚫 No user, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Rule 2: If user hasn't accepted terms (except on disclaimer page) → redirect to disclaimer
  if (user && !user.agreedToTerms && window.location.pathname !== '/disclaimer') {
    console.log("📝 Terms not accepted, redirecting to disclaimer");
    console.log("   Current agreedToTerms value:", user.agreedToTerms);
    return <Navigate to="/disclaimer" />;
  }

  // Rule 3: If page is admin-only but user is not admin → redirect to dashboard
  if (adminOnly && user?.role !== 'admin') {
    console.log("👮 Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  // Rule 4: If page doesn't require auth but user is logged in → redirect to dashboard
  if (!requireAuth && user) {
    console.log("✅ User logged in, redirecting from public page");
    return <Navigate to="/dashboard" />;
  }

  // If all checks pass → show the protected content
  console.log("✅ All checks passed, showing content");
  return <>{children}</>;
};

export default ProtectedRoute;