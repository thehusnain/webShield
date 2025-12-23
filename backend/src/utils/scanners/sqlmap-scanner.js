import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

export async function scanWithSqlmap(targetUrl) {
  try {
    // Create temp directory for output
    const outputDir = `/tmp/sqlmap-${Date.now()}`;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`SQLMap scanning: ${targetUrl}`);

    // Basic SQLMap command
    const command = `
      timeout 300 sqlmap 
      -u "${targetUrl}" 
      --batch 
      --level=1 
      --risk=1 
      --threads=3 
      --timeout=30 
      --output-dir="${outputDir}"
      --flush-session
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    console.log("Running command:", command.substring(0, 100) + "...");

    const { stdout, stderr } = await execAsync(command);

    // Check output for vulnerabilities
    const vulnerabilities = [];
    let vulnerable = false;
    
    // Common vulnerability indicators
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
      if (line.includes('all tested parameters appear to be not injectable')) {
        vulnerable = false;
      }
      
      if (line.includes('heuristic test shows that')) {
        vulnerabilities.push(line.trim());
      }
      
      vulnIndicators.forEach(indicator => {
        if (line.includes(indicator) && line.length < 200) {
          if (!vulnerabilities.includes(line.trim())) {
            vulnerabilities.push(line.trim());
            vulnerable = true;
          }
        }
      });
    });

    // Clean up temp files
    try {
      fs.rmSync(outputDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }

    return {
      tool: "sqlmap",
      success: true,
      vulnerable: vulnerable,
      vulnerabilities: vulnerabilities.slice(0, 10), // Limit to 10
      rawOutput: stdout.substring(0, 1500) + (stderr ? "\n\nErrors:\n" + stderr.substring(0, 500) : ""),
      target: targetUrl
    };

  } catch (error) {
    console.error("SQLMap error:", error.message);
    
    // Check if it's a timeout (common for SQLMap)
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
    
    return {
      tool: "sqlmap",
      success: false,
      error: "SQLMap scan failed: " + error.message,
      vulnerable: false,
      vulnerabilities: [],
      rawOutput: ""
    };
  }
}