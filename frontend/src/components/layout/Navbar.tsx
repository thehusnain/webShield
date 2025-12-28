import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="content-wrapper py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cyber-glow">
              <span className="text-2xl">🛡️</span>
            </div>
            <span className="text-xl font-bold text-gradient">WebShield</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/#features" className="nav-link">
              Features
            </Link>
            <Link to="/#about" className="nav-link">
              About
            </Link>
            <Link to="/#contact" className="nav-link">
              Contact
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover: bg-gray-100 dark: hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover: bg-gray-100 dark: hover:bg-gray-800"
            >
              <span className="text-2xl">{isMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              Features
            </Link>
            <Link
              to="/#about"
              className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              About
            </Link>
            <Link
              to="/#contact"
              className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block py-2 px-4 bg-primary text-black rounded text-center"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
