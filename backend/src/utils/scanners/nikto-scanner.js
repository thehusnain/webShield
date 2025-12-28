import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanWithNikto(targetUrl) {
  try {
    console.log('Starting Nikto Scan for:  ', targetUrl);

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

    console.log('start scanning nikto for', hostname);

    // Nikto command
    const command = `timeout 180 nikto -h ${hostname} -Plugins outdated,dirs`;

    console.log('Running Nikto command:', command);

    // Execute Nikto scan
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, 
    });

    console.log('Nikto scan completed.  Output length:', stdout.length);

    // Parse Nikto output
    const findings = [];
    const lines = stdout.split('\n');

    lines.forEach(line => {
      // Look for vulnerability indicators
      if (
        line.includes('+') &&
        !line.includes('Nikto v') &&
        !line.includes('Target IP: ') &&
        !line.includes('Target Hostname:') &&
        !line.includes('Target Port:') &&
        !line.includes('Start Time:') &&
        !line.includes('Server:') &&
        line.length > 10 &&
        line.length < 500
      ) {
        const cleanedLine = line.trim();
        if (cleanedLine && !findings.includes(cleanedLine)) {
          findings.push(cleanedLine);
        }
      }
    });

    console.log(`Nikto scan found ${findings.length} findings`);

    return {
      tool: 'nikto',
      success: true,
      totalFindings: findings.length,
      findings: findings.slice(0, 50), 
      rawOutput: stdout.substring(0, 5000), 
      target: hostname,
    };
  } catch (error) {
    console.error('Nikto scan error:', error.message);

    // Check if error is due to command timeout
    if (error.killed) {
      return {
        tool: 'nikto',
        success: false,
        error: 'Scan timed out after 3 minutes',
        totalFindings: 0,
        findings: [],
        rawOutput: error.stdout || 'Scan timed out',
        target: targetUrl,
      };
    }

    return {
      tool: 'nikto',
      success: false,
      error: error.message,
      totalFindings: 0,
      findings: [],
      rawOutput: error.stdout || error.stderr || 'No output',
      target: targetUrl,
    };
  }
}
