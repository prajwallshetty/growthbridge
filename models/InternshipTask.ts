import mongoose, { Schema } from "mongoose";

const InternshipTaskSchema = new Schema(
  {
    domainId: { type: Schema.Types.ObjectId, ref: "InternshipDomain", required: true },
    title: { type: String, required: true },
    description: { type: String },
    week: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipTask || mongoose.model("InternshipTask", InternshipTaskSchema);
