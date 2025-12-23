import express from "express";
import { checkAuth } from "../middlewares/user-auth.js";
import { checkAdmin } from "../middlewares/admin-auth.js";
import {
  removeScan,
  upgradeUserScan,
  getAllScanHistory,
  getUserScanHistoryAdmin
} from "../controllers/scan-controller.js";

const adminRouter = express.Router();

/**
 * 🔐 Apply auth + admin check to ALL admin routes
 */
adminRouter.use(checkAuth);
adminRouter.use(checkAdmin);

/**
 * ✅ Admin dashboard test
 */
adminRouter.get("/", (req, res) => {
  res.json({
    message: "Welcome Admin",
    admin: req.adminUser.username
  });
});

/**
 * ✅ IMPORTANT: fixed route order
 */
adminRouter.get("/history", getAllScanHistory);
adminRouter.get("/users/:userId/history", getUserScanHistoryAdmin);
adminRouter.post("/update-limit", upgradeUserScan);
adminRouter.delete("/scan/:id", removeScan);

export default adminRouter;
