import { createContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthContextType } from "../types";
import { authAPI } from "../services/api";
import DisclaimerModal from "../components/DisclaimerModal";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false); // 🔥 NEW

  useEffect(() => {
    console.log("[AuthProvider] Initial mount, checking auth");
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("[AuthContext] Checking authentication...");
      const data = await authAPI.getProfile();
      console.log("[AuthContext] User authenticated:", data.user);

      const userData: User = {
        id: data.user._id || data.user.userId || "1",
        username: data.user.username,
        email: data.user.email,
        role: data.user.role || "user",
        scanLimit: data.user.scanLimit || 10,
        scansUsed: data.user.scansUsed || 0,
        agreedToTerms: data.user.agreedToTerms || false, // 🔥 NEW
      };

      console.log("[AuthContext] Setting user data:", userData);
      setUser(userData);
      setIsAuthenticated(true);

      // Show disclaimer if not agreed
      if (!userData.agreedToTerms) {
        console.log(
          "[AuthContext] User has not agreed to terms, showing disclaimer"
        );
        setShowDisclaimer(true);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      console.log("[AuthContext] Auth check failed:", err.message);

      if (err.response?.status === 401) {
        console.log("[AuthContext] 401 error, clearing auth");
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      console.log("[AuthContext] Setting loading:  false");
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      console.log("[AuthContext] Signing up.. .");
      await authAPI.signup({ username, email, password });
      await checkAuth();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("[AuthContext] Signup error:", err);
      throw new Error(err.response?.data?.error || "Signup failed");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Logging in...");
      await authAPI.login({ email, password });
      console.log("[AuthContext] Login successful, checking auth");
      await checkAuth();
      console.log("[AuthContext] Auth check after login complete");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("[AuthContext] Login error:", err);
      throw new Error(err.response?.data?.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      console.log("[AuthContext] Logging out...");
      await authAPI.logout();
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    } finally {
      console.log("[AuthContext] Clearing user and auth state");
      setUser(null);
      setIsAuthenticated(false);
      setShowDisclaimer(false);
    }
  };

  // NEW: Handle disclaimer acceptance
  const handleAcceptTerms = async () => {
    try {
      console.log("[AuthContext] Accepting terms...");
      await authAPI.acceptTerms();

      // Update user state
      if (user) {
        setUser({ ...user, agreedToTerms: true });
      }

      setShowDisclaimer(false);
      console.log("[AuthContext] Terms accepted successfully");
    } catch (error) {
      console.error("[AuthContext] Error accepting terms:", error);
      alert("Failed to save terms acceptance.  Please try again.");
    }
  };

  // NEW: Handle disclaimer decline
  const handleDeclineTerms = async () => {
    console.log("[AuthContext] User declined terms, logging out");
    await logout();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isAuthenticated, loading }}
    >
      {children}

      {/* Show disclaimer modal if needed */}
      {showDisclaimer && isAuthenticated && (
        <DisclaimerModal
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      )}
    </AuthContext.Provider>
  );
}
