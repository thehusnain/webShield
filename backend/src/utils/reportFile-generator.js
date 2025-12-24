import path from "path";
import fs from "fs";

export async function generateTxtReport(scan, aiText) {
  const reportsDir = path.join(process.cwd(), "reports");

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const filePath = path.join(
    reportsDir,
    `scan-report-${scan._id}.txt`);

  const content = `

    -- WEB SECURITY SCAN REPORT --


SCAN DETAILS:
-------------
Scan ID     : ${scan._id}
Target URL : ${scan.targetUrl}
Scan Type  : ${scan.scanType.toUpperCase()}
Scan Time  : ${scan.createdAt}


        -- AI ANALYSIS REPORT --


${aiText}


          -- END OF REPORT --

Report generated at: ${new Date().toLocaleString()}`;

  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}