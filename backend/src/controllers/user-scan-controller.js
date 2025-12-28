import { createScan, scanById, userScanHistory } from '../models/scans-model.js';
import { Scan } from '../models/scans-mongoose.js';
import { User } from '../models/users-mongoose.js';
import { scanWithNikto } from '../utils/scanners/nikto-scanner.js';
import { scanWithNmap } from '../utils/scanners/nmap-scanner.js';
import { scanWithSqlmap } from '../utils/scanners/sqlmap-scanner.js';
import { scanWithSsl } from '../utils/scanners/ssl-scanner.js';
import { urlValidation } from '../utils/validations/url-validation.js';
import { getScanStatistics } from '../utils/validations/scan-validaton.js';

//  STARTING A SCAN FUNCTION
export async function startScan(req, res) {
  try {
    const { targetUrl, scanType } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const user = await User.findById(userId);

    console.log('START SCAN REQUEST');
    console.log('User:', req.user.username);
    console.log('Target:', targetUrl);
    console.log('Type:', scanType);

    // CHECK IF SCAN IS ALREADY RUNNING
    const runningScan = await Scan.findOne({
      userId: userId,
      status: 'running',
    });

    if (runningScan) {
      return res.status(409).json({
        error: 'A scan is already running',
        message: 'Please wait for your current scan to complete',
        currentScanId: runningScan._id,
        startedAt: runningScan.createdAt,
        estimatedTimeToComplete: '2-3 minutes',
      });
    }

    // CHECK SCAN LIMIT FOR REGULAR USERS
    if (userRole === 'user') {
      if (user.usedScan >= user.scanLimit) {
        return res.status(403).json({
          error: `Scan limit reached, you have used ${user.usedScan}/${user.scanLimit} scans. `,
          message: 'Upgrade your account to get unlimited access or contact the admin',
          note: 'You can also check your Scan limit in your profile',
        });
      }
    }

    // URL VALIDATION
    const validation = urlValidation(targetUrl);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const scanStats = await getScanStatistics(userId, validation.url, scanType || 'full');

    console.log(scanStats.message);

    // CREATE SCAN RECORD
    const scanData = {
      userId: userId,
      targetUrl: validation.url,
      scanType: scanType || 'full',
      status: 'running',
    };

    const result = await createScan(scanData);

    // INCREMENT USER'S SCAN COUNTER
    if (userRole === 'user') {
      await User.findByIdAndUpdate(userId, {
        $inc: { usedScan: 1 },
      });
    }

    console.log('Scan created with ID:', result._id.toString());

    // SEND IMMEDIATE RESPONSE
    res.json({
      success: true,
      message: 'Scan started successfully',
      scanId: result._id.toString(),
      scan: {
        _id: result._id.toString(),
        id: result._id.toString(),
        targetUrl: validation.url,
        scanType: scanType,
        status: 'running',
        createdAt: result.createdAt,
      },
      status: 'running',
      scanType: scanType,
      scanRemaining: userRole === 'user' ? user.scanLimit - user.usedScan - 1 : 'unlimited',
      scanStatistics: {
        totalScansOfThisType: scanStats.totalScansOfType,
        previousScansOfThisUrl: scanStats.urlScanCount,
        lastScannedThisUrl: scanStats.lastScanDate,
        note:
          scanStats.urlScanCount > 0
            ? `You have scanned this URL ${scanStats.urlScanCount} time(s) before with ${scanType}`
            : 'First time scanning this URL with this tool',
      },
    });

    //  RUN SCAN ASYNCHRONOUSLY
    runScanAsync(result._id.toString(), validation.url, scanType);
  } catch (error) {
    console.error(' Error in startScan:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ASYNC FUNCTION TO RUN SCAN IN BACKGROUND
async function runScanAsync(scanId, targetUrl, scanType) {
  try {
    console.log(`[RunScan] Starting ${scanType} scan for ${targetUrl}`);

    let scanResult = {};

    // Run only the selected scan type
    switch (scanType) {
      case 'nmap':
        scanResult = await scanWithNmap(targetUrl);
        break;
      case 'sqlmap':
        scanResult = await scanWithSqlmap(targetUrl);
        break;
      case 'ssl':
        scanResult = await scanWithSsl(targetUrl);
        break;
      case 'nikto':
        scanResult = await scanWithNikto(targetUrl);
        break;
      default:
        throw new Error('Invalid scan type');
    }

    // Update scan with results
    await Scan.findByIdAndUpdate(scanId, {
      status: 'completed',
      results: {
        [scanType]: scanResult,
      },
      updatedAt: new Date(),
    });

    console.log(` Scan ${scanId} completed successfully`);
  } catch (scanError) {
    console.error(` Scan ${scanId} failed:`, scanError.message);

    await Scan.findByIdAndUpdate(scanId, {
      status: 'failed',
      results: {
        [scanType]: {
          tool: scanType,
          success: false,
          error: scanError.message,
        },
      },
      updatedAt: new Date(),
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
      if (!scanTypeStats[scan.scanType]) {
        scanTypeStats[scan.scanType] = 0;
      }
      scanTypeStats[scan.scanType]++;
    });

    // CLEAN AND FORMAT SCAN DATA
    const cleanScans = scans.map(scan => {
      let resultSummary = null;

      if (scan.status === 'completed' && scan.results) {
        resultSummary = {};

        if (scan.results.nmap?.openPorts) {
          resultSummary.nmap = {
            openPorts: scan.results.nmap.openPorts.length,
            ports: scan.results.nmap.openPorts.slice(0, 5),
          };
        }

        if (scan.results.nikto?.totalFindings !== undefined) {
          resultSummary.nikto = {
            findingsCount: scan.results.nikto.totalFindings,
          };
        }

        if (scan.results.ssl?.totalIssues !== undefined) {
          resultSummary.ssl = {
            issuesCount: scan.results.ssl.totalIssues,
          };
        }

        if (scan.results.sqlmap?.vulnerable !== undefined) {
          resultSummary.sqlmap = {
            vulnerable: scan.results.sqlmap.vulnerable,
            vulnerabilityCount: scan.results.sqlmap.vulnerabilities?.length || 0,
          };
        }
      }

      return {
        _id: scan._id.toString(),
        scanId: scan._id.toString(),
        targetUrl: scan.targetUrl,
        scanType: scan.scanType,
        status: scan.status,
        createdAt: scan.createdAt,
        updatedAt: scan.updatedAt,
        resultSummary: resultSummary,
        hasReport: !!scan.reportContent,
        reportGeneratedAt: scan.reportGeneratedAt || null,
      };
    });

    res.json({
      success: true,
      message: 'Scan history retrieved',
      totalScans: cleanScans.length,
      scanTypeBreakdown: scanTypeStats,
      scans: cleanScans,
    });
  } catch (error) {
    console.error('Error in getScanHistory:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// SCAN'S RESULT BY ID
export async function getScanResultsById(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    console.log('=== GET SCAN RESULTS ===');
    console.log('Scan ID:', scanId);
    console.log('User ID:', userId);

    if (!scanId || scanId === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID',
      });
    }

    const result = await scanById(scanId, userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
      });
    }

    console.log('Scan results fetched');

    res.json({
      success: true,
      message: 'Scan results retrieved',
      scan: {
        _id: result._id.toString(),
        targetUrl: result.targetUrl,
        scanType: result.scanType,
        status: result.status,
        results: result.results,
        reportContent: result.reportContent,
        reportGeneratedAt: result.reportGeneratedAt,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
    });
  } catch (error) {
    console.error(' Error in getScanResultsById:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// CANCELING A SCAN
export async function cancelScan(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    if (!scanId || scanId === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scan ID',
      });
    }

    const scan = await Scan.findOne({
      _id: scanId,
      userId: userId,
      status: 'running',
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found or not running',
        message: "Either scan doesn't exist or it's already completed/failed",
      });
    }

    await Scan.findByIdAndUpdate(scanId, {
      status: 'cancelled',
      results: {
        cancelled: true,
        error: 'Scan cancelled by user',
        cancelledAt: new Date(),
        duration: Date.now() - new Date(scan.createdAt).getTime() + 'ms',
      },
      updatedAt: new Date(),
    });

    console.log(' Scan cancelled:', scanId);

    res.json({
      success: true,
      message: 'Scan cancelled successfully',
      scanId: scanId,
      cancelledAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(' Error in cancelScan:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
