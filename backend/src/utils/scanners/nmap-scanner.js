import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanWithNmap(targetUrl) {
  try {
    console.log('Starting Nmap scan for:', targetUrl);

    // Extract hostname from URL
    let hostname = targetUrl;
    try {
      const urlObj = new URL(targetUrl);
      hostname = urlObj.hostname;
      console.log('Extracted hostname:', hostname);
    } catch (err) {
      // If URL parsing fails, assume it's already a hostname
      console.log('Using original target as hostname:', hostname);
    }

    //  Nmap command - scan common ports quickly
    const command = `timeout 120 nmap -Pn -T4 --top-ports 100 ${hostname}`;

    console.log('Running Nmap command:', command);

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10,
    });

    console.log('Nmap scan completed');

    // Parse open ports from output
    const openPorts = [];
    const lines = stdout.split('\n');

    lines.forEach(line => {
      // Look for lines with port information:  "80/tcp   open  http"
      if (line.match(/^\d+\/tcp\s+open/)) {
        openPorts.push(line.trim());
      }
    });

    console.log(`Nmap found ${openPorts.length} open ports`);

    return {
      tool: 'nmap',
      success: true,
      openPorts: openPorts,
      totalPorts: openPorts.length,
      rawOutput: stdout.substring(0, 5000),
      target: hostname,
    };
  } catch (error) {
    console.error('Nmap scan error:', error.message);

    return {
      tool: 'nmap',
      success: false,
      error: error.message,
      openPorts: [],
      totalPorts: 0,
      rawOutput: error.stdout || error.stderr || 'No output',
      target: targetUrl,
    };
  }
}
