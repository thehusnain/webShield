/* eslint-disable @typescript-eslint/no-explicit-any */
// api/scan.api.ts - UPDATED to match your backend routes
import api from "./axios";

// Start a new scan - POST /scan/start
// src/api/scan-api.ts
export const startScan = (data: { targetUrl: string; scanType: string; options?: any }) => {
  return api.post("/scan/start", data);
};
// Get scan history - GET /scan/history
export const getScanHistory = () => {
  return api.get("/scan/history");
};

// Get scan results by ID - GET /scan/:id
export const getScanResultsById = (scanId: string) => {
  return api.get(`/scan/${scanId}`);
};

// Cancel a scan - POST /scan/:id/cancel
export const cancelScan = (scanId: string) => {
  return api.post(`/scan/${scanId}/cancel`);
};

// Generate AI report - POST /scan/:id/report/generate
export const generateAIReportForScan = (scanId: string) => {
  return api.post(`/scan/${scanId}/report/generate`);
};

// Download report - GET /scan/:id/report/download
export const downloadReport = (scanId: string) => {
  return api.get(`/scan/${scanId}/report/download`, {
    responseType: "arraybuffer", // important for PDF bytes
  });
};

// View report - GET /scan/:id/report/view
// If your backend also streams PDF here, keep arraybuffer.
// If it returns HTML/text, you can switch this to 'text'. Start with arraybuffer:
export const viewReport = (scanId: string) => {
  return api.get(`/scan/${scanId}/report/view`, {
    responseType: "arraybuffer",
  });
};