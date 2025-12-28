import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';
import { authAPI } from '../services/api';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AuthContext] Checking authentication...');
      const data = await authAPI.getProfile();
      console.log('[AuthContext] User authenticated:', data.user);

      const userData = {
        id: data.user._id || data.user.userId || '1',
        username: data.user.username,
        email: data.user.email,
        role: data.user.role || 'user',
        scanLimit: data.user.scanLimit || 10,
        scansUsed: data.user.scansUsed || 0,
      };

      console.log('[AuthContext] Setting user data:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      console.log('[AuthContext] Auth check error:', err.message);

      // 🔥 CRITICAL FIX: Only clear auth on 401 or 403
      // Don't clear on network errors or server issues
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('[AuthContext] Clearing auth due to 401/403');
        setUser(null);
        setIsAuthenticated(false);
        // Clear any stale cookies
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else {
        console.log('[AuthContext] Keeping auth state for non-auth errors');
        // Keep current auth state for network/timeout errors
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      console.log('[AuthContext] Signing up...');
      await authAPI.signup({ username, email, password });
      await checkAuth();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('[AuthContext] Signup error:', err);
      throw new Error(err.response?.data?.error || 'Signup failed');
    }
  };

  // In AuthContext.tsx, update the login function:
  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Logging in...');
      const response = await authAPI.login({ email, password });

      // Call checkAuth to update user state
      await checkAuth();

      // Return the response so Login.tsx can check the user role
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('[AuthContext] Login error:', err);
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out...');
      // Clear client-side state first
      setUser(null);
      setIsAuthenticated(false);
      // Clear cookies
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Then call API
      await authAPI.logout();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Still clear local state even if API fails
      setUser(null);
      setIsAuthenticated(false);
    }
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
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
