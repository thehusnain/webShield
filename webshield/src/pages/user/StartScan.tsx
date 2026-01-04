/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/user/StartScan.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { startScan } from "../../api/scan-api";
import "../../styles/scan.css";

const StartScan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [url, setUrl] = useState("");
  const [tool, setTool] = useState("nmap");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Tool descriptions for UI
  const tools = [
    { 
      id: "nmap", 
      name: "Nmap", 
      desc: "Network discovery & port scanning",
      icon: "🔍",
      color: "#00d4ff"
    },
    { 
      id: "nikto", 
      name: "Nikto", 
      desc: "Web server vulnerability scanner",
      icon: "🛡️",
      color: "#ff6b6b"
    },
    { 
      id: "sqlmap", 
      name: "SQLMap", 
      desc: "SQL injection detection",
      icon: "💉",
      color: "#ffd54f"
    },
    { 
      id: "sslscan", 
      name: "SSLScan", 
      desc: "SSL/TLS configuration checker",
      icon: "🔒",
      color: "#69f0ae"
    }
  ];

  // Validate URL format
  const isValidUrl = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Check if user has scan credits
    if (user && user.usedScan >= user.scanLimit) {
      setError(`Scan limit reached. You've used ${user.usedScan} of ${user.scanLimit} scans.`);
      return;
    }

    // 2. Validate URL format
    if (!url.trim()) {
      setError("Please enter a target URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    // 3. Start the scan
    try {
      setLoading(true);
      
      // Prepare data for backend
      const scanData = {
        url: url.trim(),
        tool: tool // nmap, nikto, sqlmap, or sslscan
      };

      console.log("Starting scan with data:", scanData);
      
      // Call backend API
      const response = await startScan(scanData);
      
      console.log("Backend response:", response.data);
      
      if (response.data.success) {
        // Success! Redirect to scan progress page
        const scanId = response.data.scanId || response.data.scan?._id;
        
        if (scanId) {
          navigate(`/scan-progress/${scanId}`);
        } else {
          setError("Scan started but no scan ID returned. Please check scan history.");
        }
      } else {
        // Backend returned error
        setError(response.data.error || "Failed to start scan");
      }
    } catch (error: any) {
      console.error("Scan start error:", error);
      
      // Handle specific error cases
      const errorMsg = error?.response?.data?.error;
      
      if (errorMsg?.toLowerCase().includes("already scanning") || 
          errorMsg?.toLowerCase().includes("scan in progress")) {
        setError("You already have a scan in progress. Please wait for it to complete.");
      } 
      else if (errorMsg?.toLowerCase().includes("limit") || 
               errorMsg?.toLowerCase().includes("exceeded")) {
        setError("Scan limit reached. Please try again later.");
      }
      else if (errorMsg?.toLowerCase().includes("invalid url") || 
               errorMsg?.toLowerCase().includes("invalid target")) {
        setError("Invalid target URL. Please check the format.");
      }
      else if (errorMsg?.toLowerCase().includes("timeout") || 
               errorMsg?.toLowerCase().includes("unreachable")) {
        setError("Target is unreachable. Please check the URL and try again.");
      }
      else if (error?.message?.includes("Network Error")) {
        setError("Network error. Please check your connection and try again.");
      }
      else {
        setError(errorMsg || "Failed to start scan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate scan usage percentage
  const scanUsagePercent = user ? Math.round((user.usedScan / user.scanLimit) * 100) : 0;

  return (
    <div className="scan-container">
      <div className="scan-card">
        {/* Header */}
        <div className="scan-header">
          <h2 className="text-gradient">Start Vulnerability Scan</h2>
          <p className="scan-subtitle">
            Scan websites for security vulnerabilities using professional tools
          </p>
          
          {/* Scan usage indicator */}
          {user && (
            <div className="scan-usage">
              <div className="usage-label">
                Your Scan Usage: <span>{user.usedScan}/{user.scanLimit}</span>
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill" 
                  style={{ 
                    width: `${scanUsagePercent}%`,
                    background: scanUsagePercent >= 90 ? '#ff6b6b' : 
                               scanUsagePercent >= 70 ? '#ffd54f' : '#00d4ff'
                  }}
                ></div>
              </div>
              <div className="usage-percent">{scanUsagePercent}% used</div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="scan-error">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
          </div>
        )}

        {/* Scan Form */}
        <form className="scan-form" onSubmit={handleSubmit}>
          {/* Target URL Input */}
          <div className="form-group">
            <label className="form-label">
              Target Website URL
              <span className="tooltip" data-tooltip="Enter the full URL of the website you want to scan">
                ℹ️
              </span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">🌐</span>
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="scan-input"
                disabled={loading}
              />
            </div>
            <div className="input-hint">
              Enter full URL with protocol (http:// or https://)
            </div>
          </div>

          {/* Tool Selection */}
          <div className="form-group">
            <label className="form-label">Select Security Tool</label>
            <p className="form-description">
              Choose the appropriate tool for your security testing needs
            </p>
            
            <div className="tools-grid">
              {tools.map((t) => (
                <div 
                  key={t.id}
                  className={`tool-card ${tool === t.id ? "selected" : ""}`}
                  onClick={() => !loading && setTool(t.id)}
                  style={{ 
                    borderColor: tool === t.id ? t.color : 'rgba(0, 212, 255, 0.2)',
                    background: tool === t.id ? `${t.color}15` : 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div 
                    className="tool-icon"
                    style={{ color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div className="tool-content">
                    <div className="tool-header">
                      <h4>{t.name}</h4>
                      {tool === t.id && (
                        <span className="selected-badge">Selected</span>
                      )}
                    </div>
                    <p className="tool-desc">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tool-specific Information */}
          <div className="tool-info">
            <h4>
              <span className="info-icon">ℹ️</span>
              About {tools.find(t => t.id === tool)?.name}
            </h4>
            <p>
              {tool === 'nmap' && "Nmap (Network Mapper) discovers hosts and services on a computer network by sending packets and analyzing responses."}
              {tool === 'nikto' && "Nikto scans web servers for dangerous files, outdated server software, and other vulnerabilities."}
              {tool === 'sqlmap' && "SQLMap automates detecting and exploiting SQL injection flaws and taking over database servers."}
              {tool === 'sslscan' && "SSLScan tests SSL/TLS enabled services to discover supported cipher suites and vulnerabilities."}
            </p>
            <div className="info-tip">
              ⏱️ Estimated scan time: {tool === 'nmap' ? '2-3 minutes' : 
                                       tool === 'nikto' ? '3-5 minutes' : 
                                       tool === 'sqlmap' ? '4-6 minutes' : '1-2 minutes'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              ← Back to Dashboard
            </button>
            
            <button 
              type="submit" 
              className="scan-button"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Initializing Scan...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Start Security Scan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Important Notes Section */}
        <div className="important-notes">
          <h4 className="notes-title">
            <span className="notes-icon">📋</span>
            Important Legal & Ethical Notes
          </h4>
          <div className="notes-content">
            <div className="note-item">
              <span className="note-icon">✅</span>
              <span>Only scan websites you own or have explicit permission to test</span>
            </div>
            <div className="note-item">
              <span className="note-icon">✅</span>
              <span>This tool is for educational and authorized security testing only</span>
            </div>
            <div className="note-item">
              <span className="note-icon">✅</span>
              <span>Scans may be logged by target servers and your ISP</span>
            </div>
            <div className="note-item">
              <span className="note-icon">✅</span>
              <span>Respect rate limits and avoid aggressive scanning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScan;