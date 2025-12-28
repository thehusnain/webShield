import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);

  // Throw error if used outside provider
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
