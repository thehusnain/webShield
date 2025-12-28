import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function AuthNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="content-wrapper py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              {/* Simple shield emoji instead of broken icon */}
              <span className="text-2xl">🛡️</span>
            </div>
            <span className="text-xl font-bold text-gradient">WebShield</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/scan/start" className="nav-link">
              Start Scan
            </Link>
            <Link to="/history" className="nav-link">
              History
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {/* Simple emoji instead of icon */}
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <Link to="/profile" className="nav-link">
                {/* Simple user emoji */}
                <span className="text-xl mr-2">👤</span>
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
