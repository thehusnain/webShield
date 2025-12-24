import { Scan } from "../../models/scans-mongoose.js";

export async function checkDuplicateScan(userId, targetUrl, scanType) {
  console.log("Checking duplicate for USER:", {
    userId: String(userId).substring(0, 10) + "...",
    targetUrl,
    scanType,
  });
  let normalizedUrl = targetUrl.toLowerCase();
  normalizedUrl = normalizedUrl.replace("https://", "").replace("http://", "").replace("www.", "").trim();
  const userScans = await Scan.find({
    userId: userId,
    scanType: scanType,
  }).sort({ createdAt: -1 });

  console.log(`User has ${userScans.length} scans of type ${scanType}`);

  for (const scan of userScans) {
    let scanUrl = scan.targetUrl.toLowerCase();
    scanUrl = scanUrl
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .trim();

    if (scanUrl === normalizedUrl) {
      console.log("User already scanned this URL!");
      return {
        isDuplicate: true,
        message: `You already scanned ${scan.targetUrl} with ${scanType} scan`,
        previousScan: {
          scanId: scan._id,
          status: scan.status,
          scannedAt: scan.createdAt,
          targetUrl: scan.targetUrl,
        },
      };
    }
  }

  console.log("No duplicate found for this user");
  return { isDuplicate: false };
}
