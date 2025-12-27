import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
 // Lines 6-32: Replace entire try-catch
try {
  console.log("Connecting to the Database ...... .");
  
  if (! process.env.DB_URL) {
    throw new Error("DB_URL environment variable is not set");
  }
  
  await mongoose.connect(process.env. DB_URL, {
    serverSelectionTimeoutMS: 5000, // Fail fast if DB is down
  });

  console.log("Database connected successfully");

  // HANDLING INTERRUPT WHILE SCAN IS RUNNING AND SERVER RESTARTED 
  try {
    const Scan = mongoose.model("Scan");
    const result = await Scan.updateMany(
      { status: "running" },
      { 
        status: "failed", 
        results: { error: "Server was restarted during scan" }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Fixed ${result.modifiedCount} stuck scans`);
    }
  } catch (cleanupError) {
    console.log(" Could not cleanup scans:", cleanupError. message);
  }

} catch (error) {
  console.error("FATAL:  Database connection failed");
  console.error("Error:", error.message);
  console.error("Make sure MongoDB is running and DB_URL is correct");
  process.exit(1); // Exit app - can't run without database
}
}
export default connectDB;
