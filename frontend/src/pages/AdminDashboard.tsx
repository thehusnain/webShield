import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthNavbar from "../components/layout/AuthNavbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { adminAPI } from "../services/api";
import {
  HiUsers,
  HiSearch,
  HiTrash,
  HiEye,
  HiDocumentText,
  HiX,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from "react-icons/hi";

/* =========================
   TYPES
   ========================= */
interface User {
  _id: string;
  username: string;
  email: string;
  role:  string;
  createdAt:  string;
  scanLimit: number;
  usedScan: number;
}

interface Scan {
  _id: string;
  targetUrl: string;
  scanType:  string;
  status: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
}

/* =========================
   COMPONENT
   ========================= */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allScans, setAllScans] = useState<Scan[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userScans, setUserScans] = useState<Scan[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserScans, setLoadingUserScans] = useState(false);
  
  
  const [newLimit, setNewLimit] = useState<number>(10);

  /* =========================
     ROLE GUARD
     ========================= */
  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    loadData();
  }, [user, navigate]);

  /* =========================
     LOAD DATA
     ========================= */
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get stats (includes users)
      const statsResponse = await adminAPI.getStats();
      setAllUsers(statsResponse.recentUsers || []);
      
      // Get all scans
      const scansResponse = await adminAPI.getAllHistory();
      setAllScans(scansResponse.scans || []);
      
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VIEW USER HISTORY
     ========================= */
  const handleViewUser = async (userToView: User) => {
    setSelectedUser(userToView);
    setNewLimit(userToView.scanLimit);
    setShowUserModal(true);
    setLoadingUserScans(true);

    try {
      const response = await adminAPI.getUserHistory(userToView._id);
      setUserScans(response.scans || []);
    } catch (error) {
      console.error("Failed to fetch user scans:", error);
      setUserScans([]);
    } finally {
      setLoadingUserScans(false);
    }
  };

  /* =========================
     UPDATE USER LIMIT
     ========================= */
  const handleUpdateLimit = async () => {
    if (!selectedUser) return;

    if (newLimit < 0) {
      alert("Limit cannot be negative");
      return;
    }

    try {
      await adminAPI.updateUserLimit(selectedUser._id, newLimit);
      
      // Update local state
      setAllUsers(allUsers.map(u => 
        u._id === selectedUser._id ? { ...u, scanLimit: newLimit } : u
      ));
      
      setSelectedUser({ ...selectedUser, scanLimit: newLimit });
      
      alert("Scan limit updated successfully!");
    } catch (error) {
      console.error("Failed to update limit:", error);
      alert("Failed to update scan limit");
    }
  };

  /* =========================
     DELETE SCAN
     ========================= */
  const handleDeleteScan = async (scanId: string) => {
    if (!window.confirm("Are you sure you want to delete this scan?")) {
      return;
    }

    try {
      await adminAPI. removeScan(scanId);
      
      // Remove from all scans
      setAllScans(allScans.filter(s => s._id !== scanId));
      
      // Remove from user scans if modal is open
      if (showUserModal) {
        setUserScans(userScans.filter(s => s._id !== scanId));
      }
      
      alert("Scan deleted successfully!");
    } catch (error) {
      console.error("Failed to delete scan:", error);
      alert("Failed to delete scan");
    }
  };

  /* =========================
     CLOSE MODAL
     ========================= */
  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserScans([]);
    setNewLimit(10);
  };

  /* =========================
     HELPERS
     ========================= */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <HiCheckCircle className="text-green-500" />;
      case "running":
        return <HiClock className="text-blue-500" />;
      case "failed":
        return <HiExclamationCircle className="text-red-500" />;
      default:
        return <HiClock className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month:  "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================
     FILTERING
     ========================= */
  const filteredUsers = allUsers. filter(
    (u) =>
      u.username. toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScans = allScans. filter((s) =>
    s.targetUrl.toLowerCase().includes(searchQuery. toLowerCase())
  );

  /* =========================
     LOADING STATE
     ========================= */
  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="page-container min-h-screen bg-light-bg dark:bg-dark-bg">
      <AuthNavbar />

      <div className="content-wrapper py-8 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, scans, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center cyber-border">
            <HiUsers className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {allUsers.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Users</p>
          </Card>

          <Card className="p-6 text-center cyber-border">
            <HiDocumentText className="w-12 h-12 mx-auto mb-3 text-blue-500" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {allScans.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Scans</p>
          </Card>

          <Card className="p-6 text-center cyber-border">
            <HiClock className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {allScans.filter(s => s.status === 'running').length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Active Scans</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8 p-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users or scans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
        </Card>

        {/* Users Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <HiUsers className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No users found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((u) => (
                <Card key={u._id} className="p-6 cyber-border hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {u.username}
                        </h3>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {u.email}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-white">Scans:</strong>{" "}
                          {u.usedScan} / {u.scanLimit}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-white">Joined: </strong>{" "}
                          {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleViewUser(u)}
                      variant="primary"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <HiEye className="w-5 h-5" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Scans Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <HiDocumentText className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Scans ({filteredScans.length})
            </h2>
          </div>

          {filteredScans.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No scans found</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredScans.map((scan) => (
                <Card key={scan._id} className="p-6 cyber-border hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {scan.targetUrl}
                        </h3>
                        {getStatusIcon(scan.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          <strong className="text-gray-900 dark:text-white">Type:</strong>{" "}
                          {scan.scanType}
                        </span>
                        <span>
                          <strong className="text-gray-900 dark:text-white">Status: </strong>{" "}
                          {scan.status}
                        </span>
                        <span>
                          <strong className="text-gray-900 dark: text-white">User:</strong>{" "}
                          {scan.userId?. username || "Unknown"}
                        </span>
                        <span>
                          <strong className="text-gray-900 dark:text-white">Date:</strong>{" "}
                          {formatDate(scan.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteScan(scan._id)}
                      variant="danger"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <HiTrash className="w-5 h-5" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-3xl font-bold text-gradient mb-2">
                  {selectedUser.username}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Role</p>
                <p className="font-semibold text-primary capitalize">
                  {selectedUser.role}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark: text-gray-400 mb-1">Scan Limit</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser. scanLimit}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scans Used</p>
                <p className="font-semibold text-gray-900 dark: text-white">
                  {selectedUser.usedScan}
                </p>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Joined</p>
                <p className="font-semibold text-sm text-gray-900 dark: text-white">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            {/* Update Scan Limit */}
            <div className="mb-8 p-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Update Scan Limit
              </h3>
              <div className="flex gap-3">
                <Input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                  min={0}
                  className="flex-1"
                  placeholder="Enter new limit"
                />
                <Button
                  onClick={handleUpdateLimit}
                  variant="primary"
                  className="whitespace-nowrap"
                >
                  Update Limit
                </Button>
              </div>
            </div>

            {/* User Scan History */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Scan History ({userScans.length})
              </h3>

              {loadingUserScans ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userScans.length === 0 ? (
                <div className="p-8 text-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">No scans found for this user</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userScans.map((scan) => (
                    <div
                      key={scan._id}
                      className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {scan.targetUrl}
                          </p>
                          {getStatusIcon(scan.status)}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{scan.scanType}</span>
                          <span>{scan.status}</span>
                          <span>{formatDate(scan.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteScan(scan._id)}
                        variant="danger"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <HiTrash className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}