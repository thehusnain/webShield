import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to the Database .......");
    await mongoose.connect(process.env.DB_URL);

    console.log("Database is connected a successfully");

    // HANDLING INTERPT WHILE SCAN IS RUNNING AND SERVER RESTARTED 
    try {
      const Scan = mongoose.model("Scan");
      const result = await Scan.updateMany(
        {
          status: "running",
        },
        { status: "failed", results: "server is restarted" }
      );
      if (result.modifiedCount > 0) {
        console.log(`Fixed ${result.modifiedCount} stuck scans`);
      }
    } catch (cleanupError) {
      console.log("Could not cleanup scans:", cleanupError.message);
    }

  } catch (error) {
    console.error("The error of connecting database is", error);
  }
};
export default connectDB;
