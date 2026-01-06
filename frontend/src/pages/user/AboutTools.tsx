import React from "react";
import "../../styles/about-tools.css";

const toolData = [
  {
    id: "nmap",
    title: "Nmap",
    subtitle: "Find open ports and services",
    badges: ["Ports", "Services", "Network"],
    description:
      "Scans a website or server to find which network ports are open and what services run on them. Good to see what is exposed to the internet.",
    whenToUse:
      "When you want to see which services are reachable from the internet.",
  },
  {
    id: "nikto",
    title: "Nikto",
    subtitle: "Quick web server check",
    badges: ["Web", "Config", "Files"],
    description:
      "Checks a web server for outdated software, common misconfigurations, and dangerous files. Fast way to find basic web issues.",
    whenToUse:
      "When you want a quick baseline check of a website (not deep tests).",
  },
  {
    id: "sqlmap",
    title: "SQLMap",
    subtitle: "Tests for database injection",
    badges: ["Database", "SQLi", "Automated"],
    description:
      "Looks for SQL injection weaknesses that allow attackers to read or change data. Only use on sites you own or have permission to test.",
    whenToUse:
      "When you suspect user input may change or read the database (only with permission).",
  },
  {
    id: "sslscan",
    title: "SSLScan",
    subtitle: "Checks TLS/SSL security",
    badges: ["TLS", "Ciphers", "Protocols"],
    description:
      "Tests the website's TLS/SSL settings to show supported versions and weak ciphers. Helps confirm secure encryption is used.",
    whenToUse:
      "When you want to verify a site uses up-to-date TLS and safe ciphers.",
  },
];

const AboutTools: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div>
          <h1 className="text-gradient">About Security Tools</h1>
          <p className="about-sub">
            Simple explanations of what each scanner does and when to use it.
          </p>
        </div>
      </div>

      <div className="about-grid">
        {toolData.map((tool) => (
          <article
            className="about-card"
            key={tool.id}
            aria-labelledby={tool.id}
            tabIndex={0}
          >
            <header className="about-head">
              <div className="about-icon" aria-hidden>
                {tool.title.charAt(0)}
              </div>
              <div>
                <h3 id={tool.id} className="about-title">
                  {tool.title}
                </h3>
                <p className="about-subtitle">{tool.subtitle}</p>
              </div>
            </header>

            <p className="about-desc">{tool.description}</p>

            <div className="about-badges" aria-hidden>
              {tool.badges.map((b) => (
                <span key={b} className="badge">
                  {b}
                </span>
              ))}
            </div>

            {/* Extra one-line detail shown by default in a subtle box */}
            <div className="about-more">
              <div className="more-title">When to use</div>
              <div className="more-text">{tool.whenToUse}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="legal-note">
        Use these tools only on websites or servers you own or where you have
        explicit permission to test.
      </div>
    </div>
  );
};

export default AboutTools;
