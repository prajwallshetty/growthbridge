import mongoose, { Schema } from "mongoose";

const SettingSchema = new Schema(
  {
    contactEmail: { type: String, default: "hello@growthbridge.live" },
    phoneNumber: { type: String, default: "+91 62827 59863" },
    officeAddress: { type: String, default: "100 Pine St, San Francisco, CA" },
    socialTwitter: { type: String, default: "https://twitter.com/growthbridge" },
    socialLinkedin: { type: String, default: "https://linkedin.com/company/growthbridge" },
    socialGithub: { type: String, default: "https://github.com/growthbridge" },
    seoDefaultTitle: { type: String, default: "Growth Bridge — Creative Digital Agency" },
    seoDefaultDescription: { type: String, default: "We design and build enduring digital interfaces for startups." },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
