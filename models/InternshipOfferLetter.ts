import mongoose, { Schema } from "mongoose";

const InternshipOfferLetterSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "InternshipApplication", required: true },
    offerLetterUrl: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.InternshipOfferLetter || mongoose.model("InternshipOfferLetter", InternshipOfferLetterSchema);
