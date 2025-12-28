import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ScanHistory() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "running" | "failed"
  >("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await scanAPI.getHistory();
      setScans(response.scans || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter((scan) => {
    if (filter === "all") return true;
    if (filter === "running")
      return scan.status === "running" || scan.status === "pending";
    return scan.status === filter;
  });

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
              Loading history...
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Scan History</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View all your security scan results
            </p>
          </div>
          <Button onClick={() => navigate("/scan/start")} variant="primary">
            <span className="mr-2">➕</span>
            New Scan
          </Button>
        </div>

        {/* Filter Buttons - FIXED */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-primary text-black"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("running")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "running"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark: text-gray-300 hover: bg-gray-300 dark: hover:bg-gray-600"
            }`}
          >
            Running
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "failed"
                ? "bg-red-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark: text-gray-300 hover: bg-gray-300 dark: hover:bg-gray-600"
            }`}
          >
            Failed
          </button>
        </div>

        {/* Scans List */}
        <Card>
          {filteredScans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === "all"
                  ? "You haven't run any scans yet"
                  : `No ${filter} scans found`}
              </p>
              <Button onClick={() => navigate("/scan/start")}>
                Start Your First Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScans.map((scan) => (
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
                  className="p-4 rounded-lg border border-light-border dark:border-dark-border 
                             hover:border-primary transition-colors cursor-pointer 
                             bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {getStatusIcon(scan.status)}
                        </span>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {scan.targetUrl}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span
                          className="uppercase font-medium px-2 py-0.5 
                                       bg-gray-200 dark:bg-gray-700 rounded"
                        >
                          {scan.scanType}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(scan.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span
                        className={`font-semibold uppercase text-sm ${getStatusColor(
                          scan.status
                        )}`}
                      >
                        {scan.status}
                      </span>
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
