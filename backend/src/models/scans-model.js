import { Scan } from "./scans-mongo.js"

// CREATE A  SCAN
export async function createScan (scanData) {
    try {
        const newScan = new Scan(scanData);
        const savedScan = await newScan.save();
        return savedScan;
    } catch (error){
        console.error("Error Creating new Scan", error.message);
        throw error;
    }
}

// GETTING USER's SCAN HISTORY
export async function userScanHistory(userId){
    try {
        const scans = await Scan.find({userId : userId})
        .sort({createdAt : -1});
        return scans;
    } catch (error) {
        console.error("Error fetching user Scans: ", error.message);
        throw error;
    }
}

// SCAN BY SPECIFIC ID
export async function scanById(scanId,userId) {
    try {
        const scan = await Scan.findOne({_id : scanId, userId : userId});
        return scan;

    } catch (error) {
        console.error("Error fetching scan:", error.message);
        throw error;

    }
}

export async function deleteScan(scanId,userId){
    try {
        const deletedScan = await Scan.findOneAndDelete({_id : scanId, userId : userId});
        return deletedScan;
      } catch (error) {
        console.error("Error deleting scan:", error.message);
        throw error;

    }
}

export async function updateScanResult(scanId,results){
    try {
        const updatedScan = await Scan.findByIdAndUpdate(
            scanId,
            {
                status : "completed",
                results : results
            },
            { new : true} // Return updated document
        );
        return updatedScan;
    } catch (error){
        console.error("Error updating scan results:", error.message);
        throw error;

    }
}