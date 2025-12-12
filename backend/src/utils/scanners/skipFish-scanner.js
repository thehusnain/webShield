import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
const execAsync = promisify(exec);

export async function scanWithSkipfish(targetUrl) {
  try {
    const reportDir = `/tmp/skipfish-${Date.now()}`;
    const command = `skipfish -o ${reportDir} ${targetUrl}`;
    await execAsync(command);

    // READ HTML FILE
    const htmlPath = `${reportDir}/index.html`;
    const htmlContent = fs.readFileSync(htmlPath, "utf8");

    // CLEAN UP TEMP FOLDER
    fs.rmSync(reportDir, { recursive: true, force: true });

    // RETURN HTML FOR DATABASE
    return {
      htmlReport: htmlContent, 
      vulnerabilities: [], 
      message: "Scan completed...",
    };
  } catch (error) {
    console.log("Skipfish error:", error.message);
    return {
      success: false,
      htmlReport: null,
      error: error.message,
    };
  }
}
