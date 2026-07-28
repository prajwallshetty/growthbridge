import mongoose, { Schema } from "mongoose";

const InternshipSubmissionSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "InternshipApplication", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "InternshipTask", required: true },
    githubUrl: { type: String, required: true },
    demoUrl: { type: String },
    remarks: { type: String },
    marks: { type: Number, default: 0 },
    status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipSubmission || mongoose.model("InternshipSubmission", InternshipSubmissionSchema);
