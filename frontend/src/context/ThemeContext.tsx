import { createContext, useState, useEffect, ReactNode } from "react";
import type { ThemeMode, ThemeContextType } from "../types";

// Create context with undefined default
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

// Props for ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get saved theme from localStorage or default to dark
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as ThemeMode) || "dark";
  });

  // Apply theme class to document when theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old theme class
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
