import express from "express";
import { checkAuth } from "../middlewares/auth.js";
import { 
    startScan, 
    getScanHistory, 
    getScanResults, 
    removeScan 
} from "../controllers/scan-controller.js"; // IMPORT FROM CONTROLLER

const scanRouter = express.Router();

scanRouter.use(checkAuth);

// START A NEW SCAN
scanRouter.post("/start", startScan); // USE CONTROLLER FUNCTION

// GET SCAN HISTORY
scanRouter.get("/history", getScanHistory); // USE CONTROLLER FUNCTION

// GET SPECIFIC SCAN BY ID 
scanRouter.get("/:id", getScanResults); // USE CONTROLLER FUNCTION

// DELETE A SCAN 
scanRouter.delete("/:id", removeScan); // USE CONTROLLER FUNCTION

// DOWNLOAD PDF REPORT (we'll add this later)
scanRouter.get("/:id/report", async (req,res) => {
    try {
        const scanId = req.params.id;
        res.json({
            message: `PDF report for scan ${scanId}`,
            reportUrl: "/reports/scan-123.pdf"
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

export default scanRouter;