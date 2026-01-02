import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleStartScan = () => {
    navigate("/start-scan");
  };

  const handleViewHistory = () => {
    navigate("/scan-history");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h2 className="text-gradient">WebShield Dashboard</h2>
          <p className="welcome-text">Welcome back! Ready to secure some websites?</p>
        </div>
        <div className="header-right">
          <button className="header-button" onClick={handleProfile}>
            👤 Profile
          </button>
          <button className="header-button secondary" onClick={handleLogout}>
            🔓 Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">5</div>
          <div className="stat-label">Scans Completed</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">15</div>
          <div className="stat-label">Vulnerabilities Found</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Pending Scans</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">95%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      {/* Tools Section */}
      <h3>Available Security Tools</h3>
      <div className="tools-grid">
        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-icon">N</div>
            <h3 className="tool-title">Nmap</h3>
          </div>
          <p className="tool-description">
            Network discovery and security auditing tool. Discovers hosts and services 
            on a computer network by sending packets and analyzing the responses.
          </p>
          <button className="tool-button" onClick={handleStartScan}>
            Use Nmap Scanner
          </button>
        </div>

        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-icon">N</div>
            <h3 className="tool-title">Nikto</h3>
          </div>
          <p className="tool-description">
            Web server scanner which performs comprehensive tests against web servers 
            for multiple items, including dangerous files, outdated server software.
          </p>
          <button className="tool-button" onClick={handleStartScan}>
            Use Nikto Scanner
          </button>
        </div>

        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-icon">S</div>
            <h3 className="tool-title">SQLMap</h3>
          </div>
          <p className="tool-description">
            Open source penetration testing tool that automates the process of detecting 
            and exploiting SQL injection flaws and taking over database servers.
          </p>
          <button className="tool-button" onClick={handleStartScan}>
            Use SQLMap Scanner
          </button>
        </div>

        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-icon">S</div>
            <h3 className="tool-title">SSLScan</h3>
          </div>
          <p className="tool-description">
            Tests SSL/TLS enabled services to discover supported cipher suites and 
            vulnerabilities like weak ciphers and SSL version issues.
          </p>
          <button className="tool-button" onClick={handleStartScan}>
            Use SSLScan Scanner
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <a className="action-button" onClick={handleStartScan}>
            <div className="action-icon">🚀</div>
            <div className="action-text">Start New Scan</div>
          </a>
          
          <a className="action-button" onClick={handleViewHistory}>
            <div className="action-icon">📋</div>
            <div className="action-text">View Scan History</div>
          </a>
          
          <a className="action-button" onClick={handleProfile}>
            <div className="action-icon">👤</div>
            <div className="action-text">Manage Profile</div>
          </a>
          
          <a className="action-button" onClick={() => navigate("/about-tools")}>
            <div className="action-icon">ℹ️</div>
            <div className="action-text">Learn About Tools</div>
          </a>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="recent-scans">
        <h3>Recent Scans</h3>
        <div className="scan-item">
          <div>
            <strong>example.com</strong>
            <p style={{color: '#88ccff', fontSize: '0.9rem', marginTop: '5px'}}>
              Nmap Scan • 2 hours ago
            </p>
          </div>
          <div className="scan-status status-completed">Completed</div>
        </div>
        
        <div className="scan-item">
          <div>
            <strong>testserver.local</strong>
            <p style={{color: '#88ccff', fontSize: '0.9rem', marginTop: '5px'}}>
              Nikto Scan • 1 day ago
            </p>
          </div>
          <div className="scan-status status-pending">In Progress</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;