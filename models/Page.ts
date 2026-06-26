import mongoose, { Schema } from "mongoose";

const PageSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true }, // Rich text / markdown page content
    seoTitle: { type: String },
    seoDescription: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model("Page", PageSchema);
