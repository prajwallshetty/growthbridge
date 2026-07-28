import mongoose, { Schema } from "mongoose";

const InternshipNotificationSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "InternshipApplication", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipNotification || mongoose.model("InternshipNotification", InternshipNotificationSchema);
