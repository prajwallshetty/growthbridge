import mongoose, { Schema } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    action: { type: String, required: true },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
