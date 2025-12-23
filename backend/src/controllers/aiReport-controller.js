import { aiReport } from "../utils/aiReport.js";
import { generateTxtReport } from "../utils/reportFile-generator.js";

// GENERATING REPORT WITH GROQ AI 
export const generateAIReportForScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: "Scan not found" });

    if (scan.reportFile) {
      return res.json({
        message: "Report already generated",
        download: scan.reportFile
      });
    }

    const summaryText = buildSummaryText(scan);
    const aiText = await aiReport(summaryText);

    const filePath = generateTxtReport(scan, aiText);

    scan.reportFile = filePath;
    await scan.save();

    res.json({
      message: "Report generated successfully",
      download: filePath
    });

  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

function buildSummaryText(scan) {
  let text = `
Target URL: ${scan.targetUrl}
Scan Tool: ${scan.scanType}
Scan Time: ${scan.createdAt}

SCAN RESULTS:
=============
`;

//  NIKTO DONE
if (scan.scanType === "nikto") {
  text += `
[WEB SERVER VULNERABILITY SCAN]
Tool Used: Nikto
Purpose: Checks for common web server security issues

ACTUAL SCAN DATA:
-----------------
`;
  
  if (scan.results?.nikto?.totalFindings > 0) {
    text += `Total Findings: ${scan.results.nikto.totalFindings} issues detected\n\n`;
    
    if (scan.results.nikto.findings?.length > 0) {
      text += `SAMPLE FINDINGS (${Math.min(5, scan.results.nikto.findings.length)} of ${scan.results.nikto.totalFindings}):\n`;
      scan.results.nikto.findings.slice(0, 5).forEach((finding, index) => {
        text += `${index + 1}. ${finding}\n`;
      });
    }
    
    text += `\nScan completed: ${scan.results.nikto.success ? 'Successfully' : 'With errors'}\n`;
  } else {
    text += `Total Findings: NO issues detected\n`;
    text += `Nikto found no common web server vulnerabilities.\n`;
  }

  text += `

IMPORTANT INSTRUCTIONS FOR AI:
--------------------------------
1. Look at the ACTUAL SCAN DATA above
2. If findings are listed, explain WHAT THEY MEAN in simple terms
3. If no findings, say "No web vulnerabilities detected"
4. For each type of finding, explain:
   - What it is (e.g., "outdated software", "misconfiguration")
   - How serious it is (Low/Medium/High risk)
   - If it's common or rare
5. Give a clear safety assessment: "Safe" or "Vulnerabilities found"
6. Give 3 simple recommendations for fixing issues
7. DO NOT talk about ports, SSL, or SQL injection
8. Focus ONLY on web server security issues
9. Format like this:

   FINDINGS SUMMARY: [number and type]
   RISK LEVEL: [Low/Medium/High]
   SAFETY STATUS: [Safe/Vulnerable]
   RECOMMENDATIONS: [3 simple tips]
10. Use bullet points and very simple language
`;
}

    // NMAP DONE
  if (scan.scanType === "nmap") {
    text += `
Tool: Nmap (Network Mapper)
Purpose: Checks which network ports are open on your server

ACTUAL SCAN DATA:
-----------------
`;
    
    if (scan.results?.nmap?.openPorts?.length > 0) {
      text += `Open Ports Found (${scan.results.nmap.openPorts.length}):\n`;
      scan.results.nmap.openPorts.forEach(port => {
        text += `- ${port}\n`;
      });
      
      // Add port numbers list for easy reference
      const portNumbers = [];
      scan.results.nmap.openPorts.forEach(portLine => {
        const match = portLine.match(/^(\d+)\//);
        if (match) portNumbers.push(match[1]);
      });
      
      if (portNumbers.length > 0) {
        text += `\nPort Numbers: ${portNumbers.join(", ")}\n`;
      }
      
      text += `\nFull scan output (first 10 lines):\n`;
      if (scan.results.nmap.rawOutput) {
        const lines = scan.results.nmap.rawOutput.split('\n').slice(0, 10);
        text += lines.join('\n');
      }
    } else {
      text += `Open Ports: NONE FOUND\n`;
      text += `The scan detected NO open ports on your server.\n`;
    }

    text += `

IMPORTANT INSTRUCTIONS FOR AI:
--------------------------------
1. FIRST, look at the ACTUAL SCAN DATA above
2. If there are open ports listed, TELL ME EXACTLY WHICH PORTS ARE OPEN
3. If no ports are listed, say "No open ports found"
4. For each open port, explain:
   - What service usually runs on that port
   - If it's common/normal (like 80, 443, 22)
   - If it's risky (like 21, 23, 3389)
5. Give a clear safety assessment: "Safe" or "Unsafe ports found"
6. Give 3 simple recommendations
7. DO NOT guess or invent ports - use ONLY the scan data provided
8. Use bullet points and simple language
9. Format like this:
   
   OPEN PORTS: [list them]
   COMMON PORTS: [explain]
   RISKY PORTS: [if any]
   SAFETY STATUS: [safe/unsafe]
   RECOMMENDATIONS: [3 simple tips]
`;
  }


//   sslscan doNe
if (scan.scanType === "ssl") {
  text += `
[SSL/TLS ENCRYPTION SECURITY SCAN]
Tool Used: SSLScan
Purpose: Checks website encryption strength and SSL/TLS vulnerabilities

ACTUAL SCAN DATA:
-----------------
`;
  
  if (scan.results?.ssl?.totalIssues > 0) {
    text += `Total Issues Found: ${scan.results.ssl.totalIssues}\n\n`;
    
    if (scan.results.ssl.issues?.length > 0) {
      text += `SSL/TLS SECURITY ISSUES:\n`;
      scan.results.ssl.issues.forEach((issue, index) => {
        // Clean up the issue text for readability
        const cleanIssue = issue.replace(/^\s*-\s*/, '').trim();
        text += `${index + 1}. ${cleanIssue}\n`;
      });
    }
    
    // Add certificate info if available
    if (scan.results.ssl.rawOutput) {
      const lines = scan.results.ssl.rawOutput.split('\n');
      const certLine = lines.find(l => l.includes('Subject:'));
      const expiryLine = lines.find(l => l.includes('Not After:'));
      
      if (certLine) text += `\nCertificate: ${certLine.trim()}\n`;
      if (expiryLine) text += `Expires: ${expiryLine.trim().replace('Not After:', '').trim()}\n`;
    }
    
  } else if (scan.results?.ssl?.success === true) {
    text += `Total Issues Found: NONE\n`;
    text += `No SSL/TLS vulnerabilities detected.\n`;
    
    // Still show some basic info if scan was successful
    if (scan.results.ssl.rawOutput) {
      const lines = scan.results.ssl.rawOutput.split('\n');
      const tlsLine = lines.find(l => l.includes('TLSv1.2') || l.includes('TLSv1.3'));
      if (tlsLine) text += `\nSupported Protocol: ${tlsLine.trim()}\n`;
    }
  } else {
    text += `Scan Status: Failed or incomplete\n`;
    text += `Could not complete SSL/TLS security check.\n`;
  }

  text += `

IMPORTANT INSTRUCTIONS FOR AI:
--------------------------------
1. Look at the ACTUAL SCAN DATA above
2. Focus ONLY on SSL/TLS encryption security
3. Explain findings in SIMPLE terms:
   - What SSL/TLS is (like a "secure envelope" for data)
   - What weak protocols mean (SSLv3, TLS 1.0, TLS 1.1)
   - What strong protocols mean (TLS 1.2, TLS 1.3)
4. For each issue found, explain:
   - What it means in simple language
   - Why it's dangerous (e.g., "can be hacked by attackers")
   - How serious it is (Critical/High/Medium/Low)
5. If no issues found, explain:
   - What good SSL/TLS looks like
   - Why it's important for security
6. Give clear safety assessment:
   - "Secure" (if TLS 1.2/1.3 only, no weak protocols)
   - "Needs improvement" (if mixed protocols)
   - "Insecure" (if SSLv3 or very weak encryption)
7. Give 3 simple recommendations
8. DO NOT talk about ports, web vulnerabilities, or SQL injection
9. Format like this:

   ENCRYPTION STATUS: [Secure/Insecure]
   ISSUES FOUND: [list them simply]
   RISK LEVEL: [Critical/High/Medium/Low/Safe]
   RECOMMENDATIONS: [3 simple tips]
10. Use very simple analogies (like "lock on a door", "secure envelope")
`;
}

// SQL MAP DONE
if (scan.scanType === "sqlmap") {
  text += `
[DATABASE SECURITY SCAN]
Tool Used: SQLMap
Purpose: Checks for SQL injection vulnerabilities in websites

ACTUAL SCAN DATA:
-----------------
`;
  
  // Show vulnerability status
  if (scan.results?.sqlmap?.vulnerable === true) {
    text += `RESULT: ⚠️ POTENTIAL SQL INJECTION VULNERABILITY FOUND\n\n`;
    
    if (scan.results.sqlmap.vulnerabilities?.length > 0) {
      text += `VULNERABILITIES DETECTED:\n`;
      scan.results.sqlmap.vulnerabilities.forEach((vuln, index) => {
        text += `${index + 1}. ${vuln}\n`;
      });
    } else {
      text += `The scan detected possible SQL injection points.\n`;
    }
    
    // Add type of injection if available
    if (scan.results.sqlmap.rawOutput) {
      const lines = scan.results.sqlmap.rawOutput.split('\n');
      const injectionTypes = lines.filter(l => 
        l.includes('injection') || 
        l.includes('Parameter') ||
        l.includes('payload')
      ).slice(0, 3);
      
      if (injectionTypes.length > 0) {
        text += `\nDETAILS:\n`;
        injectionTypes.forEach(line => {
          text += `- ${line.trim()}\n`;
        });
      }
    }
    
  } else if (scan.results?.sqlmap?.success === true) {
    text += `RESULT: ✅ NO SQL INJECTION VULNERABILITIES DETECTED\n\n`;
    text += `The website appears secure against SQL injection attacks.\n`;
    
    // Still show scan completion info
    if (scan.results.sqlmap.rawOutput) {
      const lines = scan.results.sqlmap.rawOutput.split('\n');
      const safeLines = lines.filter(l => 
        l.includes('all tested') || 
        l.includes('not vulnerable') ||
        l.includes('clean')
      );
      
      if (safeLines.length > 0) {
        text += `\nSCAN VERIFICATION:\n`;
        safeLines.slice(0, 2).forEach(line => {
          text += `- ${line.trim()}\n`;
        });
      }
    }
    
  } else {
    text += `RESULT: ❓ SCAN INCOMPLETE OR FAILED\n\n`;
    text += `Could not complete SQL injection security check.\n`;
    if (scan.results?.sqlmap?.error) {
      text += `Error: ${scan.results.sqlmap.error}\n`;
    }
  }

  text += `

IMPORTANT INSTRUCTIONS FOR AI:
--------------------------------
1. Look at the ACTUAL SCAN DATA above
2. Focus ONLY on SQL injection database security
3. Explain what SQL injection is in SIMPLE terms:
   - Like "someone tricking your website into showing database secrets"
   - Like "a burglar tricking a guard to open the safe"
4. For VULNERABLE sites, explain:
   - What SQL injection means for this website
   - How dangerous it is (VERY HIGH RISK - can steal all data)
   - What attackers can do (steal user data, passwords, credit cards)
   - Immediate actions needed
5. For SECURE sites, explain:
   - Why it's good news
   - What protection means for users
   - How to stay secure
6. Give clear safety assessment:
   - "CRITICAL RISK" (if vulnerable)
   - "SECURE" (if no vulnerabilities)
   - "UNKNOWN" (if scan failed)
7. Give 3-4 simple, actionable recommendations
8. DO NOT talk about ports, SSL, or web server issues
9. Use simple analogies and warnings
10. Format like this:

    SQL INJECTION STATUS: [Vulnerable/Secure]
    RISK LEVEL: [Critical/High/Medium/Low/Secure]
    DANGER EXPLANATION: [Simple explanation]
    IMMEDIATE ACTIONS: [What to do now]
    RECOMMENDATIONS: [3-4 simple tips]

11. Use warning emojis for vulnerable sites: ⚠️🚨
12. Use checkmarks for secure sites: ✅
`;
}

  return text;
}
