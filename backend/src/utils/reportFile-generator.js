import fs from "fs";
import path from "path";

export function generateTxtReport(scan, aiText) {
  const reportsDir = path.join(process.cwd(), "reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const fileName = `scan-report-${scan._id}.txt`;
  const filePath = path.join(reportsDir, fileName);

  const content = `
=========================
WEB SECURITY SCAN REPORT
=========================

Scan ID     : ${scan._id}
Target URL : ${scan.targetUrl}
Scan Type  : ${scan.scanType}
Scan Time  : ${scan.createdAt}

----------------------------------------
AI EXPLANATION (Simple Language)
----------------------------------------

${aiText}

----------------------------------------
END OF REPORT
`;

  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}
