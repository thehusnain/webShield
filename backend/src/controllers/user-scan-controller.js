import {
  createScan,
  scanById,
  userScanHistory,
} from "../models/scans-model.js";
import { Scan } from "../models/scans-mongoose.js";
import { User } from "../models/users-mongoose.js";
import { scanWithNikto } from "../utils/scanners/nikto-scanner.js";
import { scanWithNmap } from "../utils/scanners/nmap-scanner.js";
import { scanWithSqlmap } from "../utils/scanners/sqlmap-scanner.js";
import { scanWithSsl } from "../utils/scanners/ssl-scanner.js";
import { urlValidation } from "../utils/validations/url-validation.js";
import { getScanStatistics } from "../utils/validations/scan-validaton.js";

//  STARTING A SCAN FUNCTION
export async function startScan(req, res) {
  try {
    const { targetUrl, scanType } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const user = await User.findById(userId);

    // CHECK IF SCAN IS ALREADY RUNNING
    const runningScan = await Scan.findOne({
      userId: userId,
      status:  "running",
    });

    if (runningScan) {
      return res.status(409).json({
        error: "A scan is already running",
        message: "Please wait for your current scan to complete",
        currentScanId: runningScan._id,
        startedAt: runningScan.createdAt,
        estimatedTimeToComplete: "2-3 minutes",
      });
    }

    // CHECK SCAN LIMIT FOR REGULAR USERS
    if (userRole === "user") {
      if (user.usedScan >= user.scanLimit) {
        return res.status(403).json({
          error: `Scan limit reached, you have used ${user. usedScan}/${user. scanLimit} scans.`,
          message: "Upgrade your account to get unlimited access or contact the admin",
          note: "You can also check your Scan limit in your profile"
        });
      }
    }

    // URL VALIDATION
    const validation = urlValidation(targetUrl);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const scanStats = await getScanStatistics(
      userId,
      validation.url,
      scanType || "full"
    );

    console.log(scanStats.message); // Log for server

    // CREATE SCAN RECORD
    const scanData = {
      userId: userId,
      targetUrl: validation.url,
      scanType: scanType || "full",
      status: "running",
    };

    const result = await createScan(scanData);

    // INCREMENT USER'S SCAN COUNTER
    if (userRole === "user") {
      await User.findByIdAndUpdate(userId, {
        $inc: { usedScan: 1 },
      });
    }

    // SEND IMMEDIATE RESPONSE TO USER
    res.json({
      message: "Scan started successfully",
      scanId: result._id,
      status: "running",
      scanType: scanType,
      scanRemaining: 
        userRole === "user" ? user.scanLimit - user. usedScan - 1 : "unlimited",

      // SCAN STATISTICS
      scanStatistics:  {
        totalScansOfThisType: scanStats.totalScansOfType,
        previousScansOfThisUrl: scanStats.urlScanCount,
        lastScannedThisUrl:  scanStats.lastScanDate,
        note: scanStats.urlScanCount > 0
          ? `You have scanned this URL ${scanStats.urlScanCount} time(s) before with ${scanType}`
          : "First time scanning this URL with this tool"
      }
    });

    try {
      let nmapresult = {};
      let sslResult = {};
      let niktoResult = {};
      let sqlmapResult = {};

      // CHOOSE SCAN TYPE AND EXECUTE
      if (scanType === "nmap") {
        console.log(`Starting Nmap scan for ${validation.url}`);
        nmapresult = await scanWithNmap(validation.url);
      }
      if (scanType === "sqlmap") {
        console.log(`Starting SQLMap scan for ${validation.url}`);
        sqlmapResult = await scanWithSqlmap(validation.url);
      }
      if (scanType === "ssl") {
        console.log(`Starting SSL Scan for: ${validation. url}`);
        sslResult = await scanWithSsl(validation.url);
      }
      if (scanType === "nikto") {
        console.log(`Starting Nikto Scan for:  ${validation.url}`);
        niktoResult = await scanWithNikto(validation.url);
      }

      // UPDATE SCAN WITH RESULTS
      await Scan. findByIdAndUpdate(result._id, {
        status: "completed",
        results: {
          nmap: nmapresult,
          ssl: sslResult,
          nikto: niktoResult,
          sqlmap: sqlmapResult
        }
      });

      console.log(`Scan ${result._id} completed with results`);

    } catch (scanError) {
      // HANDLE SCAN FAILURE
      console.error(`Scan ${result._id} failed:`, scanError.message);
      
      await Scan.findByIdAndUpdate(result._id, {
        status: "failed",
        results: { error: scanError.message },
      });
    }

  } catch (error) {
    console.error("Error in startScan:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// SCAN HISTORY BY USER ID
export async function getScanHistory(req, res) {
  try {
    const userId = req.user.userId;
    const scans = await userScanHistory(userId);

    // CALCULATE STATISTICS BY SCAN TYPE
    const scanTypeStats = {};

    scans.forEach(scan => {
      if (! scanTypeStats[scan.scanType]) {
        scanTypeStats[scan.scanType] = 0;
      }
      scanTypeStats[scan.scanType]++;
    });

    // CLEAN AND FORMAT SCAN DATA
    const cleanScans = scans.map((scan) => {
      // Create summary of results
      let resultSummary = null;

      if (scan.status === 'completed' && scan.results) {
        resultSummary = {};

        // Nmap summary
        if (scan.results. nmap?. openPorts) {
          resultSummary.nmap = {
            openPorts: scan. results.nmap.openPorts.length,
            ports: scan.results.nmap.openPorts.slice(0, 5) // First 5 ports
          };
        }

        // Nikto summary
        if (scan.results.nikto?.totalFindings !== undefined) {
          resultSummary.nikto = {
            findingsCount: scan. results.nikto.totalFindings
          };
        }

        // SSL summary
        if (scan.results.ssl?.totalIssues !== undefined) {
          resultSummary.ssl = {
            issuesCount: scan.results.ssl.totalIssues
          };
        }

        // SQLMap summary
        if (scan.results.sqlmap?.vulnerable !== undefined) {
          resultSummary.sqlmap = {
            vulnerable: scan.results.sqlmap.vulnerable,
            vulnerabilityCount: scan.results.sqlmap.vulnerabilities?.length || 0
          };
        }
      }

      return {
    scanId: scan._id,
    targetUrl: scan.targetUrl,
    scanType: scan.scanType,
    status: scan.status,
    createdAt: scan.createdAt,
    resultSummary: resultSummary,
    hasReport: !!scan.reportContent, 
    reportGeneratedAt: scan.reportGeneratedAt || null
  };
});

    res.json({
      success: true,
      message: "Scan history retrieved",
      totalScans: cleanScans.length,
      scanTypeBreakdown: scanTypeStats, // e.g., { "nikto": 6, "nmap": 3, "ssl": 2 }
      scans: cleanScans,
    });

  } catch (error) {
    console.error("Error in getScanHistory:", error);
    return res.status(500).json({
      success: false,
      error:  error.message,
    });
  }
}

// SCAN'S RESULT BY ID
export async function getScanResultsById(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    const result = await scanById(scanId, userId);

    if (!result) {
      return res.status(404).json({ 
        success: false,
        error: "Scan not found" 
      });
    }

    res.json({
      success: true,
      message: "Scan results retrieved",
      scan: result,
    });

  } catch (error) {
    console.error("Error in getScanResultsById:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// CANCELING A SCAN
export async function cancelScan(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    const scan = await Scan.findOne({
      _id: scanId,
      userId: userId,
      status: "running",
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: "Scan not found or not running",
        message:  "Either scan doesn't exist or it's already completed/failed",
      });
    }

    await Scan.findByIdAndUpdate(scanId, {
      status:  "cancelled",
      results: {
        cancelled: true,
        error: "Scan cancelled by user",
        cancelledAt: new Date(),
        duration: Date. now() - new Date(scan.createdAt).getTime() + "ms",
      },
    });

    res.json({
      success: true,
      message: "Scan cancelled successfully",
      scanId: scanId,
      cancelledAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error in cancelScan:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}