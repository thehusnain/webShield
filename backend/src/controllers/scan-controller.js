import { createScan, deleteScan, scanById, updateScanResult, userScanHistory } from "../models/scans-model.js";
import { Scan } from "../models/scans-mongo.js";
import { scanWithNmap } from "../utils/scanners/nmap-scanner.js";
import { urlValidation } from "../utils/url-validation.js";

export async function startScan(req,res) {
    try {
        const {targetUrl, scanType} = req.body;
        const userId = req.user.userId;

        const validation = urlValidation(targetUrl);
        if(!validation.valid){
            return res.status(400).json({error : validation.error})
        }

        const scanData = {
            userId : userId,
            targetUrl : validation.url, 
            scanType : scanType || "quick",
            status  : "running"
        };

        const result = await createScan(scanData);
        res.json({
            message : "Scan started Successfully",
            scanId : result._id,
            status : "running"
        });
        try {
            console.log(`Starting Nmap scan for ${validation.url}`);
            const nmapresult = await scanWithNmap(validation.url);

            await updateScanResult(result._id, {
                nmap : nmapresult,
                nikto : {},
                ssl : {},
                directories : []
            });
            console.log(`Scan ${result._id} completed with results`);
            } catch (scanError){
                await Scan.findByIdAndUpdate(result._id, {
                    status : "failed",
                    results : {error : scanError.message}
                })
            }

    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Get user's scan history
export async function getScanHistory(req, res) {
    try {
        const userId = req.user.userId;
        const result = await userScanHistory(userId);
        
        res.json({
            message: "Scan history retrieved",
            scans: result
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Get specific scan results
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
            scan: result
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Delete a scan
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
            deletedScanId: scanId
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}