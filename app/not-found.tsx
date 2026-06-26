"use client";

import React from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function NotFound() {
  return (
    <main className={`${inter.className} min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden flex flex-col justify-between pb-12 pt-24 md:py-24 antialiased`}>
      {/* SideRays background effects */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.35]">
        <SideRays
          speed={0.8}
          rayColor1="#111111"
          rayColor2="#E9E3DA"
          intensity={1.0}
          spread={1.5}
          origin="top-right"
          tilt={0}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.3}
        />
      </div>

      {/* Top logo header */}
      <div className="mx-auto max-w-[1280px] w-full px-6 md:px-12 relative z-20 shrink-0">
        <a href="/" className="flex items-center gap-2">
          <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
        </a>
      </div>

      {/* Center 404 content */}
      <div className="mx-auto max-w-[640px] px-6 text-center relative z-20 flex-1 flex flex-col justify-center items-center">
        <div className="h-16 w-16 bg-[#111111]/5 border border-[#E9E3DA] rounded-full flex items-center justify-center text-[#111111] mb-8">
          <HelpCircle size={28} />
        </div>
        
        <span className="font-mono text-[13px] tracking-[0.15em] uppercase text-[#A8A296]">
          404 — Page Not Found
        </span>
        
        <h1 className="mt-5 text-[36px] sm:text-[48px] font-extrabold leading-[1.1] tracking-[-0.03em]">
          Lost in translation.
        </h1>
        
        <p className="mt-6 text-[15px] leading-[1.7] text-[#6A6A6A] max-w-[420px]">
          The resource you are looking for has either moved to a new route, been renamed, or does not exist. Let's get you back on track.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#111111] hover:bg-[#2a2a2a] text-white px-7 py-3.5 text-[13px] font-bold shadow-md transition-all"
          >
            <ArrowLeft size={14} /> Back to Homepage
          </a>
        </div>
      </div>

      {/* Bottom copyright placeholder */}
      <div className="mx-auto max-w-[1280px] w-full px-6 md:px-12 text-center md:text-left relative z-20 shrink-0 text-[12px] text-[#A8A296] font-semibold uppercase tracking-wider">
        © {new Date().getFullYear()} Growth Bridge Studio.
      </div>
    </main>
  );
}
