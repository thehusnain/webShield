import { createScan, deleteScan, scanById, updateScanResult, userScanHistory } from "../models/scans-model.js";
import { Scan } from "../models/scans-mongo.js";
import { User } from "../models/users-mongo.js";
import { scanWithGobuster } from "../utils/scanners/gobuster-scanner.js";
import { scanWithNmap } from "../utils/scanners/nmap-scanner.js";
import { scanWithSkipfish } from "../utils/scanners/skipFish-scanner.js";
import { scanWithSsl } from "../utils/scanners/ssl-scanner.js";
import { urlValidation } from "../utils/validations/url-validation.js";
import { checkDuplicateScan } from "../utils/validations/scan-validaton.js";

export async function startScan(req,res) {
    try {
        const {targetUrl, scanType} = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
         const user = await User.findById(userId);
       
const duplicateCheck = await checkDuplicateScan(userId, targetUrl, scanType || "full");
        
        if (duplicateCheck.isDuplicate) {
            return res.status(409).json({ 
                error: "Duplicate scan detected",
                message: duplicateCheck.message,
                previousScan: duplicateCheck.previousScan,
                suggestion: "Check your scan history for previous results"
            });
        }

        const runningScan = await Scan.findOne({
            userId : userId,
            status : "running"
        });

        if(runningScan){
            return res.json({error : "A scan is already running",
                message : "Please wait for your current scan for complete",
                currentScanId : runningScan._id,
                startedAt : runningScan.createdAt,
                estimatedTimeToComplete : "2-3 minutes"
            })
        }


        if(userRole === 'user'){
           
                        if(user.usedScan >= user.scanLimit){
                return res.status(403).json({error : `Scan limit reached, you have used ${user.usedScan}/${user.scanLimit} scans.`,
                message : "Upgrade your account to get unlimited accesss or contact to the admin"},
            {message : "You can also check your Scan limit in your profile"});
            };
        };

        const validation = urlValidation(targetUrl);
        if(!validation.valid){
            return res.status(400).json({error : validation.error})
        }

        const scanData = {
            userId : userId,
            targetUrl : validation.url, 
            scanType : scanType || "full",
            status  : "running",
        };

        const result = await createScan(scanData);
        if(userRole == 'user'){
            await User.findByIdAndUpdate(userId, {
                $inc : {usedScan : 1}
            });

        }
        res.json({
            message : "Scan started Successfully",
            scanId : result._id,
            status : "running",
            scanType : scanType,
scanRemaining : userRole === 'user' ? (user.scanLimit - user.usedScan - 1) : "unlimited"
        });
        try {
            let nmapresult = {};
            let sslResult = [];
            let gobusterResult = [];
            let skipfishResult = [];


            if(scanType === 'nmap' || scanType === 'full'){
            console.log(`Starting Nmap scan for ${validation.url}`);
            nmapresult = await scanWithNmap(validation.url);
            } if(scanType === 'skipfish' || scanType === 'full'){
            console.log(`Starting skipfish scan for ${validation.url}`);
            skipfishResult = await scanWithSkipfish(validation.url);
            }if(scanType == 'ssl' || scanType === 'full'){
                console.log(`Staring SSL Scan for: ${validation.url}`);
                sslResult = await scanWithSsl(validation.url);
            }if(scanType == 'gobuster' || scanType === 'full'){
                console.log(`Staring Gobuster Scan for: ${validation.url}`);
                gobusterResult = await scanWithGobuster(validation.url);
            }

            await updateScanResult(result._id, {
                nmap : nmapresult,
                ssl : sslResult,
                gobuster : gobusterResult,
                skipfish : skipfishResult
        
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

export async function getScanHistory(req, res) {
    try {
        const userId = req.user.userId;
        const scans = await userScanHistory(userId);
        

        const cleanScans = scans.map(scan => {
            return {
                scanId: scan._id,
                targetUrl: scan.targetUrl,
                scanType: scan.scanType,
                status: scan.status,
                createdAt: scan.createdAt,
                
                findings: {
                    openPorts: scan.results?.nmap?.openPorts || [],
                    hiddenDirectories: scan.results?.directories || [],
                    totalFindings: (scan.results?.nmap?.openPorts?.length || 0) + 
                                  (scan.results?.directories?.length || 0)
                }
            };
        });
        
        res.json({
            success: true,
            message: "Scan history retrieved",
            totalScans: cleanScans.length,
            scans: cleanScans
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
}

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
  export async function cancelScan(req,res) {
    
    try {
        const scanId = req.params.id;
        const userId = req.user.userId;
        
        
        const scan = await Scan.findOne({ 
            _id: scanId, 
            userId: userId,
            status: "running"
        });
        
        if (!scan) {
            return res.status(404).json({
                error: "Scan not found or not running",
                message: "Either scan doesn't exist or it's already completed/failed"
            });
        }
        
        await Scan.findByIdAndUpdate(scanId, {
            status: "failed",
            results: {
                cancelled: true,
                error: "Scan cancelled by user",
                cancelledAt: new Date(),
                duration: Date.now() - new Date(scan.createdAt).getTime() + "ms"
            }
        });
        
        res.json({
            message: "Scan cancelled successfully",
            scanId: scanId,
            cancelledAt: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


export async function upgradeUserScan(req,res){
    try {
        const {userId} = req.body;
        if(req.user.role !== 'admin'){
            return res.status(403).json({ error : "Admin access is required"});
        }
        const updatedUser = await User.findByIdAndUpdate(userId,
            {$inc : {scanLimit : 50}},
            {new : true}
        );
        res.json({
            message : "User scan limit is upgraded successfully",
            newScanLimit : updatedUser.scanLimit
        })

    } catch (error) {
        return res.status(500).json({ error: error.message });
    };
}
