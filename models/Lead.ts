import mongoose, { Schema } from "mongoose";

const LeadFollowUpSchema = new Schema({
  type: { type: String, enum: ["Call", "WhatsApp", "Meeting", "Email", "Other"], default: "Call" },
  date: { type: String, required: true },
  time: { type: String, default: "" },
  notes: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  completedAt: { type: String },
});

const LeadActivitySchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ["note", "status", "followup", "call", "whatsapp", "meeting", "email", "system"], default: "note" },
});

const LeadSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    location: { type: String, default: "" },
    source: {
      type: String,
      enum: [
        "Direct",
        "WhatsApp",
        "Instagram",
        "Website",
        "Referral",
        "LinkedIn",
        "Existing Customer",
        "Freelancer",
        "Other",
      ],
      default: "Direct",
    },
    referenceId: { type: Schema.Types.ObjectId, ref: "Reference", default: null },
    interestedService: { type: String, default: "" },
    estimatedBudget: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["New", "Contacted", "Discussion", "Proposal Sent", "Negotiation", "Converted", "Lost"],
      default: "New",
    },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    assignedTo: { type: String, default: "Unassigned" },
    nextFollowUp: {
      date: { type: String, default: "" },
      time: { type: String, default: "" },
      type: { type: String, enum: ["Call", "WhatsApp", "Meeting", "Email", "Other"], default: "Call" },
    },
    lastContacted: { type: String, default: "" },
    notes: { type: String, default: "" },
    lostReason: { type: String, default: "" },
    followUps: [LeadFollowUpSchema],
    activity: [LeadActivitySchema],
    convertedCustomerId: { type: Schema.Types.ObjectId, ref: "CRMClient", default: null },
    convertedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
