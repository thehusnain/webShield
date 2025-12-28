import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthNavbar from '../components/layout/AuthNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { adminAPI } from '../services/api';
import {
  HiUsers,
  HiSearch,
  HiTrash,
  HiEye,
  HiCog,
  HiChartBar,
  HiDocumentText,
  HiUser,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiFilter,
} from 'react-icons/hi';

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
  scanLimit: number;
  scansUsed: number;
  lastActive?: string;
}

interface Scan {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  createdAt: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'scans'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userScans, setUserScans] = useState<Scan[]>([]);

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScans: 0,
    activeScans: 0,
    recentUsers: [],
    recentScans: [],
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allScans, setAllScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminAccess, setAdminAccess] = useState(false);

  // Refs for scrolling to sections
  const usersSectionRef = useRef<HTMLDivElement>(null);
  const scansSectionRef = useRef<HTMLDivElement>(null);
  const analyticsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check hash in URL for section navigation
    const hash = location.hash.replace('#', '');
    if (hash === 'users' || hash === 'scans' || hash === 'analytics') {
      setActiveTab(hash as 'users' | 'scans');

      // Scroll to section after a short delay
      setTimeout(() => {
        if (hash === 'users' && usersSectionRef.current) {
          usersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (hash === 'scans' && scansSectionRef.current) {
          scansSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (hash === 'analytics' && analyticsSectionRef.current) {
          analyticsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    console.log('🔍 [AdminDashboard] Component mounted');

    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    testAdminAccess();
  }, [user, navigate]);

  const testAdminAccess = async () => {
    try {
      const response = await adminAPI.testAdmin();
      setAdminAccess(true);
      fetchAllData();
    } catch (error: any) {
      setError('Failed to access admin panel. ' + (error.response?.data?.error || error.message));
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      console.log('🔍 [AdminDashboard] Fetching all admin data...');

      // Fetch stats
      const statsResponse = await adminAPI.getStats();
      setStats(statsResponse);

      // Fetch all users
      await fetchAllUsers();

      // Fetch all scans
      await fetchAllScans();
    } catch (error: any) {
      console.error('❌ [AdminDashboard] Failed to fetch data:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // For now, we'll use stats.recentUsers
      // In a real app, you'd have a separate API endpoint for all users
      setAllUsers(stats.recentUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchAllScans = async () => {
    try {
      const response = await adminAPI.getAllHistory();
      setAllScans(response.scans || []);
    } catch (error) {
      console.error('Failed to fetch scans:', error);
    }
  };

  const fetchUserScans = async (userId: string) => {
    try {
      const response = await adminAPI.getUserHistory(userId);
      setUserScans(response.scans || []);
    } catch (error) {
      console.error('Failed to fetch user scans:', error);
    }
  };

  const handleRemoveScan = async (scanId: string) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      await adminAPI.removeScan(scanId);
      alert('✅ Scan removed successfully');

      // Refresh data
      fetchAllData();
      if (selectedUser) {
        fetchUserScans(selectedUser._id);
      }
    } catch (error: any) {
      alert('❌ Failed to remove scan: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpgradeUser = async (userData: User) => {
    const newLimit = prompt(
      `Enter new scan limit for user "${userData.username}":\nCurrent limit: ${userData.scanLimit}`
    );

    if (!newLimit) return;

    const limitNumber = parseInt(newLimit);
    if (isNaN(limitNumber) || limitNumber < 1) {
      alert('❌ Please enter a valid positive number');
      return;
    }

    try {
      await adminAPI.updateUserLimit(userData._id, limitNumber);
      alert(`✅ Scan limit updated to ${limitNumber} for user "${userData.username}"`);

      // Refresh data
      fetchAllData();
    } catch (error: any) {
      alert('❌ Failed to update user limit: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleViewUserScans = (userData: User) => {
    setSelectedUser(userData);
    fetchUserScans(userData._id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
      case 'pending':
        return <HiClock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiClock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'running':
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredUsers = allUsers.filter(
    user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScans = allScans.filter(
    scan =>
      scan.targetUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.userId?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.userId?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
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
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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
              Manage users, scans, and system analytics
            </p>
          </div>
          <div className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg">
            <span className="text-red-500 font-bold">ADMIN ACCESS</span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-light-border dark:border-dark-border pb-4 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-black'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <HiUsers className="inline w-4 h-4 mr-2" />
              Users ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('scans')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'scans'
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <HiDocumentText className="inline w-4 h-4 mr-2" />
              Scans ({stats.totalScans})
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search users, scans, emails..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <HiUsers className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <HiDocumentText className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Scans</p>
                    <p className="text-3xl font-bold">{stats.totalScans}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <HiClock className="w-7 h-7 text-yellow-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Scans</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.activeScans}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <HiUsers className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">Manage Users</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        View and manage all users
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('scans')}
                  className="p-4 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-green-500 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <HiDocumentText className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">View All Scans</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monitor all system scans
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Refresh all data
                    fetchAllData();
                  }}
                  className="p-4 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <HiCog className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">Refresh Data</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update all statistics
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Recent Users</h2>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
                  >
                    View All
                  </button>
                </div>
                {stats.recentUsers.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-8">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentUsers.slice(0, 5).map((user: User) => (
                      <div
                        key={user._id}
                        className="p-3 rounded-lg border border-light-border dark:border-dark-border"
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
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs font-semibold capitalize text-primary">
                              {user.role}
                            </p>
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
                  <button
                    onClick={() => setActiveTab('scans')}
                    className="text-green-500 hover:text-green-600 text-sm font-semibold"
                  >
                    View All
                  </button>
                </div>
                {stats.recentScans.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-8">No scans yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentScans.slice(0, 5).map((scan: Scan) => (
                      <div
                        key={scan._id}
                        className="p-3 rounded-lg border border-light-border dark:border-dark-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{scan.targetUrl}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {scan.scanType.toUpperCase()} •{' '}
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </p>
                            {scan.userId && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                by {scan.userId.username}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ml-2 ${
                              scan.status === 'completed'
                                ? 'bg-green-500/20 text-green-500'
                                : scan.status === 'running'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {scan.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div ref={usersSectionRef}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <HiUsers className="w-6 h-6 text-blue-500" />
                    User Management
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage all registered users ({filteredUsers.length} users)
                  </p>
                </div>
                <Button onClick={fetchAllData}>Refresh</Button>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {searchQuery ? 'No users found matching your search' : 'No users yet'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map(userData => (
                    <div
                      key={userData._id}
                      className="p-4 rounded-lg border border-light-border dark:border-dark-border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <span className="text-blue-500 font-bold text-lg">
                              {userData.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold">{userData.username}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {userData.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full">
                                {userData.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined: {new Date(userData.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <p className="text-sm font-semibold">
                              Scans: {userData.scansUsed}/{userData.scanLimit}
                            </p>
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${(userData.scansUsed / userData.scanLimit) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleViewUserScans(userData)}
                              className="text-xs"
                            >
                              <HiEye className="w-3 h-3 mr-1" />
                              View Scans
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleUpgradeUser(userData)}
                              className="text-xs"
                            >
                              <HiCog className="w-3 h-3 mr-1" />
                              Set Limit
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* User Scans (if viewing) */}
                      {selectedUser?._id === userData._id && userScans.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                          <h4 className="font-bold mb-3">
                            User's Recent Scans ({userScans.length})
                          </h4>
                          <div className="space-y-2">
                            {userScans.slice(0, 5).map(scan => (
                              <div
                                key={scan._id}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{scan.targetUrl}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {scan.scanType.toUpperCase()} •{' '}
                                      {new Date(scan.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs font-semibold uppercase ${
                                      scan.status === 'completed'
                                        ? 'text-green-500'
                                        : scan.status === 'running'
                                        ? 'text-yellow-500'
                                        : 'text-red-500'
                                    }`}
                                  >
                                    {scan.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {userScans.length > 5 && (
                              <p className="text-center text-sm text-gray-500">
                                ... and {userScans.length - 5} more scans
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Scans Tab */}
        {activeTab === 'scans' && (
          <div ref={scansSectionRef}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <HiDocumentText className="w-6 h-6 text-green-500" />
                    All Scans ({filteredScans.length})
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor and manage all system scans
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={fetchAllData}>
                    Refresh
                  </Button>
                </div>
              </div>

              {filteredScans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {searchQuery ? 'No scans found matching your search' : 'No scans yet'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-green-500 hover:text-green-600"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredScans.map(scan => (
                    <div
                      key={scan._id}
                      className="p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(scan.status)}
                            <p className="font-semibold truncate" title={scan.targetUrl}>
                              {scan.targetUrl}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="uppercase font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                              {scan.scanType}
                            </span>
                            <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                            {scan.userId && (
                              <span className="text-gray-500">
                                by {scan.userId.username} ({scan.userId.email})
                              </span>
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
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/scan/${scan._id}`)}
                              className="text-xs px-2"
                              title="View scan"
                            >
                              <HiEye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveScan(scan._id)}
                              className="text-xs px-2"
                              title="Delete scan"
                            >
                              <HiTrash className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Analytics Section (Referenced from Dashboard) */}
        <div ref={analyticsSectionRef} className="mt-8">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HiChartBar className="w-6 h-6 text-purple-500" />
                  <span className="text-gradient">System Analytics</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Platform insights and statistics</p>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full">
                <span className="text-sm font-semibold text-purple-500">ANALYTICS</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Daily Scans</p>
                <p className="text-2xl font-bold">{(stats.totalScans / 30).toFixed(1)}</p>
                <p className="text-xs text-gray-500">Avg. per day</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Scan Success Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.totalScans > 0
                    ? ((stats.completedScans / stats.totalScans) * 100).toFixed(0)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-500">Completed scans</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Scans per User</p>
                <p className="text-2xl font-bold">
                  {stats.totalUsers > 0 ? (stats.totalScans / stats.totalUsers).toFixed(1) : 0}
                </p>
                <p className="text-xs text-gray-500">Usage distribution</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-blue-500">
                  {
                    stats.recentUsers.filter(
                      (u: any) =>
                        new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-bold mb-3">Scan Types Distribution</h3>
              <div className="space-y-2">
                {['nmap', 'nikto', 'ssl', 'sqlmap'].map(type => {
                  const count = allScans.filter(s => s.scanType === type).length;
                  const percentage = allScans.length > 0 ? (count / allScans.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
