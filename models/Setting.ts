import mongoose, { Schema } from "mongoose";

const SettingSchema = new Schema(
  {
    businessName: { type: String, default: "Growth Bridge" },
    currency: { type: String, default: "₹" },
    partner1Name: { type: String, default: "Prajwal" },
    partner1Share: { type: Number, default: 50 },
    partner2Name: { type: String, default: "Shaz" },
    partner2Share: { type: Number, default: 50 },
    taxRate: { type: Number, default: 18 },
    theme: { type: String, default: "light" },
    logoUrl: { type: String, default: "/logo.png" },
    contactEmail: { type: String, default: "hello@growthbridge.live" },
    phoneNumber: { type: String, default: "+91 62827 59863" },
    officeAddress: { type: String, default: "Kadri Temple Road, Kadri, Mangalore, Karnataka, India - 575002" },
    socialTwitter: { type: String, default: "https://twitter.com/growthbridge" },
    socialLinkedin: { type: String, default: "https://linkedin.com/company/growthbridge" },
    socialGithub: { type: String, default: "https://github.com/growthbridge" },
    seoDefaultTitle: { type: String, default: "Growth Bridge — Creative Digital Agency in Mangalore" },
    seoDefaultDescription: { type: String, default: "Helping ambitious businesses build, launch and scale digital experiences. Premium websites, AI automation, brand systems, and digital products in Mangalore, India." },
    maintenanceMode: { type: Boolean, default: false },
    branches: {
      type: [
        {
          name: { type: String, required: true },
          address: { type: String, required: true },
          status: { type: String, default: "active" }, // "active" or "coming_soon"
        }
      ],
      default: [
        { name: "India", address: "Mangalore, India", status: "active" },
        { name: "Germany", address: "Munich, Germany", status: "active" },
        { name: "France", address: "Paris, France", status: "active" },
        { name: "Poland", address: "Warsaw, Poland", status: "coming_soon" }
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
