import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { scanAPI } from "../services/api";
import AuthNavbar from "../components/layout/AuthNavbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

interface Scan {
  _id: string;
  targetUrl: string;
  scanType: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ If admin, redirect to admin dashboard
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    // ✅ Regular user - fetch their scans
    fetchRecentScans();
  }, [user, navigate]);

  const fetchRecentScans = async () => {
    try {
      const response = await scanAPI.getHistory();
      setRecentScans(response.scans?.slice(0, 5) || []);
    } catch (error) {
      console.error("Failed to fetch scans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "running":
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "running":
      case "pending":
        return "⏳";
      case "failed":
        return "❌";
      default:
        return "⏸️";
    }
  };

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">
              Welcome back, {user?.username}!{" "}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your security scans and view recent results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scans Used
                </p>
                <p className="text-3xl font-bold">
                  {user?.scansUsed || 0}/{user?.scanLimit || 10}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-3xl font-bold">
                  {recentScans.filter((s) => s.status === "completed").length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Running
                </p>
                <p className="text-3xl font-bold text-yellow-500">
                  {
                    recentScans.filter(
                      (s) => s.status === "running" || s.status === "pending"
                    ).length
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/scan/start")}
              className="p-6 text-left rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-lg mb-2">Start New Scan</h3>
              <p className="text-sm text-gray-600 dark: text-gray-400">
                Begin a new security scan
              </p>
            </button>

            <button
              onClick={() => navigate("/history")}
              className="p-6 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-bold text-lg mb-2">View History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See all your past scans
              </p>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="p-6 text-left rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors"
            >
              <div className="text-4xl mb-3">👤</div>
              <h3 className="font-bold text-lg mb-2">Profile</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account
              </p>
            </button>
          </div>
        </Card>

        {/* Recent Scans */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Scans</h2>
            <Button onClick={() => navigate("/history")} variant="secondary">
              View All
            </Button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't run any scans yet
              </p>
              <Button onClick={() => navigate("/scan/start")}>
                Start Your First Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan._id}
                  onClick={() => {
                    if (scan.status === "completed") {
                      navigate(`/scan/${scan._id}/results`);
                    } else if (
                      scan.status === "running" ||
                      scan.status === "pending"
                    ) {
                      navigate(`/scan/${scan._id}`);
                    }
                  }}
                  className="p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {getStatusIcon(scan.status)}
                        </span>
                        <p className="font-semibold">{scan.targetUrl}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="uppercase font-medium">
                          {scan.scanType}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span
                          className={`font-semibold uppercase ${getStatusColor(
                            scan.status
                          )}`}
                        >
                          {scan.status}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary">
                      View →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Scan Limit Warning */}
        {user && user.scansUsed >= user.scanLimit * 0.8 && (
          <Card className="mt-6 bg-yellow-500/10 border-yellow-500/50">
            <div className="flex items-start gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  Scan Limit Warning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You've used {user.scansUsed} out of {user.scanLimit} scans.
                  Contact admin to increase your limit.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
