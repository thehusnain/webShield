import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { adminAPI } from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  activeScans: number;
  recentUsers: any[];
  recentScans: any[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  scanLimit?: number;
  scansUsed?: number;
}

interface Scan {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  createdAt: string;
  userId?: User;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScans: 0,
    activeScans: 0,
    recentUsers: [],
    recentScans: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminAccess, setAdminAccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    console.log('🔍 [AdminDashboard] Component mounted');
    console.log('🔍 [AdminDashboard] Current user:', user);
    console.log('🔍 [AdminDashboard] User role:', user?.role);
    console.log('🔍 [AdminDashboard] Cookies:', document.cookie);

    // Check if user is admin
    if (!user) {
      console.log('❌ [AdminDashboard] No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      console.log('❌ [AdminDashboard] User is not admin, redirecting to dashboard');
      console.log('❌ [AdminDashboard] Expected role: admin, Actual role:', user?.role);
      navigate('/dashboard');
      return;
    }

    console.log('✅ [AdminDashboard] User is admin, proceeding...');

    // First test admin access
    testAdminAccess();
  }, [user, navigate]);

  const testAdminAccess = async () => {
    try {
      console.log('🔍 [AdminDashboard] Testing admin API access...');
      console.log('🔍 [AdminDashboard] Making request to /admin/');

      const response = await adminAPI.testAdmin();
      console.log('✅ [AdminDashboard] Admin access test successful:', response);

      setAdminAccess(true);
      setDebugInfo(prev => ({ ...prev, adminTest: 'SUCCESS', adminTestResponse: response }));

      // If admin access is successful, fetch stats
      fetchAdminStats();
    } catch (error: any) {
      console.error('❌ [AdminDashboard] Admin access test failed:', error);
      console.error('❌ [AdminDashboard] Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      setDebugInfo(prev => ({
        ...prev,
        adminTest: 'FAILED',
        adminTestError: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
      }));

      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 403) {
        setError('Admin access required. You do not have sufficient permissions.');
      } else {
        setError('Failed to access admin panel. ' + (error.response?.data?.error || error.message));
      }
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      console.log('🔍 [AdminDashboard] Fetching admin stats...');

      const response = await adminAPI.getStats();
      console.log('✅ [AdminDashboard] Admin stats received:', response);

      // Check if response has the expected structure
      if (response && typeof response === 'object') {
        setStats({
          totalUsers: response.totalUsers || 0,
          totalScans: response.totalScans || 0,
          activeScans: response.activeScans || 0,
          recentUsers: response.recentUsers || [],
          recentScans: response.recentScans || [],
        });
        setDebugInfo(prev => ({ ...prev, statsFetch: 'SUCCESS', statsResponse: response }));
      } else {
        console.warn('⚠️ [AdminDashboard] Unexpected stats response format:', response);
        setDebugInfo(prev => ({
          ...prev,
          statsFetch: 'UNEXPECTED_FORMAT',
          statsResponse: response,
        }));
      }
    } catch (error: any) {
      console.error('❌ [AdminDashboard] Failed to fetch admin stats:', error);
      console.error('❌ [AdminDashboard] Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      setDebugInfo(prev => ({
        ...prev,
        statsFetch: 'FAILED',
        statsError: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
      }));

      setError(error.response?.data?.error || error.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScan = async (scanId: string) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      console.log('🔍 [AdminDashboard] Removing scan:', scanId);

      await adminAPI.removeScan(scanId);
      alert('✅ Scan removed successfully');

      // Refresh stats after removal
      fetchAdminStats();
    } catch (error: any) {
      console.error('❌ [AdminDashboard] Failed to remove scan:', error);
      alert('❌ Failed to remove scan: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpgradeUser = async (userId: string, currentUsername: string) => {
    const newLimit = prompt(
      `Enter new scan limit for user "${currentUsername}":\nCurrent default: 10`
    );

    if (!newLimit) return;

    const limitNumber = parseInt(newLimit);
    if (isNaN(limitNumber) || limitNumber < 1) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      console.log('🔍 [AdminDashboard] Updating user limit:', { userId, newLimit: limitNumber });

      await adminAPI.updateUserLimit(userId, limitNumber);
      alert(`✅ Scan limit updated to ${limitNumber} for user "${currentUsername}"`);

      // Refresh stats after update
      fetchAdminStats();
    } catch (error: any) {
      console.error('[AdminDashboard] Failed to update user limit:', error);
      alert('❌ Failed to update user limit: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewUserHistory = (userId: string, username: string) => {
    navigate(`/admin/users/${userId}/history`);
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Checking admin permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Admin Access Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
              <Button variant="secondary" onClick={testAdminAccess}>
                Retry Admin Access
              </Button>
            </div>

            {/* Debug info for developers */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded text-left">
                <p className="text-sm font-semibold mb-2">Debug Info:</p>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Admin Dashboard</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users and monitor system activity
            </p>
            {adminAccess && <p className="text-sm text-green-500 mt-1">✅ Admin access verified</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg">
              <span className="text-red-500 font-bold">ADMIN ACCESS</span>
            </div>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              User Dashboard
            </Button>
          </div>
        </div>

        {/* Debug panel for developers */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 bg-yellow-500/10 border-yellow-500/50">
            <details>
              <summary className="cursor-pointer font-semibold text-yellow-600">
                🔧 Debug Information (Development Only)
              </summary>
              <div className="mt-2">
                <pre className="text-xs overflow-auto max-h-60 p-2 bg-gray-900 text-green-400 rounded">
                  {JSON.stringify(
                    {
                      user,
                      adminAccess,
                      stats,
                      debugInfo,
                      cookies: document.cookie,
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </details>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          {/* Total Scans */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Scans</p>
                <p className="text-3xl font-bold">{stats.totalScans}</p>
              </div>
            </div>
          </Card>

          {/* Active Scans */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-yellow-500 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Scans</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.activeScans}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Users and Scans */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Users</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.recentUsers.length} users
              </span>
            </div>

            {stats.recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-gray-600 dark:text-gray-400">No users yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map((user: User) => (
                  <div
                    key={user._id}
                    className="p-3 rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-black font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full">
                              {user.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Scans: {user.scansUsed || 0}/{user.scanLimit || 10}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpgradeUser(user._id, user.username)}
                            className="text-xs px-2 py-1"
                            title="Set scan limit"
                          >
                            ⚙️ Limit
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewUserHistory(user._id, user.username)}
                            className="text-xs px-2 py-1"
                            title="View scan history"
                          >
                            📊 History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Scans */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Scans</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.recentScans.length} scans
              </span>
            </div>

            {stats.recentScans.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 dark:text-gray-400">No scans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentScans.map((scan: Scan) => (
                  <div
                    key={scan._id}
                    className="p-3 rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" title={scan.targetUrl}>
                          {scan.targetUrl}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="uppercase font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                            {scan.scanType}
                          </span>
                          <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                          {scan.userId && (
                            <span className="text-xs text-gray-500">by {scan.userId.username}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                            scan.status === 'completed'
                              ? 'bg-green-500/20 text-green-500'
                              : scan.status === 'running'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : scan.status === 'failed'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}
                        >
                          {scan.status}
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoveScan(scan._id)}
                          className="text-xs px-2 py-1"
                          title="Delete scan"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Admin Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                const userId = prompt('Enter user ID to view their scan history:');
                if (userId) {
                  navigate(`/admin/users/${userId}/history`);
                }
              }}
              className="w-full"
              variant="secondary"
            >
              🔍 View User History
            </Button>

            <Button
              onClick={() => {
                const email = prompt('Enter user email to search:');
                if (email) {
                  // Implement user search functionality
                  alert(`Search functionality for ${email} would be implemented here`);
                }
              }}
              className="w-full"
              variant="secondary"
            >
              👤 Search User
            </Button>

            <Button
              onClick={() => {
                const scanId = prompt('Enter scan ID to view details:');
                if (scanId) {
                  navigate(`/scan/${scanId}`);
                }
              }}
              className="w-full"
              variant="secondary"
            >
              📊 View Scan Details
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 <strong>Tip:</strong> Click on user avatars or scan items for quick actions
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
