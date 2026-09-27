import mongoose, { Schema } from "mongoose";

const FreelancerPaymentSchema = new Schema({
  date: { type: String, required: true },
  project: { type: String, default: "" },
  projectId: { type: Schema.Types.ObjectId, ref: "CRMProject", default: null },
  amount: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
  notes: { type: String, default: "" },
});

const FreelancerActivitySchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ["assignment", "payment", "status", "note", "system"], default: "note" },
});

const FreelancerSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    location: { type: String, default: "" },
    skills: [{ type: String }],
    specialization: { type: String, default: "" },
    experience: { type: String, default: "" },
    portfolioUrl: { type: String, default: "" },
    availability: {
      type: String,
      enum: ["Available", "Working", "Busy", "Inactive"],
      default: "Available",
    },
    rateType: { type: String, enum: ["Hourly", "Project"], default: "Project" },
    rate: { type: Number, default: 0 },
    paymentDetails: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Available", "Working", "Busy", "Inactive"],
      default: "Available",
    },
    payments: [FreelancerPaymentSchema],
    activity: [FreelancerActivitySchema],
  },
  { timestamps: true }
);

export default mongoose.models.Freelancer || mongoose.model("Freelancer", FreelancerSchema);
