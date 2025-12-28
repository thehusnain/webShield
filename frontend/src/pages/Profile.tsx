import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { scanAPI } from "../services/api";
import AuthNavbar from "../components/layout/AuthNavbar";
import Card from "../components/common/Card";
import { HiUser, HiMail, HiShieldCheck, HiDocumentText } from "react-icons/hi";

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    completedScans: 0,
    recentScans: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await scanAPI.getHistory();
      const scans = response.scans || [];
      setStats({
        totalScans: scans.length,
        completedScans: scans.filter((s: any) => s.status === "completed")
          .length,
        recentScans: scans.slice(0, 3),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <h1 className="text-4xl font-bold mb-8">
          <span className="text-gradient">Profile</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 cyber-glow">
                  <span className="text-4xl font-bold text-black">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">{user?.username}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {user?.email}
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <HiUser className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Username
                      </p>
                      <p className="font-semibold">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-light-bg dark: bg-dark-bg rounded-lg">
                    <HiMail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-600 dark: text-gray-400">
                        Email
                      </p>
                      <p className="font-semibold truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <span className="text-4xl">🛡️</span>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Role
                      </p>
                      <p className="font-semibold capitalize">
                        {user?.role || "User"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <HiDocumentText className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Scans
                    </p>
                    <p className="text-3xl font-bold">{stats.totalScans}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-500">
                      {stats.completedScans}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Activity</h2>
                <Link
                  to="/history"
                  className="text-primary hover:text-primary-dark font-semibold text-sm"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading...{" "}
                  </p>
                </div>
              ) : stats.recentScans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No recent scans
                  </p>
                  <Link to="/scan/start">
                    <button className="btn-primary">Start First Scan</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentScans.map((scan: any) => (
                    <Link
                      key={scan._id}
                      to={
                        scan.status === "completed"
                          ? `/scan/${scan._id}/results`
                          : `/scan/${scan._id}`
                      }
                    >
                      <div className="p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium truncate">
                              {scan.targetUrl}
                            </p>
                            <p className="text-sm text-gray-600 dark: text-gray-400">
                              {scan.scanType.toUpperCase()} •{" "}
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-semibold uppercase ${
                              scan.status === "completed"
                                ? "text-green-500"
                                : scan.status === "running"
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            {scan.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
