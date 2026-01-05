import "../../styles/about-tools.css";

const toolData = [
  {
    id: "nmap",
    title: "Nmap",
    subtitle: "Network discovery & port scanning",
    badges: ["Ports", "Services", "Versions"],
    description:
      "Discovers hosts and services by sending packets and analyzing responses. Great for mapping exposed ports and service versions.",
    tips: [
      "Use -sV to detect service versions.",
      "Use -Pn to skip host discovery if ICMP is blocked.",
      "Keep scans within permissioned scope."
    ],
  },
  {
    id: "nikto",
    title: "Nikto",
    subtitle: "Web server vulnerability scanner",
    badges: ["Web", "Misconfig", "Dangerous files"],
    description:
      "Checks web servers for dangerous files, outdated software, and common misconfigurations. Fast baseline for web endpoints.",
    tips: [
      "Run after identifying the exact host/port.",
      "Pair with HTTPS (set the correct port).",
      "Review false positives—some findings are informational."
    ],
  },
  {
    id: "sqlmap",
    title: "SQLMap",
    subtitle: "SQL injection detection",
    badges: ["DB", "SQLi", "Automation"],
    description:
      "Automates detection and exploitation of SQL injection flaws. Supports multiple DB engines and tamper scripts.",
    tips: [
      "Start with low risk/level to reduce impact.",
      "Use --batch cautiously; review prompts in manual mode.",
      "Only test targets you own or are authorized to assess."
    ],
  },
  {
    id: "sslscan",
    title: "SSLScan",
    subtitle: "SSL/TLS checker",
    badges: ["TLS", "Ciphers", "Protocols"],
    description:
      "Tests SSL/TLS endpoints to report supported cipher suites, protocol versions, and common weaknesses.",
    tips: [
      "Look for weak ciphers/protocols (SSLv2/3, old TLS).",
      "Prefer modern suites (TLS 1.2/1.3, strong ciphers).",
      "Re-run after server config changes to verify fixes."
    ],
  },
];

const AboutTools = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div>
          <h1 className="text-gradient">About Security Tools</h1>
          <p className="about-sub">
            What each scanner does, when to use it, and quick best-practice tips.
          </p>
        </div>
      </div>

      <div className="about-grid">
        {toolData.map((tool) => (
          <div className="about-card" key={tool.id}>
            <div className="about-head">
              <div className="about-icon">{tool.title.charAt(0)}</div>
              <div>
                <h3>{tool.title}</h3>
                <p className="about-subtitle">{tool.subtitle}</p>
              </div>
            </div>

            <p className="about-desc">{tool.description}</p>

            <div className="about-badges">
              {tool.badges.map((b) => (
                <span key={b}>{b}</span>
              ))}
            </div>

            <div className="about-tips">
              <div className="tips-title">Tips</div>
              <ul>
                {tool.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="legal-note">
        ✅ Use these tools only on systems you own or have explicit permission to test.
      </div>
    </div>
  );
};

export default AboutTools;