import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-6 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-[#E9E3DA] rounded-3xl p-8 sm:p-10 text-center shadow-[0_15px_45px_rgba(0,0,0,0.02)] relative z-10 flex flex-col items-center">
        {/* Animated green check ring */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} strokeWidth={1.8} className="animate-pulse" />
        </div>

        <span className="font-mono text-[10px] font-bold text-[#A8A296] uppercase tracking-[0.18em]">
          Registration Completed
        </span>

        <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight text-[#111111] mt-3">
          Application Submitted Successfully
        </h1>

        <p className="mt-4 text-[13.5px] text-[#6A6A6A] leading-relaxed font-semibold">
          Thank you for applying to the GrowthBridge Internship Program.
        </p>

        <p className="mt-3 text-[13px] text-[#6A6A6A] leading-relaxed font-medium">
          Your details are now under review by our team. Shortlisted candidates will receive official onboarding details within <strong className="text-[#111111]">1 week</strong> through Email and WhatsApp.
        </p>

        <div className="mt-8 pt-6 border-t border-[#E9E3DA]/60 w-full flex flex-col gap-3">
          <Link
            href="/internship"
            className="w-full py-3 rounded-xl bg-[#111111] text-white text-[12.5px] font-bold hover:bg-[#F4C542] hover:text-[#111111] transition-all flex items-center justify-center gap-1.5"
          >
            <span>Back to Internships</span>
            <ArrowRight size={13} />
          </Link>
          
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-white border border-[#E9E3DA] text-[#6A6A6A] text-[12.5px] font-semibold hover:border-[#D7D0C8] hover:text-[#111111] transition-all"
          >
            Go to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
