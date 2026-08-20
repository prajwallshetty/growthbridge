import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    client: { type: String },
    category: { type: String, required: true },
    description: { type: String, required: true },
    detailContent: { type: String }, // Case study markdown/rich text
    image: { type: String, required: true }, // Main mockup image
    gallery: [{ type: String }],
    liveUrl: { type: String },
    githubUrl: { type: String },
    resultMetric: { type: String }, // e.g. "+320% revenue"
    technologies: [{ type: String }],
    featured: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    projectType: { type: String, default: "customised" }, // "pre-built" or "customised"
    status: { type: String, enum: ["not-started", "ongoing", "completed"], default: "not-started" },
    progress: { type: Number, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    completionDate: { type: Date },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assignedTeam: [{ type: String }],
    projectValue: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
