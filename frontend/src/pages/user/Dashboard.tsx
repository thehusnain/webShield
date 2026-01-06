/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getScanHistory } from "../../api/scan-api";
import "../../styles/dashboard.css";

interface Scan {
  _id: string;
  targetUrl?: string;
  url?: string;
  scanType?: string;
  tool?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  results?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getScanHistory();
        const arr = res.data?.scans || res.data?.history || [];
        setScans(Array.isArray(arr) ? arr : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const total = scans.length;
    const completed = scans.filter((s) => s.status === "completed").length;
    const pending = scans.filter(
      (s) => s.status === "pending" || s.status === "running"
    ).length;
    const vulnerabilities = scans.reduce((sum, s) => {
      const vulns = (s.results?.vulnerabilities ||
        s.results?.vulns ||
        []) as any[];
      return sum + (Array.isArray(vulns) ? vulns.length : 0);
    }, 0);
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    return { completed, pending, vulnerabilities, successRate };
  }, [scans]);

  const recent = useMemo(() => {
    return [...scans]
      .sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      )
      .slice(0, 5);
  }, [scans]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <div className="nav-strip">
        <span>WebShield • Secure. Scan. Repeat.</span>
        <div className="nav-right">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/start-scan")}>Start Scan</button>
          <button onClick={() => navigate("/scan-history")}>History</button>
          <button onClick={() => navigate("/about-tools")}>Tools Info</button>
        </div>
      </div>

      <div className="top-bar">
        <div className="top-left">
          <div className="logo-circle">
  <img src="/logo.gif" alt="WebShield Logo" className="logo-animated" />
</div>

          <div>
            <h2 className="text-color">WebShield Dashboard</h2>
            <p className="welcome-text">Ready to secure some websites?</p>
          </div>
        </div>
        <div className="top-right">
          <button
            className="pill-btn ghost"
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </button>
          <button className="pill-btn danger" onClick={handleLogout}>
            🔓 Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="banner-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="quick-row">
        <button className="quick-card" onClick={() => navigate("/start-scan")}>
          <div className="quick-icon">🚀</div>
          <div className="quick-text">
            <div className="quick-title">Start Scan</div>
            <div className="quick-sub">Launch a new security scan</div>
          </div>
        </button>
        <button
          className="quick-card"
          onClick={() => navigate("/scan-history")}
        >
          <div className="quick-icon">📋</div>
          <div className="quick-text">
            <div className="quick-title">Scan History</div>
            <div className="quick-sub">Review past scans</div>
          </div>
        </button>
        <button className="quick-card" onClick={() => navigate("/about-tools")}>
          <div className="quick-icon">ℹ️</div>
          <div className="quick-text">
            <div className="quick-title">Learn Tools</div>
            <div className="quick-sub">Know what each tool does</div>
          </div>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{loading ? "…" : metrics.completed}</div>
          <div className="stat-label">Scans Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{loading ? "…" : metrics.pending}</div>
          <div className="stat-label">Pending / Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">
            {loading ? "…" : metrics.vulnerabilities}
          </div>
          <div className="stat-label">Vulnerabilities Found</div>
        </div>
      </div>

      <h3 className="section-title">Available Security Tools</h3>
      <div className="tools-grid legacy-look">
        {[
          {
            icon: "N",
            name: "Nmap",
            desc: "Network discovery & port scanning",
          },
          {
            icon: "N",
            name: "Nikto",
            desc: "Web server vulnerability scanner",
          },
          { icon: "S", name: "SQLMap", desc: "SQL injection detection" },
          { icon: "S", name: "SSLScan", desc: "SSL/TLS checker" },
        ].map((t) => (
          <div className="tool-card legacy" key={t.name}>
            <div className="tool-header">
              <div className="tool-icon legacy">{t.icon}</div>
              <h3 className="tool-title legacy">{t.name}</h3>
            </div>
            <p className="tool-description legacy">{t.desc}</p>
            <button
              className="tool-button legacy"
              onClick={() => navigate("/start-scan")}
            >
              Use {t.name} Scanner
            </button>
          </div>
        ))}
      </div>

      <div className="recent-scans">
        <h3>Recent Scans</h3>
        {recent.length === 0 && <p className="muted">No scans yet.</p>}
        {recent.map((s) => (
          <div className="scan-item" key={s._id}>
            <div>
              <strong>{s.targetUrl ?? s.url ?? "Unknown target"}</strong>
              <p
                style={{
                  color: "#88ccff",
                  fontSize: "0.9rem",
                  marginTop: "5px",
                }}
              >
                {(s.scanType ?? s.tool ?? "").toUpperCase() || "—"} •{" "}
                {s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div className={`scan-status status-${s.status}`}>
              {s.status === "running" ? "In Progress" : s.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
