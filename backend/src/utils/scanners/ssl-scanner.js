import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanWithSsl(targetUrl) {
  try {
    const domain = targetUrl
      .replace(/^http?:\/\//, '')
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');

    console.log(`SSL scanning: ${domain}`);

    const command = `sslscan --no-colour ${domain}`;
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });

    if (stderr && !stderr.includes('openssl')) {
      console.error('SSLScan stderr:', stderr);
    }

    const issues = [];
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();

      if (
        trimmed.includes('SSLv') ||
        trimmed.includes('TLSv1.0') ||
        trimmed.includes('TLSv1.1') ||
        trimmed.includes('weak') ||
        trimmed.includes('WEAK') ||
        trimmed.includes('INSECURE')
      ) {
        let cleanLine = trimmed
          .replace(/^\s*[├└│─]+\s*/, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanLine && !issues.includes(cleanLine)) {
          issues.push(cleanLine);
        }
      }
      if (
        trimmed.includes('expired') ||
        trimmed.includes('self-signed') ||
        trimmed.includes('Invalid') ||
        trimmed.includes('revoked')
      ) {
        issues.push(`Certificate Issue: ${trimmed}`);
      }
    });

    const hasTLS12 = stdout.includes('TLSv1.2');
    const hasTLS13 = stdout.includes('TLSv1.3');
    if (issues.length === 0 && (hasTLS12 || hasTLS13)) {
      issues.push('No security issues detected');
    }

    return {
      tool: 'sslscan',
      success: true,
      totalIssues: issues.length,
      issues: issues.slice(0, 10),
      rawOutput: stdout.substring(0, 2000),
      domain: domain,
    };
  } catch (error) {
    console.error('SSL scan error:', error.message);

    // error message for connection failures
    if (
      error.message.includes('Connection refused') ||
      error.message.includes('timed out') ||
      error.message.includes('Timed out') ||
      error.message.includes('ECONNREFUSED')
    ) {
      return {
        tool: 'ssl',
        success: false,
        error: 'Cannot connect to SSL/TLS port',
        totalIssues: 1,
        criticalIssues: 1,
        warnings: 0,
        passed: 0,
        issues: [
          ' SSL/TLS Not Available',
          `ℹ The website ${targetUrl} does not support HTTPS on port 443`,
          'ℹ This is a HTTP-only website (no encryption)',
          'Recommendation: Enable HTTPS for secure communication',
        ],
        certificateInfo: {
          error: 'No SSL/TLS certificate found',
        },
        rawOutput: `Connection failed: Cannot connect to port 443\nThe target does not support HTTPS.`,
        target: targetUrl,
        summary: 'Website does not support HTTPS',
      };
    }

    // Other errors
    return {
      tool: 'ssl',
      success: false,
      error: error.message,
      totalIssues: 1,
      criticalIssues: 1,
      warnings: 0,
      passed: 0,
      issues: [` Scan error: ${error.message}`],
      certificateInfo: {},
      rawOutput: error.stdout || error.stderr || `Error: ${error.message}`,
      target: targetUrl,
      summary: 'SSL/TLS scan failed',
    };
  }
}
