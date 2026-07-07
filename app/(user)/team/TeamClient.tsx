"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import SideRays from "@/components/ui/SideRays";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface TeamClientProps {
  team: any[];
  settings: any;
}

export default function TeamClient({ team, settings }: TeamClientProps) {
  const contactEmail = settings?.contactEmail || "hello@growthbridge.live";

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-24">
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

      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[13px] font-bold text-[#111111] hover:border-[#111111] transition-all"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </header>

      {/* Team page header */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 pt-36 relative z-20">
        <section className="mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
              <Sparkles size={13} className="text-[#F4C542]" /> Dynamic Squad
            </span>
            <h1 className="mt-4 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Meet our team
              <br />
              of builders.
            </h1>
            <p className="mt-6 max-w-[580px] text-[16px] leading-[1.75] text-[#6A6A6A]">
              We eliminate administrative filters. Our creators design, and our designers build. You talk directly with the engineers compiling your layout components.
            </p>
          </Reveal>
        </section>

        {/* Team Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <Reveal key={member._id || member.name} delay={i * 0.1}>
              <div className="group bg-white border border-[#E9E3DA] rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full">

                {/* Image container */}
                <div className="h-72 overflow-hidden relative bg-[#FCFBF8] border-b border-[#E9E3DA]">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FCFBF8] text-[#A8A296] text-[14px] font-bold">
                      No photo uploaded
                    </div>
                  )}
                  {member.featured && (
                    <span className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide bg-[#111111]/90 text-white rounded-full">
                      Partner
                    </span>
                  )}
                </div>

                {/* Profile detail */}
                <div className="p-8 flex-1 flex flex-col justify-between gap-6">
                  <div>
                    <h3 className="text-[22px] font-extrabold tracking-tight text-[#111111]">
                      {member.name}
                    </h3>
                    <p className="text-[13px] font-extrabold uppercase tracking-wider text-[#F4C542] mt-1">
                      {member.role}
                    </p>
                    <p className="text-[14px] leading-[1.65] text-[#6A6A6A] mt-4 font-medium">
                      {member.bio}
                    </p>
                  </div>

                  {/* Social contacts */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#E9E3DA]/60">
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-full border border-[#E9E3DA] bg-[#FCFBF8] flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
                      >
                        <InstagramIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="h-8 w-8 rounded-full border border-[#E9E3DA] bg-[#FCFBF8] flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </Reveal>
          ))}
        </section>

        {/* Final CTA link */}
        <section className="text-center bg-[#111111] text-white py-14 rounded-[36px] overflow-hidden relative shadow-lg mt-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.1)_0%,_transparent_60%)] pointer-events-none" />
          <Reveal delay={0.3}>
            <h3 className="text-[26px] sm:text-[32px] font-black tracking-tight mb-4">
              Have a build in mind?
            </h3>
            <p className="text-[14px] text-white/60 max-w-[420px] mx-auto mb-8">
              Reach out directly to discuss timelines, specifications, and operational directions.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4C542] hover:bg-white text-[#111111] px-6 py-3.5 text-[14px] font-bold transition-colors"
            >
              Start a Project
            </a>
          </Reveal>
        </section>

      </div>
    </main>
  );
}
