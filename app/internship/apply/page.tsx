import React from "react";
import ApplyForm from "./ApplyForm";
import { getDomains } from "@/lib/actions/internship";

export const dynamic = "force-dynamic";

export default async function InternshipApplyPage() {
  const dbDomains = await getDomains().catch(() => []);

  const defaultDomains = [
    { _id: "default-fs", name: "Full Stack Web Development" },
    { _id: "default-rn", name: "React Native Mobile App Development" },
    { _id: "default-ml", name: "Machine Learning Engineering" },
    { _id: "default-ds", name: "Data Science & Analytics" },
  ];

  const domains = dbDomains && dbDomains.length > 0 ? dbDomains : defaultDomains;

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.04)_0%,_transparent_75%)] pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="font-mono text-[10.5px] font-bold text-[#F4C542] tracking-[0.2em] uppercase">Registration Portal</span>
          <h1 className="text-[32px] font-black tracking-tight text-[#111111] mt-2">Apply for Internship</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-2 font-medium">Please fill in your details accurately to register for the GrowthBridge Internship.</p>
        </div>
        
        <ApplyForm domains={domains} />
      </div>
    </div>
  );
}
