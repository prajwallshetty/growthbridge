import mongoose, { Schema } from "mongoose";

const HomepageSchema = new Schema(
  {
    // Hero Section
    heroTitle: { type: String, default: "Build your startup with Growth Bridge." },
    heroDescription: { type: String, default: "A design and engineering partner for founders who value quality, clarity, and momentum. We bridge complex engineering with premium aesthetics." },
    heroBtnText: { type: String, default: "Start a project" },
    heroBtnUrl: { type: String, default: "#contact" },
    
    // Section Visibility toggles
    showSelectedWork: { type: Boolean, default: true },
    showProcess: { type: Boolean, default: true },
    showTestimonials: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Homepage || mongoose.model("Homepage", HomepageSchema);
