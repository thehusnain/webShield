import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanWithSsl(targetUrl) {
  try {
    // Extract domain from URL
    const domain = targetUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./, "");

    console.log(`SSL scanning: ${domain}`);

    // Run sslscan with detailed output
    const command = `sslscan --no-colour ${domain}`;
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });

    if (stderr && !stderr.includes("openssl")) {
      console.error("SSLScan stderr:", stderr);
    }

    const issues = [];
    const lines = stdout.split("\n");
    
    // Check for various SSL/TLS issues
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Check for weak/unsafe protocols
      if (trimmed.includes("SSLv") || 
          trimmed.includes("TLSv1.0") || 
          trimmed.includes("TLSv1.1") ||
          trimmed.includes("weak") ||
          trimmed.includes("WEAK") ||
          trimmed.includes("INSECURE")) {
        
        // Clean up the line
        let cleanLine = trimmed
          .replace(/^\s*[├└│─]+\s*/, '') // Remove tree characters
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
          
        if (cleanLine && !issues.includes(cleanLine)) {
          issues.push(cleanLine);
        }
      }
      
      // Check for certificate issues
      if (trimmed.includes("expired") || 
          trimmed.includes("self-signed") ||
          trimmed.includes("Invalid") ||
          trimmed.includes("revoked")) {
        issues.push(`Certificate Issue: ${trimmed}`);
      }
    });

    // Check for strong protocols
    const hasTLS12 = stdout.includes("TLSv1.2");
    const hasTLS13 = stdout.includes("TLSv1.3");
    
    // If no issues found but TLS 1.2/1.3 is supported, that's good
    if (issues.length === 0 && (hasTLS12 || hasTLS13)) {
      issues.push("No security issues detected - Strong encryption supported");
    }

    return {
      tool: "sslscan",
      success: true,
      totalIssues: issues.length,
      issues: issues.slice(0, 10), // Limit issues
      rawOutput: stdout.substring(0, 2000), // Limit size
      domain: domain
    };

  } catch (error) {
    console.error("SSLScan error:", error.message);
    return {
      tool: "sslscan",
      success: false,
      error: "SSL scan failed: " + error.message,
      totalIssues: 0,
      issues: ["Scan failed - Could not check SSL/TLS security"],
      rawOutput: ""
    };
  }
}