import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema. Types.ObjectId,
      ref: "User",
      required:  true,
    },
    targetUrl: {
      type: String,
      required: true,
    },
    scanType: {
      type: String,
      enum: ["nmap", "sqlmap", "ssl", "nikto"],
      default: "full",
    },
    status:  {
      type: String,
      enum: ["pending", "running", "completed", "failed", "cancelled"],
      default: "pending",
    },
    results: {
      nmap: Object,
      nikto: Object,
      ssl:  Object,
      sqlmap: Object,
    },
    reportContent: {
      type: String,
      default: null
    },
    reportGeneratedAt: {
      type:  Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ status: 1 });
scanSchema.index({ userId: 1, status: 1 });

export const Scan = mongoose.model("Scan", scanSchema);