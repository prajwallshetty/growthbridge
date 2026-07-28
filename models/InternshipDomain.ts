import mongoose, { Schema } from "mongoose";

const InternshipDomainSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    duration: { type: String, required: true, default: "3 Weeks" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipDomain || mongoose.model("InternshipDomain", InternshipDomainSchema);
