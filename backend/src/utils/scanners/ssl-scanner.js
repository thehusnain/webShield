import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanWithSsl(targetUrl) {
  try {
    console.log(`Starting SSL scan for: ${targetUrl}`);

    let domain = targetUrl.replace("https://", "").replace("http://", "");

    const command = `sslscan ${domain}`;
    const { stdout } = await execAsync(command);

    const lines = stdout.split("\n");
    const sslIssues = [];

    for (const line of lines) {
      if (
        line.includes("TLSv1.0") ||
        line.includes("TLSv1.1") ||
        line.includes("Weak") ||
        line.includes("SSLv3")
      ) {
        sslIssues.push(line.trim());
        console.log(`SSL Issue: ${line.trim()}`);
      }

      if (
        line.includes("Subject:") ||
        line.includes("Issuer:") ||
        line.includes("Not After:")
      ) {
        console.log(`${line.trim()}`);
      }
    }

    console.log(`SSL scan completed! Found ${sslIssues.length} issues`);

    return {
      issues: sslIssues,
      totalIssues: sslIssues.length,
    };
  } catch (error) {
    console.log("SSL scan error:", error.message);
    console.log("Also recheck the Url", error.message);
    return {
      issues: [],
      totalIssues: 0,
      error: error.message,
    };
  }
}
