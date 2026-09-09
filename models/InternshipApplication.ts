import mongoose, { Schema } from "mongoose";

const InternshipApplicationSchema = new Schema(
  {
    applicationId: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String },
    college: { type: String },
    degree: { type: String },
    branch: { type: String },
    currentYear: { type: String },
    graduationYear: { type: String },
    domainId: { type: Schema.Types.ObjectId, ref: "InternshipDomain", required: true },
    experienceLevel: { type: String },
    whyJoin: { type: String },
    hasProjects: { type: String, enum: ["Yes", "No"], default: "No" },
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["Applied", "Pending", "Shortlisted", "Interview", "Selected", "Rejected", "Completed"],
      default: "Applied",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipApplication || mongoose.model("InternshipApplication", InternshipApplicationSchema);
