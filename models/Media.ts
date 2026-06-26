import mongoose, { Schema } from "mongoose";

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    mimeType: { type: String },
    altText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model("Media", MediaSchema);
