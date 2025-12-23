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

adminRouter.use(checkAuth);
adminRouter.use(checkAdmin);

adminRouter.get("/", (req, res) => {
  res.json({
    message: "Welcome Admin",
    admin: req.adminUser.username
  });
});
adminRouter.get("/history", getAllScanHistory);
adminRouter.get("/users/:userId/history", getUserScanHistoryAdmin);
adminRouter.post("/update-limit", upgradeUserScan);
adminRouter.delete("/scan/:id", removeScan);

export default adminRouter;
