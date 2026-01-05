import api from "./axios";

/** Admin stats summary */
export const fetchAdminStats = () => api.get("/admin/stats");

/** All scan history (all users) */
export const fetchAllScanHistory = () => api.get("/admin/history");

/** Specific user’s scan history */
export const fetchUserScanHistory = (userId: string) =>
  api.get(`/admin/users/${userId}/history`);

/** Update a user’s scan limit */
export const updateUserScanLimit = (payload: { userId: string; scanLimit: number }) =>
  api.post("/admin/update-limit", payload);

/** Delete a scan by id */
export const deleteScanById = (scanId: string) => api.delete(`/admin/scan/${scanId}`);