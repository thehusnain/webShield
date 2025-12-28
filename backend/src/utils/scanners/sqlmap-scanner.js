import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function scanWithSqlmap(targetUrl) {
  try {
    console.log(`Starting SQLMap scan for ${targetUrl}`);

    // Clean URL
    let testUrl = targetUrl.trim();
    if (testUrl.endsWith('/')) {
      testUrl = testUrl.slice(0, -1);
    }

    // Add parameter if missing
    if (!testUrl.includes('?')) {
      console.log('No parameters in URL, adding test parameter');
      testUrl = `${testUrl}/?id=1`;
    }

    console.log(`Testing URL: ${testUrl}`);

    // Simplified SQLMap command for medium level
    const command = `timeout 90 sqlmap -u "${testUrl}" --batch --smart --level=1 --risk=1 --threads=2 --no-cast --disable-coloring --answers="follow=N,quit=N"`;

    console.log('Running SQLMap.. .');

    let stdout = '';
    let stderr = '';

    try {
      const result = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 95000, // 95 seconds
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      // Timeout or error
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      console.log('SQLMap completed with timeout or error');
    }

    console.log('SQLMap output length:', stdout.length);

    // Parse results
    let vulnerable = false;
    const vulnerabilities = [];
    const warnings = [];

    const lines = stdout.split('\n');

    // Vulnerability markers
    const vulnMarkers = [
      'parameter . * appears to be . * injectable',
      'parameter .* is .* injectable',
      'payload: ',
      'Type: ',
      'Title:',
      'back-end DBMS:',
    ];

    // Negative markers
    const negativeMarkers = [
      'does not seem to be injectable',
      'not injectable',
      'no injection point',
      'all tested parameters do not appear to be injectable',
      'it is not injectable',
    ];

    // Check each line
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();

      // Check negative markers
      negativeMarkers.forEach(marker => {
        if (lowerLine.includes(marker)) {
          warnings.push(line.trim());
        }
      });

      // Check vulnerability markers
      vulnMarkers.forEach(marker => {
        const regex = new RegExp(marker, 'i');
        if (regex.test(line) && line.trim().length > 10) {
          vulnerabilities.push(line.trim());
          vulnerable = true;
        }
      });
    });

    // Extract backend database
    let dbms = null;
    const dbmsMatch = stdout.match(/back-end DBMS:\s*([^\n]+)/i);
    if (dbmsMatch) {
      dbms = dbmsMatch[1].trim();
    }

    // Extract injection type
    let injectionType = null;
    const typeMatch = stdout.match(/Type:\s*([^\n]+)/i);
    if (typeMatch) {
      injectionType = typeMatch[1].trim();
    }

    // Final decision
    if (warnings.length > 0 && vulnerabilities.length === 0) {
      vulnerable = false;
    }

    console.log(`SQLMap result:  Vulnerable=${vulnerable}, Findings=${vulnerabilities.length}`);

    return {
      tool: 'sqlmap',
      success: true,
      vulnerable: vulnerable,
      vulnerabilities: vulnerable ? vulnerabilities.slice(0, 10) : [],
      warnings: warnings.slice(0, 5),
      details: {
        testedUrl: testUrl,
        dbms: dbms,
        injectionType: injectionType,
        findingsCount: vulnerabilities.length,
      },
      rawOutput: stdout.substring(0, 3000),
      target: testUrl,
      summary: vulnerable
        ? `SQL Injection vulnerability detected!  Database: ${dbms || 'Unknown'}`
        : 'No SQL injection vulnerabilities detected',
    };
  } catch (error) {
    console.error('SQLMap error:', error.message);

    return {
      tool: 'sqlmap',
      success: false,
      error: error.message,
      vulnerable: false,
      vulnerabilities: [],
      warnings: [],
      rawOutput: `Error:  ${error.message}`,
      target: targetUrl,
      summary: 'Scan failed to complete',
    };
  }
}
