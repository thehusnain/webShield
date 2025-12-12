import PDFDocument from "pdfkit";

// Remove ANSI colors from SSLScan
const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*m/g, "");

export async function generateScanReport(scan) {
  const doc = new PDFDocument({ margin: 50, autoFirstPage: false });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // PAGE 1 — COVER PAGE
    doc.addPage();

    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#1E2A38");

    doc
      .fillColor("white")
      .fontSize(40)
      .text("WebShield Security Report", { align: "center", marginTop: 200 });

    doc.moveDown(2);

    doc
      .fontSize(16)
      .text(`Target URL: ${scan.targetUrl}`, { align: "center" })
      .text(`Scan Date: ${new Date(scan.createdAt).toLocaleString()}`, {
        align: "center",
      });

    // PAGE 2 — SCAN INFORMATION
    doc.addPage();
    sectionTitle(doc, "1. Scan Information");

    addField(doc, "Target URL", scan.targetUrl);
    addField(doc, "Scan Type", scan.scanType || "Full Website Scan");
    addField(doc, "Scan Time", new Date(scan.createdAt).toLocaleString());
    addField(doc, "Status", scan.status);

    doc.moveDown(1);

    // RAW TOOL OUTPUT — ALL 4 TOOLS
    doc.addPage();
    sectionTitle(doc, "2. Raw Tool Output");

    // Clean SSL output
    const cleanSSL = (scan.results?.sslscan || []).map((s) => stripAnsi(s));

    printRaw(doc, "Nmap — Open Ports", scan.results?.nmap?.openPorts);
    printRaw(doc, "Gobuster — Directory Enumeration", scan.results?.gobuster);
    printRaw(doc, "Skipfish — Vulnerability Report", scan.results?.skipfish);
    printRaw(doc, "SSLScan — SSL/TLS Issues", cleanSSL);

    // ANALYSIS
    doc.addPage();
    sectionTitle(doc, "3. Analysis & Explanation");

    const analysis = generateAnalysis(scan, cleanSSL);

    doc.fontSize(14).fillColor("black").text(analysis.summary);
    doc.moveDown();

    doc
      .fontSize(16)
      .fillColor("#1E2A38")
      .text("Detailed Explanation:", { underline: true });

    doc
      .fontSize(13)
      .fillColor("black")
      .text(analysis.details, { align: "left" });

    // RECOMMENDATIONS
    doc.addPage();
    sectionTitle(doc, "4. Recommendations");

    analysis.recommendations.forEach((r, i) => {
      doc
        .fontSize(14)
        .fillColor("black")
        .text(`${i + 1}. ${r}`);
      doc.moveDown(0.5);
    });

    doc.end();
  });
}

// Helper Functions
function sectionTitle(doc, title) {
  doc.fillColor("#1E2A38").fontSize(22).text(title, { underline: true });
  doc.moveDown(1);
}

function addField(doc, label, value) {
  doc.fontSize(14).fillColor("black").text(`${label}: `, { continued: true });

  doc.fillColor("#444").text(value ?? "N/A");
  doc.moveDown(0.4);
}

