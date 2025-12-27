import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanWithSqlmap(targetUrl) {
  try {
    console.log(`SQLMap scanning: ${targetUrl}`);

    const command = ` timeout 300 sqlmap -u "${targetUrl}" --batch --level=1 --risk=1 --threads=3 --timeout=30 --flush-session  --answers="follow=N"
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    console.log("Running SQLMap command...");

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 5 
    });

    const vulnerabilities = [];
    let vulnerable = false;
    
    const vulnIndicators = [
      'is vulnerable',
      'injection was found',
      'parameter is vulnerable',
      'payload:',
      'Type:',
      'Title:'
    ];

    const lines = stdout.split('\n');
    
    lines.forEach(line => {
      // Check if NOT vulnerable
      if (line.includes('all tested parameters appear to be not injectable')) {
        vulnerable = false;
      }
      
      // Check for heuristic findings
      if (line.includes('heuristic test shows that')) {
        vulnerabilities.push(line.trim());
      }
      
      // Check for vulnerability indicators
      vulnIndicators.forEach(indicator => {
        if (line.includes(indicator) && line.length < 200) {
          const trimmedLine = line.trim();
          if (!vulnerabilities.includes(trimmedLine)) {
            vulnerabilities.push(trimmedLine);
            vulnerable = true;
          }
        }
      });
    });

    console.log(`SQLMap scan completed.  Vulnerable: ${vulnerable}, Findings: ${vulnerabilities.length}`);

    return {
      tool: "sqlmap",
      success: true,
      vulnerable: vulnerable,
      vulnerabilities: vulnerabilities.slice(0, 10), 
      rawOutput: stdout.substring(0, 2000) + (stderr ? "\n\nErrors:\n" + stderr.substring(0, 500) : ""),
      target: targetUrl
    };

  } catch (error) {
    console.error("SQLMap error:", error. message);
    
    // Handle timeout
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        tool: "sqlmap",
        success: false,
        error: "Scan timed out (took too long)",
        vulnerable: false,
        vulnerabilities: ["Scan incomplete - website may be slow or blocking scans"],
        rawOutput: ""
      };
    }
    
    // Handle command not found
    if (error.message.includes('sqlmap:  not found') || error.message.includes('command not found')) {
      return {
        tool: "sqlmap",
        success: false,
        error: "SQLMap is not installed on this server",
        vulnerable: false,
        vulnerabilities: ["Please install sqlmap: sudo apt install sqlmap"],
        rawOutput:  ""
      };
    }
    
    // Generic error
    return {
      tool: "sqlmap",
      success: false,
      error: "SQLMap scan failed: " + error.message,
      vulnerable: false,
      vulnerabilities: [],
      rawOutput: error.stdout || ""
    };
  }
}