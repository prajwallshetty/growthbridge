"use client";

import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

interface ProjectsClientProps {
  projects: any[];
  settings?: any;
  teamMembers?: any[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-24">
      {/* Background Rays */}
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
        <SideRays
          speed={0.6}
          rayColor1="#E9E3DA"
          rayColor2="#111111"
          intensity={0.8}
          spread={1.2}
          origin="top-left"
          tilt={10}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.2}
        />
      </div>

      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <div className="flex items-center gap-4">
            <a
              href="/admin/portfolio"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[12px] font-bold text-[#111111] hover:border-[#111111] transition-all"
            >
              Admin Dashboard
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[12px] font-bold text-[#111111] hover:border-[#111111] transition-all"
            >
              <ArrowLeft size={14} /> Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Title Section */}
      <section className="pt-32 pb-10 relative z-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
            <Sparkles size={13} className="text-[#F4C542]" /> Showcase & Case Studies
          </span>
          <h1 className="text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Selected Work & Projects
          </h1>
          <p className="max-w-[560px] text-[15px] leading-[1.7] text-[#6A6A6A] font-medium">
            Explore our portfolio of shipped digital products, storefronts, and client platforms.
          </p>
        </div>
      </section>

      {/* Portfolio Showcase Grid with Segmented Filters */}
      <section className="relative z-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <PortfolioGrid projects={projects || []} />
        </div>
      </section>
    </main>
  );
}
