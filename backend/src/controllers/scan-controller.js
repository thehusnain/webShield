import {
  createScan,
  deleteScan,
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
import { checkDuplicateScan } from "../utils/validations/scan-validaton.js";

//  STARTING A SCAN FUNCTION
export async function startScan(req, res) {
  try {
    const { targetUrl, scanType } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const user = await User.findById(userId);

    //  CHECKING DUPLICATION
    const duplicateCheck = await checkDuplicateScan(
      userId,
      targetUrl,
      scanType || "full"
    );

    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        error: "Duplicate scan detected",
        message: duplicateCheck.message,
        previousScan: duplicateCheck.previousScan,
        info: "Check your scan history for previous results",
      });
    }

    // CHECK SCAN OVEWRITE
    const runningScan = await Scan.findOne({
      userId: userId,
      status: "running",
    });

    if (runningScan) {
      return res.json({
        error: "A scan is already running",
        message: "Please wait for your current scan for complete",
        currentScanId: runningScan._id,
        startedAt: runningScan.createdAt,
        estimatedTimeToComplete: "2-3 minutes",
      });
    }

    // SHOWING MESSAGE AFTER COMPLETED 5 SCANS
    if (userRole === "user") {
      if (user.usedScan >= user.scanLimit) {
        return res.status(403).json(
          {
            error: `Scan limit reached, you have used ${user.usedScan}/${user.scanLimit} scans.`,
            message:
              "Upgrade your account to get unlimited accesss or contact to the admin",
          },
          { message: "You can also check your Scan limit in your profile" }
        );
      }
    }

    // URL VALIDATION
    const validation = urlValidation(targetUrl);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const scanData = {
      userId: userId,
      targetUrl: validation.url,
      scanType: scanType || "full",
      status: "running",
    };

    const result = await createScan(scanData);
    if (userRole == "user") {
      await User.findByIdAndUpdate(userId, {
        $inc: { usedScan: 1 },
      });
    }
    res.json({
      message: "Scan started Successfully",
      scanId: result._id,
      status: "running",
      scanType: scanType,
      scanRemaining:
        userRole === "user" ? user.scanLimit - user.usedScan - 1 : "unlimited",
    });
    try {
      let nmapresult = {};
      let sslResult = {};
      let niktoResult = [];
      let sqlmapResult = [];

      //   CHOOSING SCANTYPE
      if (scanType === "nmap" || scanType === "full") {
        console.log(`Starting Nmap scan for ${validation.url}`);
        nmapresult = await scanWithNmap(validation.url);
      }
      if (scanType === "sqlmap" || scanType === "full") {
        console.log(`Starting sqlMap scan for ${validation.url}`);
        sqlmapResult = await scanWithSqlmap(validation.url);
      }
      if (scanType == "ssl" || scanType === "full") {
        console.log(`Staring SSL Scan for: ${validation.url}`);
        sslResult = await scanWithSsl(validation.url);
      }
      if (scanType == "nikto" || scanType === "full") {
        console.log(`Staring Nikto Scan for: ${validation.url}`);
        niktoResult = await scanWithNikto(validation.url);
      }
await Scan.findByIdAndUpdate(result._id, {
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
      await Scan.findByIdAndUpdate(result._id, {
        status: "failed",
        results: { error: scanError.message },
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// SCAN HISTORY BY USER ID
export async function getScanHistory(req, res) {
  try {
    const userId = req.user.userId;
    const scans = await userScanHistory(userId);

    const cleanScans = scans.map((scan) => {
      return {
        scanId: scan._id,
        targetUrl: scan.targetUrl,
        scanType: scan.scanType,
        status: scan.status,
        createdAt: scan.createdAt,
        message : "Result are in the Report"
      };
    });

    res.json({
      success: true,
      message: "Scan history retrieved",
      totalScans: cleanScans.length,
      scans: cleanScans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ALL SCANS HISTORY FOR ADMIN
export async function getAllScanHistory(req, res) {
  try {
    const allScans = await Scan.find({}).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      message: "All scan history retrieved",
      totalScans: allScans.length,
      scans: allScans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// USER SCAN HISTORY BY ID FROM ADMIN
export async function getUserScanHistoryAdmin(req, res) {
  try {
    const userId = req.params.userId;
    const scans = await Scan.find({ userId: userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId).select(
      "username email role scanLimit"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        scanLimit: user.scanLimit,
      },
      totalScans: scans.length,
      scans: scans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// SCAN'S RESULT
export async function getScanResults(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    const result = await scanById(scanId, userId);

    if (!result) {
      return res.status(404).json({ error: "Scan not found" });
    }
    res.json({
      message: "Scan results retrieved",
      scan: result,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETING A SCAN (FOR ADMIN)
export async function removeScan(req, res) {
  try {
    const scanId = req.params.id;
    const userId = req.user.userId;

    const result = await deleteScan(scanId, userId);

    if (!result) {
      return res.status(404).json({ error: "Scan not found" });
    }

    res.json({
      message: "Scan deleted successfully",
      deletedScanId: scanId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// CANCALING A SCAN
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
        error: "Scan not found or not running",
        message: "Either scan doesn't exist or it's already completed/failed",
      });
    }

    await Scan.findByIdAndUpdate(scanId, {
      status: "cancelled",
      results: {
        cancelled: true,
        error: "Scan cancelled by user",
        cancelledAt: new Date(),
        duration: Date.now() - new Date(scan.createdAt).getTime() + "ms",
      },
    });

    res.json({
      message: "Scan cancelled successfully",
      scanId: scanId,
      cancelledAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// UPGRADING USER'S SCAN LIMIT (FOR ADMIN)
export async function upgradeUserScan(req, res) {
  try {
    const { userId, scanLimit } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { scanLimit: scanLimit } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "User scan limit updated successfully",
      user: {
        userId: updatedUser._id,
        username: updatedUser.username,
        newScanLimit: updatedUser.scanLimit,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}




