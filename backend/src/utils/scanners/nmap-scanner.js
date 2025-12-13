import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function scanWithNmap(targetUrl) {
  try {
    let domain = targetUrl.replace("https://", "").replace("http://", "");
    console.log(`Nmap scanning: ${domain}`);

    // Use better command with common ports
    const command = `nmap -sV -p 21,22,23,25,53,80,443,3306,3389,8080,8443 ${domain}`;
    console.log(`Running: ${command}`);
    
    const { stdout } = await execAsync(command);
    console.log("Nmap raw output:\n", stdout);

    const lines = stdout.split("\n");
    const openPorts = [];

    // IMPROVED PARSING FOR -sV OUTPUT
    for (const line of lines) {
      // Look for lines with port numbers and "open"
      if (line.includes("/tcp") && line.includes("open")) {
        console.log("Parsing line:", line);
        
        // Example line: "80/tcp   open     http"
        const parts = line.trim().split(/\s+/); // Split by multiple spaces
        
        if (parts.length >= 3) {
          const portPart = parts[0]; // "80/tcp"
          const status = parts[1];   // "open"
          let service = parts[2];    // Service name
          
          // Extract port number
          const portNumber = parseInt(portPart.split("/")[0]);
          
          // If service is empty or unknown, try to get from later parts
          if (!service || service === '' || service === 'unknown') {
            // Look for common services in the line
            if (line.toLowerCase().includes('http')) service = 'http';
            else if (line.toLowerCase().includes('ssh')) service = 'ssh';
            else if (line.toLowerCase().includes('ftp')) service = 'ftp';
            else if (line.toLowerCase().includes('mysql')) service = 'mysql';
            else if (line.toLowerCase().includes('ssl')) service = 'https';
            else service = 'unknown';
          }
          
          // Also check for service version info
          let serviceInfo = '';
          if (parts.length > 3) {
            serviceInfo = parts.slice(3).join(' ');
          }
          
          openPorts.push({
            port: portNumber,
            service: service,
            status: status,
            info: serviceInfo || 'No additional info'
          });
          
          console.log(`Found port ${portNumber} - ${service} (${status})`);
        }
      }
    }

    console.log(`Total open ports found: ${openPorts.length}`);
    
    return {
      openPorts: openPorts,
      totalOpenPorts: openPorts.length,
      scanCommand: command
    };
    
  } catch (error) {
    console.log("Nmap scan failed:", error.message);
    // Return empty instead of throwing error
    return {
      openPorts: [],
      totalOpenPorts: 0,
      error: error.message
    };
  }
}