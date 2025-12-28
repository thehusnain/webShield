import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return {
    user: context.user,
    login: context.login,
    signup: context.signup,
    logout: context.logout,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading || false, // Make sure loading is included
  };
}
