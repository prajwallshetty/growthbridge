import mongoose, { Schema } from "mongoose";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String }, // Cover image URL
    readTime: { type: Number, default: 3 },
    tags: [{ type: String }],
    categories: [{ type: String }],
    status: {
      type: String,
      enum: ["Draft", "Published", "Scheduled"],
      default: "Draft",
    },
    publishDate: { type: Date, default: Date.now },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
