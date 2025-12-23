import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec); 

export async function scanWithNikto(targetUrl) {
  try {
    const timestamp = Date.now();
    const txtFile = `/tmp/nikto-${timestamp}.txt`;
    const outputFile = `/tmp/nikto-output-${timestamp}.txt`;

    // Use simpler command with timeout
    const command = `timeout 180 nikto -h ${targetUrl} -Format txt -output ${outputFile}`;

    await execAsync(command);

    let output = "";
    if (fs.existsSync(outputFile)) {
      output = fs.readFileSync(outputFile, "utf8");
    } else {
      throw new Error("Nikto output file not created");
    }

    const lines = output.split("\n");
    const findings = [];
    let totalFindings = 0;

    lines.forEach(line => {
      if (line.includes("+") && !line.includes("Start time")) {
        findings.push(line.trim().replace(/^\+\s*/, ""));
        totalFindings++;
      }
      
      // Also look for "OSVDB" entries which are vulnerability IDs
      if (line.includes("OSVDB-")) {
        findings.push(line.trim());
      }
    });

    // Clean up findings
    const cleanedFindings = findings
      .filter(f => f.length > 10) // Remove very short lines
      .slice(0, 15); // Limit to 15 findings

    return {
      tool: "nikto",
      success: true,
      totalFindings: totalFindings || cleanedFindings.length,
      findings: cleanedFindings,
      rawOutput: output.substring(0, 1500) // Limit size
    };

  } catch (error) {
    console.error("Nikto scan error:", error.message);
    return {
      tool: "nikto",
      success: false,
      error: "Nikto scan failed: " + error.message,
      totalFindings: 0,
      findings: [],
      rawOutput: ""
    };
  }
}