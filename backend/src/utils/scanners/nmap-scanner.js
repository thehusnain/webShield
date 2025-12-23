import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanWithNmap(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const host = url.hostname;
    

    const ports = "80,443,22,21,23,25,53,110,143,3389";
    
    console.log(`Scanning ${host} on ports ${ports}`);
    
    const { stdout, stderr } = await execAsync(
      `nmap -sT -sV -p ${ports} --open ${host}`
    );
    
    if (stderr) {
      console.error("Nmap stderr:", stderr);
    }
    
    const openPorts = [];
    const lines = stdout.split("\n");
    
    lines.forEach(line => {
      if (line.match(/^\d+\/tcp\s+open/)) {
        openPorts.push(line.trim());
      }
    });
    
    console.log(`Found ${openPorts.length} open ports:`, openPorts);
    
    return {
      tool: "nmap",
      success: true,
      openPorts,
      rawOutput: stdout.substring(0, 1000) // Limit size
    };

  } catch (error) {
    console.error("Nmap scan error:", error);
    return {
      tool: "nmap",
      success: false,
      error: error.message,
      openPorts: [],
      rawOutput: ""
    };
  }
}