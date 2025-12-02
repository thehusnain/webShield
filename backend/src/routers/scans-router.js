import express from "express";
import { generateScanReport } from "../utils/pdf-generator.js";
import { checkAuth } from "../middlewares/auth.js";
import { Scan } from "../models/scans-mongo.js";
import { 
    startScan, 
    getScanHistory, 
    getScanResults, 
    removeScan 
} from "../controllers/scan-controller.js"; 

const scanRouter = express.Router();

scanRouter.use(checkAuth);
scanRouter.post("/start", startScan); 
scanRouter.get("/history", getScanHistory); 
scanRouter.get("/:id", getScanResults); 
scanRouter.delete("/:id", removeScan); 


scanRouter.get("/:id/report", async (req, res) => {
    try {
        const scanId = req.params.id;
        const userId = req.user.userId;
        
        // Get scan data
        const scan = await Scan.findOne({ _id: scanId, userId: userId });
        
        if (!scan) {
            return res.status(404).json({ 
                success: false, 
                error: "Scan not found" 
            });
        }
        
        // Check if scan is completed
        if (scan.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: "Scan is still running. Please wait for completion."
            });
        }
        
        // Generate PDF
        const pdfBuffer = await generateScanReport(scan);
        
        // Send PDF as download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=webshield-report-${scanId}.pdf`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to generate PDF report" 
        });
    }
});


export default scanRouter;