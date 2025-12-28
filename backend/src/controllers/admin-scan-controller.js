import { User } from '../models/users-mongoose.js';
import { Scan } from '../models/scans-mongoose.js';


// ALL SCANS HISTORY FOR ADMIN
export async function getAllScanHistory(req, res) {
  try {
    const allScans = await Scan.find({}).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      message: 'All scan history retrieved',
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
    const user = await User.findById(userId).select('username email role scanLimit');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
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

// DELETING A SCAN (FOR ADMIN)
export async function removeScan(req, res) {
  try {
    const scanId = req.params.id;

    const deletedScan = await Scan.findByIdAndDelete(scanId);

    if (!deletedScan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      message: 'Scan deleted successfully',
      deletedScanId: scanId,
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
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { scanLimit: scanLimit } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User scan limit updated successfully',
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

export async function getAdminStats(req, res) {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total scans
    const totalScans = await Scan.countDocuments();

    // Get active scans (running or pending)
    const activeScans = await Scan.countDocuments({
      status: { $in: ['pending', 'running'] },
    });

    // Get recent users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role createdAt')
      .lean();

    // Get recent scans (last 5)
    const recentScans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('targetUrl scanType status createdAt')
      .lean();

    res.json({
      success: true,
      totalUsers,
      totalScans,
      activeScans,
      recentUsers,
      recentScans,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics',
    });
  }
}
