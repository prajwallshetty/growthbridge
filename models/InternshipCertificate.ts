import mongoose, { Schema } from "mongoose";

const InternshipCertificateSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "InternshipApplication", required: true },
    certificateId: { type: String, required: true, unique: true },
    certificateUrl: { type: String, required: true },
    qrCode: { type: String },
    issueDate: { type: Date, default: Date.now },
    performance: { type: String, default: "Excellent" },
    projectTitle: { type: String },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipCertificate || mongoose.model("InternshipCertificate", InternshipCertificateSchema);
