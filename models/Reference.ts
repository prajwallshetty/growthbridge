import mongoose, { Schema } from "mongoose";

const ReferenceSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Existing Customer", "Friend", "Business Contact", "Freelancer", "Partner", "Other"],
      default: "Other",
    },
    notes: { type: String, default: "" },
    pendingReward: { type: Number, default: 0 },
    paidReward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Reference || mongoose.model("Reference", ReferenceSchema);