function printRaw(doc, title, data) {
  doc.fontSize(16).fillColor("#1E2A38").text(title, { underline: true });
  doc.moveDown(0.5);

  if (!data || data.length === 0) {
    doc.fontSize(12).fillColor("#999").text("No data found.\n");
    return;
  }

  doc.fontSize(12).fillColor("black");

  data.forEach((item) => {
    const clean = typeof item === "string" ? item : JSON.stringify(item);
    doc.text(`• ${clean}`);
  });

  doc.moveDown(1);
}
function generateAnalysis(scan, sslIssues) {
  let details = "";
  const recommendations = [];
  const summary =
    "The scan identified key observations regarding the website's security posture. Below is a detailed analysis and actionable recommendations to improve security.";

  // SSL SCAN
  const weak = sslIssues.filter(
    (i) =>
      i.includes("TLSv1.0") ||
      i.includes("TLSv1.1") ||
      i.includes("3DES") ||
      i.includes("weak")
  );

  if (weak.length > 0) {
    details +=
      "⚠ SSLScan detected outdated or weak TLS protocols/ciphers in use. These weaken encryption and can expose sensitive user data.\n\n";

    recommendations.push(
      "Disable outdated TLS versions (TLS 1.0 & TLS 1.1) and weak ciphers such as 3DES.",
      "Enable modern secure protocols only (TLS 1.2 and TLS 1.3).",
      "Use strong cipher suites like ECDHE + AES256-GCM.",
      "Enable HSTS (HTTP Strict Transport Security).",
      "Ensure certificate is valid, not expired, and issued by a trusted CA."
    );
  }

  // NMAP — PORT ANALYSIS
  const openPorts = scan.results?.nmap?.openPorts || [];

  if (openPorts.length > 0) {
    const risky = openPorts.filter((p) =>
      [21, 22, 23, 25, 3306, 3389].includes(p.port)
    );

    if (risky.length > 0) {
      details +=
        "⚠ Nmap detected risky open ports (e.g., SSH, FTP, Database ports). These expand the attack surface.\n\n";

      recommendations.push(
        "Close all unnecessary open ports using a firewall.",
        "Restrict SSH/FTP/Database ports to specific IP addresses only.",
        "Implement fail2ban or intrusion prevention for SSH/FTP services.",
        "Ensure all exposed services are running latest versions with no known vulnerabilities."
      );
    } else {
      details +=
        "✓ Only common web ports appear open. Server exposure is minimal.\n\n";
    }
  }

  // GOBUSTER — DIRECTORIES FOUND
  const dirs = scan.results?.gobuster || [];

  if (dirs.length > 0) {
    const sensitive = dirs.filter((d) =>
      ["/admin", "/backup", "/config", "/db", "/phpmyadmin", "/logs"].some(
        (s) => d.includes(s)
      )
    );

    if (sensitive.length > 0) {
      details +=
        "⚠ Gobuster discovered sensitive directories exposed publicly (admin panels, backups, configs, logs).\n\n";

      recommendations.push(
        "Restrict access to sensitive directories using authentication (Basic Auth, JWT, sessions).",
        "Remove or relocate backup directories outside the web root.",
        "Disable directory listing on the web server (Apache, NGINX, etc.).",
        "Secure admin panels with 2FA and IP whitelisting."
      );
    }
  }

  // SKIPFISH — VULNERABILITIES
  if (scan.results?.skipfish) {
    doc.addPage();
    doc
      .fillColor("#dc2626")
      .fontSize(22)
      .text("Skipfish Vulnerability Scan", { underline: true });

    doc.moveDown(0.5);
    doc
      .fillColor("black")
      .fontSize(14)
      .text("Skipfish scan completed successfully.")
      .text("Detailed HTML report is available for download.")
      .text(
        `Report size: ${scan.results.skipfish.fileSize ? Math.round(scan.results.skipfish.fileSize / 1024) + " KB" : "N/A"}`
      );

    if (scan.results.skipfish.message) {
      doc.text(`Status: ${scan.results.skipfish.message}`);
    }
  }
  const skipfish = scan.results?.skipfish || [];

  if (skipfish.length > 0) {
    const critical = skipfish.filter((s) => {
      const str = typeof s === "string" ? s : JSON.stringify(s);
      return (
        str.toLowerCase().includes("high") ||
        str.toLowerCase().includes("critical") ||
        str.toLowerCase().includes("vulnerability")
      );
    });

    if (critical.length > 0) {
      details +=
        "Skipfish reported high or critical vulnerabilities related to the application layer.\n\n";

      recommendations.push(
        "Address high and critical vulnerabilities immediately.",
        "Validate all input on both client and server side to prevent XSS/SQLi.",
        "Implement strong access control and role-based permissions.",
        "Use prepared statements and ORM to prevent SQL injection.",
        "Sanitize all user-generated content before rendering."
      );
    }
  }

  // GENERAL SECURITY BEST PRACTICES
  recommendations.push(
    "Keep all server software, frameworks, and libraries updated.",
    "Enable rate limiting and IP throttling to reduce brute-force attacks.",
    "Use a Web Application Firewall (WAF) like ModSecurity or Cloudflare.",
    "Regularly back up the website and database to secure offsite storage.",
    "Implement proper logging and monitoring for unauthorized activity.",
    "Conduct regular vulnerability scans and penetration testing.",
    "Ensure strong password policies and enforce 2FA for admin accounts.",
    "Use environment variables for sensitive credentials instead of hardcoding.",
    "Enable CSRF protection tokens for all forms.",
    "Use secure cookies (HttpOnly, Secure, SameSite).",
    "Perform regular log reviews to detect suspicious activity.",
    "Implement least-privilege access for all system accounts."
  );

  // If no details (very rare)
  if (details === "") {
    details =
      "✓ No major threats or misconfigurations detected. The website appears to follow standard security practices.\n\n";
  }

  return { summary, details, recommendations };
}
