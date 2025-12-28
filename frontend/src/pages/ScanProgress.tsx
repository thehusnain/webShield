import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function ScanProgress() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const fetchScan = useCallback(async () => {
    if (!scanId || scanId === "undefined") {
      console.error("[ScanProgress] Invalid scanId");
      navigate("/dashboard", { replace: true });
      return;
    }

    try {
      console.log("[ScanProgress] Fetching scan:", scanId);
      const response = await scanAPI.getScan(scanId);
      console.log("[ScanProgress] Scan data:", response.scan);

      setScan(response.scan);
      setLoading(false);
      setAuthError(false);

      if (response.scan.status === "completed") {
        console.log("[ScanProgress] Scan completed! ");

        if (!isRedirecting) {
          console.log(
            "[ScanProgress] Setting redirect flag and navigating to results"
          );
          setIsRedirecting(true);

          setTimeout(() => {
            console.log("[ScanProgress] Redirecting to results page");
            navigate(`/scan/${scanId}/results`, { replace: true });
          }, 2000);
        }

        return true;
      }

      if (response.scan.status === "failed") {
        setError("Scan failed");
        return true;
      }

      return false;
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { error?: string } };
        message?: string;
      };
      console.error("[ScanProgress] Error fetching scan:", error);

      if (error.response?.status === 401) {
        console.log(
          "[ScanProgress] Auth error during polling - scan might still be running"
        );
        setAuthError(true);
        return false;
      }

      if (error.response?.status === 404) {
        setError("Scan not found or was deleted");
        setLoading(false);
        return true;
      }

      if (!error.response || error.response.status !== 401) {
        setError(
          error.response?.data?.error || error.message || "Failed to load scan"
        );
        setLoading(false);
      }

      return false;
    }
  }, [scanId, navigate, isRedirecting]);

  // Terminal log simulation
  useEffect(() => {
    if (!scan || scan.status !== "running") return;

    const logs = [
      "[*] Initializing scan engine...",
      "[+] Target acquired:  " + scan.targetUrl,
      "[*] Loading vulnerability database...",
      "[+] Database loaded:  47,832 signatures",
      "[*] Starting reconnaissance phase...",
      "[+] DNS lookup complete",
      "[*] Performing port enumeration...",
      "[+] Detected open services",
      "[*] Analyzing HTTP headers...",
      "[+] Security headers evaluated",
      "[*] Testing for vulnerabilities...",
      "[+] Running exploit modules",
      "[*] Checking SSL/TLS configuration...",
      "[+] Certificate validation complete",
      "[*] Scanning for common vulnerabilities...",
      "[+] CVE database queried",
      "[*] Analyzing response patterns...",
      "[+] Pattern matching in progress",
      "[*] Generating security report...",
      "[+] Finalizing results...",
    ];

    let currentIndex = 0;
    const logInterval = setInterval(() => {
      if (currentIndex < logs.length) {
        setTerminalLogs((prev) => [...prev, logs[currentIndex]]);
        currentIndex++;
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, [scan]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;
    let isActive = true;

    const startPolling = async () => {
      const shouldStop = await fetchScan();
      if (shouldStop || !isActive) return;

      pollInterval = setInterval(async () => {
        if (!isActive) return;
        const shouldStop = await fetchScan();
        if (shouldStop && pollInterval) {
          clearInterval(pollInterval);
        }
      }, 5000);

      progressInterval = setInterval(() => {
        if (!isActive) return;
        setProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + 1;
        });
      }, 1500);
    };

    startPolling();

    return () => {
      isActive = false;
      if (pollInterval) clearInterval(pollInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [fetchScan]);

  useEffect(() => {
    if (scan?.status === "completed") {
      setProgress(100);
      setTerminalLogs((prev) => [...prev, "[✓] Scan completed successfully!"]);
    }
  }, [scan?.status]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this scan?")) {
      return;
    }

    setCancelling(true);
    try {
      await scanAPI.cancelScan(scanId!);
      navigate("/dashboard");
    } catch (error) {
      console.error("[ScanProgress] Cancel error:", error);
      alert("Failed to cancel scan");
      setCancelling(false);
    }
  };

  const getScanTypeInfo = (type: string) => {
    const types: Record<
      string,
      { name: string; icon: string; color: string; gradient: string }
    > = {
      nmap: {
        name: "Nmap",
        icon: "🔍",
        color: "bg-blue-500",
        gradient: "from-blue-500 via-cyan-500 to-blue-600",
      },
      nikto: {
        name: "Nikto",
        icon: "🌐",
        color: "bg-red-500",
        gradient: "from-red-500 via-orange-500 to-red-600",
      },
      ssl: {
        name: "SSL/TLS",
        icon: "🔒",
        color: "bg-green-500",
        gradient: "from-green-500 via-emerald-500 to-green-600",
      },
      sqlmap: {
        name: "SQLMap",
        icon: "💉",
        color: "bg-yellow-500",
        gradient: "from-yellow-500 via-amber-500 to-yellow-600",
      },
    };
    return (
      types[type] || {
        name: type,
        icon: "📋",
        color: "bg-gray-500",
        gradient: "from-gray-500 to-gray-600",
      }
    );
  };

  if (error && !authError) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading scan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="page-container min-h-screen">
        <AuthNavbar />
        <div className="content-wrapper flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Scan Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The scan you're looking for doesn't exist
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isRunning = scan.status === "running" || scan.status === "pending";
  const isCompleted = scan.status === "completed";
  const isFailed = scan.status === "failed";
  const scanTypeInfo = getScanTypeInfo(scan.scanType);

  return (
    <div className="page-container min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-black">
      <AuthNavbar />

      <div className="content-wrapper py-8">
        <Card className="max-w-4xl mx-auto bg-gray-900/50 dark:bg-black/50 border-primary/30 backdrop-blur-sm">
          {authError && isRunning && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg animate-pulse">
              <p className="text-sm text-yellow-400">
                ⚠️ Note: You're logged out but the scan is still running in
                background. Log in again to view progress.
              </p>
            </div>
          )}

          <div className="text-center mb-8">
            {isRunning && (
              <div className="relative inline-block mb-6">
                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-4 border-primary/20 rounded-full animate-ping" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 border-4 border-primary/40 rounded-full animate-pulse" />
                </div>

                {/* Spinning scanner */}
                <div className="relative w-32 h-32 border-8 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">
                  {scanTypeInfo.icon}
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="text-6xl mb-4 animate-bounce">
                <div className="inline-block">✅</div>
              </div>
            )}

            {isFailed && <div className="text-6xl mb-4">❌</div>}

            <h1 className="text-3xl font-bold mb-2 text-white">
              {isRunning && (
                <span className="bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent animate-pulse">
                  Scanning in Progress...
                </span>
              )}
              {isCompleted && "Scan Complete! "}
              {isFailed && "Scan Failed"}
            </h1>

            <p className="text-gray-400">
              <span
                className={`font-semibold ${scanTypeInfo.color} text-white px-3 py-1 rounded-full`}
              >
                {scanTypeInfo.name}
              </span>{" "}
              scan of {scan.targetUrl}
            </p>
          </div>

          {isRunning && (
            <div className="mb-8">
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">
                  Progress
                </span>
                <span className="text-lg font-bold text-primary animate-pulse">
                  {progress}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-primary/30">
                {/* Background grid effect */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 50%, rgba(0,255,0,0.1) 50%)",
                    backgroundSize: "20px 100%",
                    animation: "scroll 1s linear infinite",
                  }}
                />

                {/* Animated gradient bar */}
                <div
                  className={`h-full bg-gradient-to-r ${scanTypeInfo.gradient} rounded-full transition-all duration-500 relative overflow-hidden`}
                  style={{ width: `${progress}%` }}
                >
                  {/* Shine effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                      animation: "shine 2s ease-in-out infinite",
                    }}
                  />

                  {/* Pulse effect */}
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </div>

                {/* Glowing edge */}
                <div
                  className="absolute top-0 h-full w-1 bg-white blur-sm"
                  style={{
                    left: `${progress}%`,
                    boxShadow: "0 0 10px 2px rgba(255,255,255,0.8)",
                  }}
                />
              </div>

              <p className="text-center text-gray-400 mt-4 text-sm animate-pulse">
                ⚡ Scan in progress - Please don't close this page
              </p>

              {/* Terminal-style logs */}
              <div className="mt-6 bg-black/80 rounded-lg p-4 border border-primary/30 max-h-64 overflow-y-auto font-mono text-sm">
                {terminalLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.includes("[+]")
                        ? "text-green-400"
                        : log.includes("[*]")
                        ? "text-cyan-400"
                        : log.includes("[✓]")
                        ? "text-green-500 font-bold"
                        : "text-gray-400"
                    } animate-fadeIn`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {log}
                  </div>
                ))}
                <div className="text-primary animate-pulse inline-block">▋</div>
              </div>

              {/* Status indicator */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">
                    {progress < 30 && "🔍 Initializing scan engine..."}
                    {progress >= 30 &&
                      progress < 60 &&
                      "🛡️ Running security tests..."}
                    {progress >= 60 &&
                      progress < 90 &&
                      "🔬 Analyzing vulnerabilities..."}
                    {progress >= 90 && "📊 Generating report..."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-green-500/10 border border-green-500/50 rounded-lg mb-4">
                <p className="text-lg text-green-400 mb-2 font-bold">
                  ✓ Scan Completed Successfully!
                </p>
                <p className="text-sm text-gray-400">
                  {isRedirecting
                    ? "Redirecting to results.. ."
                    : "Your scan results are ready"}
                </p>
              </div>
              {!isRedirecting && (
                <Button
                  onClick={() => {
                    setIsRedirecting(true);
                    navigate(`/scan/${scanId}/results`);
                  }}
                  className="bg-gradient-to-r from-primary to-green-500 hover:from-primary/80 hover:to-green-500/80"
                >
                  📄 View Results Now
                </Button>
              )}
            </div>
          )}

          {isFailed && (
            <div className="text-center mb-6">
              <div className="inline-block p-6 bg-red-500/10 border border-red-500/50 rounded-lg mb-4">
                <p className="text-lg text-red-400 mb-2 font-bold">
                  ✗ Scan Failed
                </p>
                <p className="text-sm text-gray-400">
                  The scan encountered an error. Please try again.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/scan/start")}>
                  🔄 Start New Scan
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  ← Back to Dashboard
                </Button>
              </div>
            </div>
          )}

          {isRunning && (
            <div className="text-center pt-6 border-t border-gray-700">
              <Button
                variant="danger"
                onClick={handleCancel}
                isLoading={cancelling}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500"
              >
                <span className="text-xl font-bold mr-2">×</span>
                Cancel Scan
              </Button>
            </div>
          )}

          {/* Scan metadata */}
          <div className="mt-8 pt-8 border-t border-gray-700 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-3 rounded">
                <span className="text-gray-500 block mb-1">Scan ID</span>
                <span className="font-mono text-primary">
                  {scan._id.slice(0, 12)}...
                </span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <span className="text-gray-500 block mb-1">Type</span>
                <span className="uppercase font-semibold text-white">
                  {scan.scanType}
                </span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <span className="text-gray-500 block mb-1">Status</span>
                <span
                  className={`font-semibold uppercase ${
                    isCompleted
                      ? "text-green-400"
                      : isRunning
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {scan.status}
                </span>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <span className="text-gray-500 block mb-1">Started</span>
                <span className="text-white">
                  {new Date(scan.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 20px 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
