import mongoose, { Schema } from "mongoose";

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    image: { type: String, required: true }, // Avatar URL
    quote: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
