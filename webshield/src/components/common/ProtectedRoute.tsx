import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  adminOnly = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If auth required but no user → login
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but hasn’t accepted terms and not on disclaimer → disclaimer
  if (user && !user.agreedToTerms && location.pathname !== "/disclaimer") {
    return <Navigate to="/disclaimer" replace />;
  }

  // If admin-only but user isn’t admin → dashboard
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If page is public (requireAuth=false) and user is logged in → dashboard
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;