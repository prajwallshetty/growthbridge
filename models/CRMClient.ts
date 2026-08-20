import mongoose, { Schema } from "mongoose";

const SubtaskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  assignee: { type: String, default: "Unassigned" },
  dueDate: { type: String },
  deadline: { type: String }, // alias for backward compatibility
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
  completionTime: { type: String },
  order: { type: Number, default: 0 },
  subtasks: [SubtaskSchema],
});

const ExpenseSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, default: "Material Cost" }, // Material Cost, Miscellaneous Expenses, Vendor, Software, etc.
  vendor: { type: String, default: "" },
  amount: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, default: "Bank Transfer" },
  date: { type: String, required: true },
  notes: { type: String, default: "" },
  attachment: { type: String, default: "" },
});

const PaymentSchema = new Schema({
  amount: { type: Number, required: true, default: 0 },
  paymentDate: { type: String, required: true },
  referenceNumber: { type: String, default: "" },
  paymentMethod: { type: String, default: "Bank Transfer" },
  notes: { type: String, default: "" },
});

const InvoiceItemSchema = new Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const InvoiceSchema = new Schema({
  number: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ["Paid", "Pending", "Overdue"], default: "Pending" },
  items: [InvoiceItemSchema],
  paidAmount: { type: Number, default: 0 },
});

const QuotationItemSchema = new Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const QuotationSchema = new Schema({
  items: [QuotationItemSchema],
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 18 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  terms: { type: String },
  validity: { type: String },
  status: { type: String, enum: ["Draft", "Sent", "Approved", "Invoiced"], default: "Draft" },
});

const ProposalSchema = new Schema({
  title: { type: String, default: "Project Proposal" },
  contentBlocks: [{ type: String }],
  status: { type: String, enum: ["Draft", "Sent", "Approved", "Declined"], default: "Draft" },
  version: { type: Number, default: 1 },
});

const AgreementSchema = new Schema({
  scope: { type: String },
  timeline: { type: String },
  paymentTerms: { type: String },
  signedStatus: { type: String, enum: ["Unsigned", "Sent", "Signed"], default: "Unsigned" },
  signedAt: { type: Date },
});

const MeetingSchema = new Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  link: { type: String },
  notes: { type: String },
  actionItems: [{ type: String }],
  status: { type: String, enum: ["Upcoming", "Completed"], default: "Upcoming" },
});

const FileSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["Logo", "Brand Assets", "Images", "Proposal", "Agreement", "Invoices", "Source Files", "Credentials"], required: true },
  size: { type: String },
  url: { type: String },
  uploadedAt: { type: String },
});

const ActivitySchema = new Schema({
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ["document", "invoice", "meeting", "progress", "chat", "expense", "payment", "task"], default: "progress" },
});

const MessageSchema = new Schema({
  sender: { type: String, enum: ["client", "studio"], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

const CRMClientSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    logo: { type: String },
    industry: { type: String },
    budget: { type: Number, default: 0 },
    projectCost: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: [
        "Active",
        "Completed",
        "Pending",
        "On Hold",
        "Lead Created",
        "Discovery Call",
        "Meeting Scheduled",
        "Requirements Received",
        "Proposal Generated",
        "Quotation Generated",
        "Client Approval",
        "Agreement Generated",
        "Advance Payment Received",
        "Project Created Automatically",
        "Design Phase",
        "Development",
        "Testing",
        "Client Review",
        "Deployment",
        "Final Payment",
        "Project Completed",
        "Maintenance",
        "Upsell"
      ],
      default: "Active"
    },
    status: {
      type: String,
      enum: ["Not Started", "Ongoing", "Completed"],
      default: "Ongoing"
    },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    assignee: { type: String, default: "Unassigned" },
    progress: { type: Number, default: 0 },
    countryFlag: { type: String, default: "🇮🇳" },
    startDate: { type: String },
    expectedDelivery: { type: String },
    referredBy: { type: Schema.Types.ObjectId, ref: "CRMClient", default: null },
    referralCommissionPct: { type: Number, default: 5 },
    clientType: { type: String, enum: ["Direct", "Referred", "Partner"], default: "Direct" },
    tasks: [TaskSchema],
    expenses: [ExpenseSchema],
    payments: [PaymentSchema],
    files: [FileSchema],
    invoices: [InvoiceSchema],
    quotations: [QuotationSchema],
    proposals: [ProposalSchema],
    agreements: [AgreementSchema],
    meetings: [MeetingSchema],
    messages: [MessageSchema],
    activity: [ActivitySchema],
  },
  { timestamps: true }
);

export default mongoose.models.CRMClient || mongoose.model("CRMClient", CRMClientSchema);

