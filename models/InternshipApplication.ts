import mongoose, { Schema } from "mongoose";

const InternshipApplicationSchema = new Schema(
  {
    applicationId: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    college: { type: String, required: true },
    degree: { type: String, required: true },
    branch: { type: String, required: true },
    currentYear: { type: String, required: true },
    graduationYear: { type: String, required: true },
    domainId: { type: Schema.Types.ObjectId, ref: "InternshipDomain", required: true },
    experienceLevel: { type: String, required: true },
    whyJoin: { type: String },
    hasProjects: { type: String, enum: ["Yes", "No"], default: "No" },
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Selected", "Rejected", "Completed"],
      default: "Pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipApplication || mongoose.model("InternshipApplication", InternshipApplicationSchema);
