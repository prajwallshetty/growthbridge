import mongoose, { Schema } from "mongoose";

const ProjectPaymentSchema = new Schema({
  amount: { type: Number, required: true, default: 0 },
  paymentDate: { type: String, required: true },
  referenceNumber: { type: String, default: "" },
  paymentMethod: { type: String, default: "Bank Transfer" },
  notes: { type: String, default: "" },
});

const ProjectExpenseSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  date: { type: String, required: true },
  notes: { type: String, default: "" },
});

const AssignedFreelancerSchema = new Schema({
  freelancerId: { type: Schema.Types.ObjectId, ref: "Freelancer", required: true },
  name: { type: String, default: "" },
  agreedCost: { type: Number, default: 0 },
});

const ProjectActivitySchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ["status", "payment", "expense", "assignment", "note", "system"], default: "note" },
});

const CRMProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "CRMClient", required: true },
    service: { type: String, default: "" },
    assignedFreelancers: [AssignedFreelancerSchema],
    startDate: { type: String, default: "" },
    deadline: { type: String, default: "" },
    projectValue: { type: Number, default: 0 },
    freelancerCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"],
      default: "Not Started",
    },
    notes: { type: String, default: "" },
    payments: [ProjectPaymentSchema],
    expenses: [ProjectExpenseSchema],
    activity: [ProjectActivitySchema],
  },
  { timestamps: true }
);

export default mongoose.models.CRMProject || mongoose.model("CRMProject", CRMProjectSchema);
